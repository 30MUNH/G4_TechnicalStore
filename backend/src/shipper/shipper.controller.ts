import { Body, Controller, Delete, Get, Param, Post, Put } from "routing-controllers";
import { Service } from "typedi";
import { ShipperService } from "./shipper.services";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";

@Service()
@Controller("/shippers")
export class ShipperController {
  constructor(
    private readonly shipperService: ShipperService
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
}
