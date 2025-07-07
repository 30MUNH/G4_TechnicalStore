import { Body, Controller, Get, Param, Patch, Post, Req, UseBefore, QueryParam, Delete } from "routing-controllers";
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

    /**
     * Lấy danh sách đơn hàng cho admin/staff/shipper với filter, search, sort, paging
     * GET /orders/admin?status=...&search=...&sort=...&page=...&limit=...
     */
    @Get("/admin")
    @UseBefore(Auth)
    async getAllOrdersForAdmin(
        @Req() req: any,
        @QueryParam("status") status: string,
        @QueryParam("search") search: string,
        @QueryParam("sort") sort: string,
        @QueryParam("page") page: number = 1,
        @QueryParam("limit") limit: number = 10
    ) {
        const user = req.user as AccountDetailsDto;
        // Chỉ cho phép admin, staff, shipper
        if (!this.isAdmin(user) && !this.isStaff(user) && !this.isShipper(user)) {
            return {
                message: "Không có quyền truy cập danh sách đơn hàng",
                error: "Unauthorized"
            };
        }
        try {
            const result = await this.orderService.getAllOrdersWithFilter({ status, search, sort, page, limit });
            return {
                message: "Lấy danh sách đơn hàng thành công",
                data: result.orders,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };
        } catch (error: any) {
            return {
                message: "Lấy danh sách đơn hàng thất bại",
                error: error.message
            };
        }
    }

    /**
     * Xóa đơn hàng (chỉ admin hoặc staff)
     * DELETE /orders/:id
     */
    @Delete(":id")
    @UseBefore(Auth)
    async deleteOrder(@Param("id") id: string, @Req() req: any) {
        const user = req.user as AccountDetailsDto;
        if (!this.isAdmin(user) && !this.isStaff(user)) {
            return {
                message: "Không có quyền xóa đơn hàng",
                error: "Unauthorized"
            };
        }
        try {
            await this.orderService.deleteOrderById(id);
            return {
                message: "Xóa đơn hàng thành công"
            };
        } catch (error: any) {
            return {
                message: "Xóa đơn hàng thất bại",
                error: error.message
            };
        }
    }

    // Helper method để kiểm tra quyền admin
    private isAdmin(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('admin') || false;
    }

    // Helper method để kiểm tra quyền staff
    private isStaff(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('staff') || false;
    }

    // Helper method để kiểm tra quyền shipper
    private isShipper(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('shipper') || false;
    }
} 