import { Body, Controller, Get, Param, Patch, Post, Req, UseBefore, QueryParam } from "routing-controllers";
import { Service } from "typedi";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";

@Service()
@Controller("/orders")
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) {}

    @Post()
    @UseBefore(Auth)
    async createOrder(
        @Req() req: any,
        @Body() createOrderDto: CreateOrderDto
    ) {
        const user = req.user as AccountDetailsDto;

        
        try {
            const order = await this.orderService.createOrder(user.username, createOrderDto);

            
            return {
                success: true,
                message: "Thanh toán thành công",
                data: order
            };
        } catch (error: any) {

            
            return {
                success: false,
                message: "Đặt hàng thất bại",
                error: error.message
            };
        }
    }

    @Get()
    @UseBefore(Auth)
    async getOrders(
        @Req() req: any,
        @QueryParam("page") page: number = 1,
        @QueryParam("limit") limit: number = 10
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 10;

            const orders = await this.orderService.getOrdersByUsername(
                user.username, 
                page, 
                limit
            );
            return {
                message: "Lấy danh sách đơn hàng thành công",
                data: orders.orders,
                pagination: {
                    page,
                    limit,
                    total: orders.total,
                    totalPages: Math.ceil(orders.total / limit)
                }
            };
        } catch (error: any) {
            return {
                message: "Lấy danh sách đơn hàng thất bại",
                error: error.message
            };
        }
    }

    @Get("/statistics")
    @UseBefore(Auth)
    async getStatistics(@Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            const statistics = await this.orderService.getOrderStatistics(user.username);
            return {
                message: "Lấy thống kê đơn hàng thành công",
                statistics
            };
        } catch (error: any) {
            return {
                message: "Lấy thống kê đơn hàng thất bại",
                error: error.message
            };
        }
    }

    @Get("/:id")
    @UseBefore(Auth)
    async getOrder(@Param("id") id: string, @Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            const order = await this.orderService.getOrderById(id);
            
            // Kiểm tra quyền xem order
            if (order.customer.username !== user.username && !this.isAdmin(user)) {
                return {
                    message: "Không có quyền xem đơn hàng này",
                    error: "Unauthorized"
                };
            }
            
            return {
                message: "Lấy thông tin đơn hàng thành công",
                order
            };
        } catch (error: any) {
            return {
                message: "Lấy thông tin đơn hàng thất bại",
                error: error.message
            };
        }
    }

    @Patch("/:id/status")
    @UseBefore(Auth)
    async updateOrderStatus(
        @Param("id") id: string,
        @Body() updateOrderDto: UpdateOrderDto,
        @Req() req: any
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const order = await this.orderService.updateOrderStatus(
                id,
                user.username,
                updateOrderDto
            );
            return {
                message: "Cập nhật trạng thái đơn hàng thành công",
                order
            };
        } catch (error: any) {
            return {
                message: "Cập nhật trạng thái đơn hàng thất bại",
                error: error.message
            };
        }
    }

    // Helper method để kiểm tra quyền admin
    private isAdmin(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('admin') || false;
    }
} 