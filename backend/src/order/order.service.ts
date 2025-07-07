import { Service } from 'typedi';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { CartService } from '@/Cart/cart.service';
import { Product } from '@/product/product.entity';
import { Account } from '@/auth/account/account.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderStatus, UpdateOrderDto } from './dtos/update-order.dto';
import { EntityNotFoundException } from '@/exceptions/http-exceptions';
import { DbConnection } from '@/database/dbConnection';
import { Cart } from '@/Cart/cart.entity';

@Service()
export class OrderService {
    constructor(
        private readonly cartService: CartService,
    ) {}

    private validateOrderStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: []
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    private isAdmin(account: Account): boolean {
        return account.role?.name?.toLowerCase().includes('admin') || false;
    }

    private isShipper(account: Account): boolean {
        return account.role?.name?.toLowerCase().includes('shipper') || false;
    }

    async createOrder(username: string, createOrderDto: CreateOrderDto): Promise<Order> {

        
        if (!createOrderDto.shippingAddress) {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        const shippingAddress = createOrderDto.shippingAddress.trim();
        if (!shippingAddress) {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {

            // Bước 1: Lấy account và kiểm tra tồn tại

            const account = await transactionalEntityManager.findOne(Account, { 
                where: { username },
                relations: ['role']
            });
            
            if (!account) {

                throw new EntityNotFoundException('Account');
            }
            


            // Bước 2: Lấy cart TRONG transaction


            const cart = await transactionalEntityManager.findOne(Cart, {
                where: { account: { id: account.id } },
                relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
            });

            if (!cart) {

                throw new EntityNotFoundException('Cart');
            }


            
            // Bước 3: Kiểm tra cart không trống
            if (!cart.cartItems || cart.cartItems.length === 0) {

                throw new Error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
            }

            // Bước 4: Validate từng sản phẩm trong cart

            const invalidItems = [];
            
            for (const cartItem of cart.cartItems) {
                if (!cartItem.product.isActive) {
                    invalidItems.push(`${cartItem.product.name} (không còn hoạt động)`);
                }
                if (cartItem.product.stock < cartItem.quantity) {
                    invalidItems.push(`${cartItem.product.name} (không đủ tồn kho: còn ${cartItem.product.stock}, cần ${cartItem.quantity})`);
                }
            }

            if (invalidItems.length > 0) {

                throw new Error(`Một số sản phẩm trong giỏ hàng không hợp lệ: ${invalidItems.join(', ')}`);
            }

            // Bước 5: Validate giá sản phẩm và lock products


            const productIds = cart.cartItems.map(item => item.product.id);
            const products = await transactionalEntityManager
                .createQueryBuilder(Product, 'product')
                .setLock('pessimistic_write')
                .where('product.id IN (:...ids)', { ids: productIds })
                .getMany();

            const priceChanges = [];
            const stockIssues = [];

            for (const cartItem of cart.cartItems) {
                const latestProduct = products.find(p => p.id === cartItem.product.id);
                if (!latestProduct) {
                    throw new Error(`Sản phẩm ${cartItem.product.name} không tồn tại`);
                }
                
                // Kiểm tra giá có thay đổi
                if (latestProduct.price !== cartItem.product.price) {
                    priceChanges.push({
                        name: latestProduct.name,
                        oldPrice: cartItem.product.price,
                        newPrice: latestProduct.price
                    });
                }
                
                // Kiểm tra tồn kho
                if (!latestProduct.isActive) {
                    stockIssues.push(`${latestProduct.name} (sản phẩm không còn hoạt động)`);
                } else if (latestProduct.stock < cartItem.quantity) {
                    stockIssues.push(`${latestProduct.name} (không đủ tồn kho: còn ${latestProduct.stock}, cần ${cartItem.quantity})`);
                }
            }

            if (priceChanges.length > 0) {

                const changeDetails = priceChanges.map(change => 
                    `${change.name}: ${change.oldPrice} → ${change.newPrice}`
                ).join(', ');
                throw new Error(`Giá sản phẩm đã thay đổi, vui lòng kiểm tra lại giỏ hàng: ${changeDetails}`);
            }

            if (stockIssues.length > 0) {

                throw new Error(`Một số sản phẩm có vấn đề về tồn kho: ${stockIssues.join(', ')}`);
            }



            // Bước 6: Tạo order entity

            const order = new Order();
            order.customer = cart.account;
            order.orderDate = new Date();
            order.status = OrderStatus.PENDING;
            order.totalAmount = cart.totalAmount;
            order.shippingAddress = createOrderDto.shippingAddress || '';
            order.note = createOrderDto.note || '';
            

            
            await transactionalEntityManager.save(order);


            // Bước 7: Tạo order details và cập nhật stock

            let orderDetailCount = 0;
            
            for (const cartItem of cart.cartItems) {
                const product = products.find(p => p.id === cartItem.product.id)!;



                const orderDetail = new OrderDetail();
                orderDetail.order = order;
                orderDetail.product = product;
                orderDetail.quantity = cartItem.quantity;
                orderDetail.price = product.price;
                await transactionalEntityManager.save(orderDetail);

                orderDetailCount++;


                // Cập nhật stock
                const oldStock = product.stock;
                product.stock -= cartItem.quantity;
                await transactionalEntityManager.save(product);

            }

            // Bước 8: Clear cart TRONG transaction

            if (cart.cartItems && cart.cartItems.length > 0) {
                const removedItemsCount = cart.cartItems.length;
                await transactionalEntityManager.remove(cart.cartItems);
            }
            
            cart.totalAmount = 0;
            await transactionalEntityManager.save(cart);

            // Bước 9: Lấy order với đầy đủ thông tin
            const finalOrder = await transactionalEntityManager.findOne(Order, {
                where: { id: order.id },
                relations: [
                    'customer',
                    'shipper',
                    'orderDetails',
                    'orderDetails.product'
                ]
            });

            if (!finalOrder) {
                throw new Error('Lỗi khi lấy thông tin đơn hàng vừa tạo');
            }


            
            return finalOrder;
        });
    }

    async getOrderById(orderId: string): Promise<Order> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: [
                'customer',
                'shipper',
                'orderDetails',
                'orderDetails.product'
            ]
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        return order;
    }

    async getOrdersByUsername(
        username: string, 
        page: number = 1, 
        limit: number = 10
    ): Promise<{ orders: Order[]; total: number }> {
        const account = await Account.findOne({ where: { username } });
        if (!account) {
            throw new EntityNotFoundException('Account');
        }

        const skip = (page - 1) * limit;

        // Tối ưu query với eager loading và pagination
        const [orders, total] = await Order.findAndCount({
            where: { customer: { id: account.id } },
            relations: [
                'customer',
                'shipper',
                'orderDetails',
                'orderDetails.product'
            ],
            order: { orderDate: 'DESC' },
            skip,
            take: limit
        });

        return { orders, total };
    }

    async updateOrderStatus(
        orderId: string,
        username: string,
        updateOrderDto: UpdateOrderDto
    ): Promise<Order> {
        return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            const order = await this.getOrderById(orderId);
            const account = await Account.findOne({ 
                where: { username },
                relations: ['role']
            });

            if (!account) {
                throw new EntityNotFoundException('Account');
            }

            const isAdmin = this.isAdmin(account);
            if (order.customer.id !== account.id && !isAdmin) {
                throw new Error('Không có quyền cập nhật đơn hàng này');
            }

            if (!this.validateOrderStatusTransition(order.status, updateOrderDto.status)) {
                throw new Error(`Không thể chuyển trạng thái từ ${order.status} sang ${updateOrderDto.status}`);
            }

            if (updateOrderDto.status === OrderStatus.CANCELLED) {
                if (!updateOrderDto.cancelReason?.trim()) {
                    throw new Error('Vui lòng cung cấp lý do hủy đơn hàng');
                }
                order.cancelReason = updateOrderDto.cancelReason.trim();

                // Hoàn trả số lượng vào kho
                for (const detail of order.orderDetails) {
                    const product = await transactionalEntityManager.findOne(Product, {
                        where: { id: detail.product.id }
                    });
                    if (product) {
                        product.stock += detail.quantity;
                        await transactionalEntityManager.save(product);
                    }
                }
            }

            order.status = updateOrderDto.status;
            
            // Chỉ admin mới có thể gán shipper, và chỉ khi chuyển sang trạng thái SHIPPING
            if (updateOrderDto.status === OrderStatus.SHIPPING && isAdmin) {
                // Kiểm tra xem account có phải là shipper không
                const isShipper = this.isShipper(account);
                if (isShipper) {
                    order.shipper = account;
                } else {
                    throw new Error('Chỉ có thể gán shipper cho đơn hàng');
                }
            }

            await transactionalEntityManager.save(order);
            
            // Lấy order đã cập nhật với đầy đủ thông tin
            const updatedOrder = await transactionalEntityManager.findOne(Order, {
                where: { id: orderId },
                relations: [
                    'customer',
                    'shipper',
                    'orderDetails',
                    'orderDetails.product'
                ]
            });

            if (!updatedOrder) {
                throw new Error('Lỗi khi lấy thông tin đơn hàng đã cập nhật');
            }

            return updatedOrder;
        });
    }

    async getOrderStatistics(username: string): Promise<{
        total: number;
        pending: number;
        processing: number;
        shipping: number;
        delivered: number;
        cancelled: number;
    }> {
        const account = await Account.findOne({ where: { username } });
        if (!account) {
            throw new EntityNotFoundException('Account');
        }

        const [orders] = await Order.findAndCount({
            where: { customer: { id: account.id } }
        });

        const statistics = {
            total: orders.length,
            pending: 0,
            processing: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            switch (order.status) {
                case OrderStatus.PENDING:
                    statistics.pending++;
                    break;
                case OrderStatus.PROCESSING:
                    statistics.processing++;
                    break;
                case OrderStatus.SHIPPING:
                    statistics.shipping++;
                    break;
                case OrderStatus.DELIVERED:
                    statistics.delivered++;
                    break;
                case OrderStatus.CANCELLED:
                    statistics.cancelled++;
                    break;
            }
        });

        return statistics;
    }

    async getOrdersByShipperId(
        shipperId: string,
        options: { status?: string; search?: string; sort?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; total: number }> {
        const { status, search, sort, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // Xây dựng query
        let query = Order.createQueryBuilder("order")
            .leftJoinAndSelect("order.customer", "customer")
            .leftJoinAndSelect("order.shipper", "shipper")
            .leftJoinAndSelect("order.orderDetails", "orderDetails")
            .leftJoinAndSelect("orderDetails.product", "product")
            .where("order.shipper.id = :shipperId", { shipperId });

        // Filter theo status
        if (status && status.trim()) {
            query = query.andWhere("order.status = :status", { status: status.trim() });
        }

        // Search theo order ID hoặc customer name
        if (search && search.trim()) {
            query = query.andWhere(
                "(CAST(order.id AS TEXT) LIKE :search OR COALESCE(customer.name, '') LIKE :search OR customer.username LIKE :search)",
                { search: `%${search.trim()}%` }
            );
        }

        // Sắp xếp
        if (sort === "amount") {
            query = query.orderBy("order.totalAmount", "DESC");
        } else if (sort === "customer") {
            query = query.orderBy("COALESCE(customer.name, customer.username)", "ASC");
        } else {
            query = query.orderBy("order.orderDate", "DESC");
        }

        const [orders, total] = await query.skip(skip).take(limit).getManyAndCount();
        return { orders, total };
    }

    async updateOrderStatusByShipper(
        orderId: string,
        shipperId: string,
        updateData: { status: string; reason?: string }
    ): Promise<Order> {
        return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            // Lấy order với đầy đủ thông tin
            const order = await transactionalEntityManager.findOne(Order, {
                where: { id: orderId },
                relations: ['customer', 'shipper', 'orderDetails', 'orderDetails.product']
            });

            if (!order) {
                throw new EntityNotFoundException('Order');
            }

            // Kiểm tra quyền: chỉ shipper được assign mới có thể cập nhật
            if (!order.shipper || order.shipper.id !== shipperId) {
                throw new Error('Không có quyền cập nhật đơn hàng này');
            }

            // Validate status transition cho shipper (sử dụng Vietnamese enum values)
            const validShipperTransitions: Record<string, string[]> = {
                'Đang xử lý': ['Đang giao', 'Đã hủy'],
                'Đang giao': ['Đã giao', 'Đã hủy']
            };

            const currentStatus = order.status;
            const newStatus = updateData.status;

            if (!validShipperTransitions[currentStatus]?.includes(newStatus)) {
                throw new Error(`Shipper không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}`);
            }

            // Cập nhật trạng thái
            order.status = newStatus as OrderStatus;

            // Xử lý trường hợp hủy đơn
            if (newStatus === 'Đã hủy') {
                if (!updateData.reason?.trim()) {
                    throw new Error('Vui lòng cung cấp lý do hủy đơn hàng');
                }
                order.cancelReason = updateData.reason.trim();

                // Hoàn trả số lượng vào kho
                for (const detail of order.orderDetails) {
                    const product = await transactionalEntityManager.findOne(Product, {
                        where: { id: detail.product.id }
                    });
                    if (product) {
                        product.stock += detail.quantity;
                        await transactionalEntityManager.save(product);
                    }
                }
            }

            await transactionalEntityManager.save(order);

            // Lấy order đã cập nhật với đầy đủ thông tin
            const updatedOrder = await transactionalEntityManager.findOne(Order, {
                where: { id: orderId },
                relations: ['customer', 'shipper', 'orderDetails', 'orderDetails.product']
            });

            if (!updatedOrder) {
                throw new Error('Lỗi khi lấy thông tin đơn hàng đã cập nhật');
            }

            return updatedOrder;
        });
    }
} 