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
            throw new Error('Shipping address cannot be empty');
        }

        const shippingAddress = createOrderDto.shippingAddress.trim();
        if (!shippingAddress) {
            throw new Error('Shipping address cannot be empty');
        }

        return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            // Step 1: Get account and check existence
            const account = await transactionalEntityManager.findOne(Account, { 
                where: { username },
                relations: ['role']
            });
            
            if (!account) {
                throw new EntityNotFoundException('Account');
            }

            // Step 2: Get cart WITHIN transaction
            const cart = await transactionalEntityManager.findOne(Cart, {
                where: { account: { id: account.id } },
                relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
            });

            if (!cart) {
                throw new EntityNotFoundException('Cart');
            }
            
            // Step 3: Check cart is not empty
            if (!cart.cartItems || cart.cartItems.length === 0) {
                throw new Error('Cart is empty. Please add products before placing order.');
            }

            // Step 4: Validate each product in cart
            const invalidItems = [];
            
            for (const cartItem of cart.cartItems) {
                if (!cartItem.product.isActive) {
                    invalidItems.push(`${cartItem.product.name} (no longer active)`);
                }
                if (cartItem.product.stock < cartItem.quantity) {
                    invalidItems.push(`${cartItem.product.name} (insufficient stock: available ${cartItem.product.stock}, needed ${cartItem.quantity})`);
                }
            }

            if (invalidItems.length > 0) {
                throw new Error(`Some products in cart are invalid: ${invalidItems.join(', ')}`);
            }

            // Step 5: Validate product prices and lock products
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
                    throw new Error(`Product ${cartItem.product.name} does not exist`);
                }
                
                // Check price changes
                if (latestProduct.price !== cartItem.product.price) {
                    priceChanges.push({
                        name: latestProduct.name,
                        oldPrice: cartItem.product.price,
                        newPrice: latestProduct.price
                    });
                }
                
                // Check stock
                if (!latestProduct.isActive) {
                    stockIssues.push(`${latestProduct.name} (product no longer active)`);
                } else if (latestProduct.stock < cartItem.quantity) {
                    stockIssues.push(`${latestProduct.name} (insufficient stock: available ${latestProduct.stock}, needed ${cartItem.quantity})`);
                }
            }

            if (priceChanges.length > 0) {
                const changeDetails = priceChanges.map(change => 
                    `${change.name}: ${change.oldPrice} → ${change.newPrice}`
                ).join(', ');
                throw new Error(`Product prices have changed, please review cart: ${changeDetails}`);
            }

            if (stockIssues.length > 0) {
                throw new Error(`Some products have stock issues: ${stockIssues.join(', ')}`);
            }

            // Step 6: Create order entity
            const order = new Order();
            order.customer = cart.account;
            order.orderDate = new Date();
            order.status = OrderStatus.PENDING;
            order.totalAmount = cart.totalAmount;
            order.shippingAddress = createOrderDto.shippingAddress || '';
            order.note = createOrderDto.note || '';
            order.paymentMethod = createOrderDto.paymentMethod || 'Chưa chọn';
            
            await transactionalEntityManager.save(order);

            // Step 7: Create order details and update stock
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

                // Update stock
                const oldStock = product.stock;
                product.stock -= cartItem.quantity;
                await transactionalEntityManager.save(product);
            }

            // Step 8: Clear cart WITHIN transaction
            if (cart.cartItems && cart.cartItems.length > 0) {
                await transactionalEntityManager.remove(cart.cartItems);
            }
            cart.totalAmount = 0;
            await transactionalEntityManager.save(cart);

            // Step 9: Return order with relations
            const savedOrder = await transactionalEntityManager.findOne(Order, {
                where: { id: order.id },
                relations: [
                    'customer', 
                    'customer.role',
                    'orderDetails', 
                    'orderDetails.product',
                    'orderDetails.product.category',
                    'orderDetails.product.images'
                ]
            });

            if (!savedOrder) {
                throw new Error('Failed to retrieve created order');
            }

            return savedOrder;
        });
    }

    async getOrderById(orderId: string): Promise<Order> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: [
                'customer',
                'customer.role',
                'orderDetails',
                'orderDetails.product',
                'orderDetails.product.category',
                'orderDetails.product.images'
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
        const offset = (page - 1) * limit;
        
        const [orders, total] = await Order.findAndCount({
            where: { customer: { username } },
            relations: [
                'customer',
                'customer.role',
                'orderDetails',
                'orderDetails.product',
                'orderDetails.product.category',
                'orderDetails.product.images'
            ],
            order: { orderDate: 'DESC' },
            skip: offset,
            take: limit
        });

        return { orders, total };
    }

    async updateOrderStatus(
        orderId: string,
        username: string,
        updateOrderDto: UpdateOrderDto
    ): Promise<Order> {
        const account = await Account.findOne({ 
            where: { username },
            relations: ['role']
        });
        
        if (!account) {
            throw new EntityNotFoundException('Account');
        }

        const order = await Order.findOne({
            where: { id: orderId },
            relations: ['customer', 'customer.role']
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        // Check permissions
        const isOrderOwner = order.customer.username === username;
        const hasAdminAccess = this.isAdmin(account) || this.isShipper(account);

        if (!isOrderOwner && !hasAdminAccess) {
            throw new Error('Access denied to update this order');
        }

        // Validate status transition
        if (!this.validateOrderStatusTransition(order.status, updateOrderDto.status)) {
            throw new Error(`Invalid status transition from ${order.status} to ${updateOrderDto.status}`);
        }

        // Update order
        order.status = updateOrderDto.status;
        if (updateOrderDto.cancelReason) {
            order.cancelReason = updateOrderDto.cancelReason;
        }

        await order.save();

        // Return updated order with full relations
        return await this.getOrderById(orderId);
    }

    async getOrderStatistics(username: string): Promise<{
        total: number;
        pending: number;
        processing: number;
        shipping: number;
        delivered: number;
        cancelled: number;
    }> {
        const baseQuery = Order.createQueryBuilder('order')
            .leftJoin('order.customer', 'customer')
            .where('customer.username = :username', { username });

        const [
            total,
            pending,
            processing,
            shipping,
            delivered,
            cancelled
        ] = await Promise.all([
            baseQuery.getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.PENDING }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.PROCESSING }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.SHIPPING }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.DELIVERED }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.CANCELLED }).getCount()
        ]);

        return {
            total,
            pending,
            processing,
            shipping,
            delivered,
            cancelled
        };
    }

    async getOrdersByShipperId(
        shipperId: string,
        options: { status?: string; search?: string; sort?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; total: number }> {
        const { status, search, sort = 'orderDate', page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        let queryBuilder = Order.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('customer.role', 'customerRole')
            .leftJoinAndSelect('order.orderDetails', 'orderDetails')
            .leftJoinAndSelect('orderDetails.product', 'product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('order.shipper', 'shipper')
            .where('shipper.id = :shipperId', { shipperId });

        if (status) {
            queryBuilder = queryBuilder.andWhere('order.status = :status', { status });
        }

        if (search) {
            queryBuilder = queryBuilder.andWhere(
                '(customer.username ILIKE :search OR order.id::text ILIKE :search OR order.shippingAddress ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (sort === 'orderDate') {
            queryBuilder = queryBuilder.orderBy('order.orderDate', 'DESC');
        } else if (sort === 'totalAmount') {
            queryBuilder = queryBuilder.orderBy('order.totalAmount', 'DESC');
        }

        const [orders, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return { orders, total };
    }

    async updateOrderStatusByShipper(
        orderId: string,
        shipperId: string,
        updateData: { status: string; reason?: string }
    ): Promise<Order> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: ['customer', 'shipper']
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        // Check if shipper is assigned to this order
        if (!order.shipper || order.shipper.id !== shipperId) {
            throw new Error('Access denied - shipper not assigned to this order');
        }

        // Validate status transition for shipper
        const currentStatus = order.status as OrderStatus;
        const newStatus = updateData.status as OrderStatus;
        
        if (!this.validateOrderStatusTransition(currentStatus, newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }

        // Update order
        order.status = newStatus;
        if (updateData.reason && newStatus === OrderStatus.CANCELLED) {
            order.cancelReason = updateData.reason;
        }

        await order.save();

        // Return updated order with relations
        return await this.getOrderById(orderId);
    }

    async getAllOrdersWithFilter(options: { status?: string; search?: string; sort?: string; page?: number; limit?: number }): Promise<{ orders: Order[]; total: number }> {
        const { status, search, sort = 'orderDate', page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        let queryBuilder = Order.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('customer.role', 'customerRole')
            .leftJoinAndSelect('order.orderDetails', 'orderDetails')
            .leftJoinAndSelect('orderDetails.product', 'product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('order.shipper', 'shipper');

        if (status) {
            queryBuilder = queryBuilder.where('order.status = :status', { status });
        }

        if (search) {
            const whereClause = status ? 'andWhere' : 'where';
            queryBuilder = queryBuilder[whereClause](
                '(customer.username ILIKE :search OR order.id::text ILIKE :search OR order.shippingAddress ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (sort === 'orderDate') {
            queryBuilder = queryBuilder.orderBy('order.orderDate', 'DESC');
        } else if (sort === 'totalAmount') {
            queryBuilder = queryBuilder.orderBy('order.totalAmount', 'DESC');
        }

        const [orders, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return { orders, total };
    }

    async deleteOrderById(orderId: string): Promise<void> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: ['orderDetails']
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        await order.remove();
    }
} 