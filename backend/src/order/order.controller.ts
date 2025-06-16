import { Body, Controller, Get, Param, Patch, Post, Req, UseBefore } from "routing-controllers";
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
                message: "Đặt hàng thành công",
                order
            };
        } catch (error: any) {
            return {
                message: "Đặt hàng thất bại",
                error: error.message
            };
        }
    }

    @Get()
    @UseBefore(Auth)
    async getOrders(@Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            const orders = await this.orderService.getOrdersByUsername(user.username);
            return {
                message: "Lấy danh sách đơn hàng thành công",
                orders
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
    async getOrder(@Param("id") id: string) {
        try {
            const order = await this.orderService.getOrderById(id);
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
} 