import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { ShipperService } from "./shipper.services";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";
import { OrderService } from "../order/order.service";
import { Auth } from "../middlewares/auth.middleware";

@Service()
@Controller("/shippers")
export class ShipperController {
  constructor(
    private readonly shipperService: ShipperService,
    private readonly orderService: OrderService
  ) {}

  @Post("/")
  async createShipper(@Body() createShipperDto: CreateShipperDto) {
    try {
      const shipper = await this.shipperService.createShipper(createShipperDto);
      return {
        success: true,
        data: shipper,
        message: "Shipper created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create shipper",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/")
  async getAllShippers() {
    try {
      const shippers = await this.shipperService.getAllShippers();
      return {
        success: true,
        data: shippers,
        message: "Shippers retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve shippers",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/available")
  async getAvailableShippers() {
    try {
      const shippers = await this.shipperService.getAvailableShippers();
      return {
        success: true,
        data: shippers,
        message: "Available shippers retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve available shippers",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/:id")
  async getShipperById(@Param("id") id: string) {
    try {
      const shipper = await this.shipperService.getShipperById(id);
      return {
        success: true,
        data: shipper,
        message: "Shipper retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve shipper",
        error: error.message || "Unknown error"
      };
    }
  }

  @Put("/:id")
  async updateShipper(
    @Param("id") id: string,
    @Body() updateShipperDto: UpdateShipperDto
  ) {
    try {
      const shipper = await this.shipperService.updateShipper(id, updateShipperDto);
      return {
        success: true,
        data: shipper,
        message: "Shipper updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update shipper",
        error: error.message || "Unknown error"
      };
    }
  }

  @Delete("/:id")
  async deleteShipper(@Param("id") id: string) {
    try {
      await this.shipperService.deleteShipper(id);
      return {
        success: true,
        message: "Shipper deleted successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to delete shipper",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/:id/orders")
  @UseBefore(Auth)
  async getOrdersByShipper(
    @Param("id") shipperId: string,
    @QueryParam("status") status: string,
    @QueryParam("search") search: string,
    @QueryParam("sort") sort: string,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    try {
      // Validate pagination parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      const result = await this.orderService.getOrdersByShipperId(
        shipperId, 
        { status, search, sort, page, limit }
      );
      
      return {
        success: true,
        data: result.orders,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        message: "Orders retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve orders",
        error: error.message || "Unknown error"
      };
    }
  }

  @Put("/:shipperId/orders/:orderId/status")
  @UseBefore(Auth)
  async updateOrderStatusByShipper(
    @Param("shipperId") shipperId: string,
    @Param("orderId") orderId: string,
    @Body() updateData: { status: string; reason?: string }
  ) {
    try {
      const order = await this.orderService.updateOrderStatusByShipper(
        orderId,
        shipperId,
        updateData
      );
      
      return {
        success: true,
        data: order,
        message: "Order status updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update order status",
        error: error.message || "Unknown error"
      };
    }
  }
}
