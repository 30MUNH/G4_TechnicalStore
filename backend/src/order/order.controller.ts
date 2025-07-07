import { Body, Controller, Get, Param, Patch, Post, Req, UseBefore, QueryParam, Delete } from "routing-controllers";
import { Service } from "typedi";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";
import { HttpException } from "@/exceptions/http-exceptions";

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
                message: "Payment successful",
                data: order
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Order creation failed",
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
                message: "Orders retrieved successfully",
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
                message: "Failed to retrieve orders",
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
                message: "Order statistics retrieved successfully",
                statistics
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve order statistics",
                error: error.message
            };
        }
    }

    /**
     * Get orders list for admin/staff/shipper with filter, search, sort, paging
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
        
        // Only allow admin, staff, shipper
        if (!this.isAdmin(user) && !this.isStaff(user) && !this.isShipper(user)) {
            throw new HttpException(401, "Access denied to orders list");
        }
        
        try {
            const result = await this.orderService.getAllOrdersWithFilter({ status, search, sort, page, limit });
            return {
                message: "Orders retrieved successfully",
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
                message: "Failed to retrieve orders",
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
            
            // Check permission to view order
            if (order.customer.username !== user.username && !this.isAdmin(user)) {
                throw new HttpException(401, "Access denied to view this order");
            }
            
            return {
                message: "Order retrieved successfully",
                order
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve order",
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
                message: "Order status updated successfully",
                order
            };
        } catch (error: any) {
            return {
                message: "Failed to update order status",
                error: error.message
            };
        }
    }

    /**
     * Delete order (admin or staff only)
     * DELETE /orders/:id
     */
    @Delete(":id")
    @UseBefore(Auth)
    async deleteOrder(@Param("id") id: string, @Req() req: any) {
        const user = req.user as AccountDetailsDto;
        if (!this.isAdmin(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to delete order");
        }
        try {
            await this.orderService.deleteOrderById(id);
            return {
                message: "Order deleted successfully"
            };
        } catch (error: any) {
            return {
                message: "Failed to delete order",
                error: error.message
            };
        }
    }

    // Helper method to check admin role
    private isAdmin(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('admin') || false;
    }

    // Helper method to check staff role
    private isStaff(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('staff') || false;
    }

    // Helper method to check shipper role
    private isShipper(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('shipper') || false;
    }
} 