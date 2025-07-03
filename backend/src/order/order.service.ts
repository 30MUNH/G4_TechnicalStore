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
        const cart = await this.cartService.viewCart(username);
        if (!cart.cartItems || cart.cartItems.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        if (!createOrderDto.shippingAddress) {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        const shippingAddress = createOrderDto.shippingAddress.trim();
        if (!shippingAddress) {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        const priceValidation = await this.cartService.validateCartPrices(username);
        if (priceValidation.hasChanges) {
            throw new Error('Giá sản phẩm đã thay đổi, vui lòng kiểm tra lại giỏ hàng');
        }

        return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            const productIds = cart.cartItems.map(item => item.product.id);
            const products = await transactionalEntityManager
                .createQueryBuilder(Product, 'product')
                .setLock('pessimistic_write')
                .where('product.id IN (:...ids)', { ids: productIds })
                .getMany();

            for (const cartItem of cart.cartItems) {
                const product = products.find(p => p.id === cartItem.product.id);
                if (!product) {
                    throw new Error(`Sản phẩm ${cartItem.product.name} không tồn tại`);
                }
                if (!product.isActive) {
                    throw new Error(`Sản phẩm ${product.name} hiện không khả dụng`);
                }
                if (product.stock < cartItem.quantity) {
                    throw new Error(`Sản phẩm ${product.name} không đủ số lượng trong kho (còn ${product.stock}, cần ${cartItem.quantity})`);
                }
            }

            const order = new Order();
            order.customer = cart.account;
            order.orderDate = new Date();
            order.status = OrderStatus.PENDING;
            order.totalAmount = cart.totalAmount;
            order.shippingAddress = createOrderDto.shippingAddress || '';
            order.note = createOrderDto.note || '';
            await transactionalEntityManager.save(order);

            for (const cartItem of cart.cartItems) {
                const product = products.find(p => p.id === cartItem.product.id)!;

                const orderDetail = new OrderDetail();
                orderDetail.order = order;
                orderDetail.product = product;
                orderDetail.quantity = cartItem.quantity;
                orderDetail.price = product.price;
                await transactionalEntityManager.save(orderDetail);

                product.stock -= cartItem.quantity;
                await transactionalEntityManager.save(product);
            }

            await this.cartService.clearCart(username);

            return this.getOrderById(order.id);
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
            return this.getOrderById(order.id);
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

        const orders = await Order.find({
            where: { customer: { id: account.id } }
        });

        return {
            total: orders.length,
            pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
            processing: orders.filter(o => o.status === OrderStatus.PROCESSING).length,
            shipping: orders.filter(o => o.status === OrderStatus.SHIPPING).length,
            delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
            cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length
        };
    }
} 