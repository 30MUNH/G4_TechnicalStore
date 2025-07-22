import { Controller, Post, Body, Get, Param, UseBefore, Put } from "routing-controllers";
import { Service } from "typedi";
import { OrderAssignmentService } from "./orderAssignment.service";
import { Order } from "@/order/order.entity";
import { OrderService } from "@/order/order.service";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { Account } from "@/auth/account/account.entity";
import { ShipperZone } from "./shipperZone.entity";

@Controller('/api/order-assignment')
@Service()
export class OrderAssignmentController {
  constructor(
    private readonly orderAssignmentService: OrderAssignmentService,
    private readonly orderService: OrderService
  ) {}

  /**
   * Endpoint để chạy tự động phân công cho 1 đơn hàng
   */
  @Post('/run-assignment/:orderId')
  @UseBefore(Admin)
  async runAssignment(
    @Param('orderId') orderId: string,
    @Body() body: any
  ) {
    try {
      console.log(`[API] Run assignment for order ${orderId}`);
      
      const order = await Order.findOne({ 
        where: { id: orderId },
        relations: ['shipper', 'customer'] 
      });
      
      if (!order) {
        return {
          success: false,
          message: 'Order not found'
        };
      }
      
      // Log các chi tiết về đơn hàng
      console.log(`[API] Order details:`);
      console.log(`- Address: ${order.shippingAddress}`);
      console.log(`- Current shipper: ${order.shipper?.name || 'None'}`);
      
      // Chạy phân công
      const result = await this.orderAssignmentService.assignOrderToShipper(order);
      
      return {
        success: result.success,
        message: result.message,
        shipper: result.shipper ? {
          id: result.shipper.id,
          name: result.shipper.name,
          username: result.shipper.username
        } : null,
        orderAddress: order.shippingAddress,
        details: result.details
      };
    } catch (error) {
      console.error('[API] Error running assignment:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`,
        details: {
          stack: (error as Error).stack
        }
      };
    }
  }
  
  /**
   * Lấy danh sách vùng của một shipper
   */
  @Get('/shipper-zones/:shipperId')
  @UseBefore(Auth)
  async getShipperZones(
    @Param('shipperId') shipperId: string
  ) {
    try {
      const zones = await ShipperZone.find({
        where: { shipper: { id: shipperId } }
      });
      
      if (!zones || zones.length === 0) {
        return {
          success: true,
          message: 'No zones found for this shipper',
          zones: []
        };
      }
      
      return {
        success: true,
        message: `Found ${zones.length} zones`,
        zones: zones.map(zone => ({
          id: zone.id,
          province: zone.province,
          district: zone.district,
          ward: zone.ward
        }))
      };
    } catch (error) {
      console.error('[API] Error fetching shipper zones:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Lấy danh sách các khu vực có sẵn cho giao hàng
   */
  @Get('/available-zones')
  async getAvailableZones() {
    try {
      // Lấy tất cả các vùng từ database
      const zones = await ShipperZone.find();
      
      // Tạo danh sách các tỉnh/thành phố duy nhất
      const provinces = [...new Set(zones.map(zone => zone.province))].filter(Boolean).sort();
      
      // Tạo map các quận/huyện theo tỉnh/thành phố
      const districtsByProvince: {[province: string]: string[]} = {};
      
      for (const zone of zones) {
        if (!zone.province || !zone.district) continue;
        
        if (!districtsByProvince[zone.province]) {
          districtsByProvince[zone.province] = [];
        }
        
        if (!districtsByProvince[zone.province].includes(zone.district)) {
          districtsByProvince[zone.province].push(zone.district);
        }
      }
      
      // Sắp xếp các quận/huyện theo alphabet
      Object.keys(districtsByProvince).forEach(province => {
        districtsByProvince[province].sort();
      });
      
      return {
        success: true,
        data: {
          provinces,
          districtsByProvince
        },
        message: "Available zones retrieved successfully"
      };
    } catch (error) {
      console.error('[API] Error fetching available zones:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Endpoint để test matching địa chỉ với vùng của shipper
   */
  @Post('/test-address-matching')
  @UseBefore(Admin)
  async testAddressMatching(
    @Body() data: { 
      address: string;  // Địa chỉ giao hàng
      shipperId?: string // Optional, nếu muốn test với một shipper cụ thể
    }
  ) {
    try {
      console.log(`[API] Testing address matching for: "${data.address}"`);
      
      // Tạo đơn hàng tạm thời cho việc test
      const testOrder = new Order();
      testOrder.id = 'test-order-' + Date.now();
      testOrder.shippingAddress = data.address;
      
      // Phân tích địa chỉ
      const orderAddress = this.orderAssignmentService.testExtractOrderAddress(testOrder);
      
      if (!orderAddress) {
        return {
          success: false,
          message: 'Could not extract address from provided string',
          address: data.address
        };
      }
      
      let matchingResults = [];
      
      // Nếu có shipperId, chỉ test với shipper đó
      if (data.shipperId) {
        const zones = await ShipperZone.find({
          where: { shipper: { id: data.shipperId } },
          relations: ['shipper']
        });
        
        for (const zone of zones) {
          const isMatch = this.orderAssignmentService.testAddressMatching(zone, orderAddress);
          
          matchingResults.push({
            shipperId: data.shipperId,
            shipperName: zone.shipper?.name || 'Unknown',
            zone: {
              id: zone.id,
              province: zone.province,
              district: zone.district, 
              ward: zone.ward
            },
            isMatch: isMatch
          });
        }
      } else {
        // Test với tất cả zones
        const zones = await ShipperZone.find({
          relations: ['shipper']
        });
        
        for (const zone of zones) {
          const isMatch = this.orderAssignmentService.testAddressMatching(zone, orderAddress);
          
          matchingResults.push({
            shipperId: zone.shipper?.id || 'Unknown',
            shipperName: zone.shipper?.name || 'Unknown',
            zone: {
              id: zone.id,
              province: zone.province,
              district: zone.district, 
              ward: zone.ward
            },
            isMatch: isMatch
          });
        }
      }
      
      return {
        success: true,
        address: data.address,
        parsedAddress: orderAddress,
        matchingResults: matchingResults,
        matchingZonesCount: matchingResults.filter(r => r.isMatch).length
      };
      
    } catch (error) {
      console.error('[API] Error testing address matching:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`
      };
    }
  }

  /**
   * Cập nhật vùng làm việc của shipper
   * Chỉ Admin mới có quyền thực hiện thao tác này
   */
  @Put('/working-zone/:shipperId')
  @UseBefore(Admin)
  async updateWorkingZone(
    @Param('shipperId') shipperId: string,
    @Body() data: { workingZones: string[] }
  ) {
    try {
      console.log(`[API] Updating working zones for shipper ${shipperId}:`, data.workingZones);
      
      // Kiểm tra dữ liệu đầu vào
      if (!data.workingZones || !Array.isArray(data.workingZones)) {
        return {
          success: false,
          message: 'Invalid input: workingZones must be an array'
        };
      }

      // Gọi service để cập nhật vùng làm việc
      await this.orderAssignmentService.updateShipperWorkingZones(shipperId, data.workingZones);
      
      // Lấy thông tin shipper sau khi cập nhật
      const shipper = await Account.findOne({
        where: { id: shipperId },
        relations: ['role']
      });
      
      if (!shipper) {
        return {
          success: false,
          message: 'Shipper not found after update'
        };
      }
      
      // Lấy zones mới để trả về
      const zones = await ShipperZone.find({
        where: { shipper: { id: shipperId } }
      });
      
      return {
        success: true,
        data: {
          id: shipper.id,
          username: shipper.username,
          fullName: shipper.name,
          phone: shipper.phone,
          role: shipper.role,
          isRegistered: shipper.isRegistered,
          isAvailable: shipper.isAvailable,
          priority: shipper.priority,
          workingZones: zones.map(zone => zone.district)
        },
        message: 'Working zones updated successfully'
      };
      
    } catch (error) {
      console.error('[API] Error updating working zones:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`
      };
    }
  }
} 