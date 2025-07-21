import { Body, Controller, Get, Post, Put, Param, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { OrderAssignmentService } from "./orderAssignment.service";
import { OrderService } from "@/order/order.service";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { CronJobService } from "./cronJob.service";

interface WorkingZoneDto {
  workingZones: string[];
}

interface AvailabilityDto {
  isAvailable: boolean;
}

@Service()
@Controller("/shipping")
export class OrderAssignmentController {
  constructor(
    private readonly orderAssignmentService: OrderAssignmentService,
    private readonly orderService: OrderService,
    private readonly cronJobService: CronJobService
  ) {}

  /**
   * Tự động gán shipper cho đơn hàng
   */
  @Post("/orders/:orderId/assign-shipper")
  @UseBefore(Admin)
  async assignOrderToShipper(@Param("orderId") orderId: string) {
    try {
      const order = await this.orderService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: "Không tìm thấy đơn hàng"
        };
      }

      const result = await this.orderAssignmentService.assignOrderToShipper(order);
      return {
        success: result.success,
        data: result.shipper,
        message: result.message,
        score: result.score
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi phân loại đơn hàng",
        error: error.message
      };
    }
  }

  /**
   * Gán shipper hàng loạt cho các đơn hàng chưa có shipper
   */
  @Post("/orders/bulk-assign-shipper")
  @UseBefore(Admin)
  async assignMultipleOrders() {
    try {
      // Lấy tất cả đơn hàng chưa có shipper
      const unassignedOrders = await this.orderService.getUnassignedOrders();
      
      if (unassignedOrders.length === 0) {
        return {
          success: true,
          message: "Không có đơn hàng nào cần phân loại",
          data: { assignedCount: 0, totalCount: 0 }
        };
      }

      const results = await this.orderAssignmentService.assignMultipleOrders(unassignedOrders);
      
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      return {
        success: true,
        message: `Đã phân loại ${successCount}/${results.length} đơn hàng`,
        data: {
          assignedCount: successCount,
          failedCount,
          totalCount: results.length,
          results
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi phân loại hàng loạt",
        error: error.message
      };
    }
  }

  /**
   * Update shipper working zone
   */
  @Put("/shippers/:shipperId/working-zone")
  @UseBefore(Admin)
  async updateShipperWorkingZone(
    @Param("shipperId") shipperId: string,
    @Body() workingZoneData: WorkingZoneDto
  ) {
    try {
      await this.orderAssignmentService.updateShipperWorkingZones(shipperId, workingZoneData.workingZones);
      return {
        success: true,
        message: "Shipper working zone updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update shipper working zone",
        error: error.message
      };
    }
  }

  /**
   * Update shipper availability status
   */
  @Put("/shippers/:shipperId/availability")
  @UseBefore(Admin)
  async updateShipperAvailability(
    @Param("shipperId") shipperId: string,
    @Body() availability: AvailabilityDto
  ) {
    try {
      await this.orderAssignmentService.updateShipperAvailability(shipperId, availability.isAvailable);
      return {
        success: true,
        message: `Shipper availability updated to ${availability.isAvailable ? 'available' : 'unavailable'}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update shipper availability",
        error: error.message
      };
    }
  }

  /**
   * Reset daily order counts for all shippers
   */
  @Post("/shippers/reset-daily-counts")
  @UseBefore(Admin)
  async resetDailyOrderCounts() {
    try {
      await this.orderAssignmentService.resetDailyOrderCounts();
      return {
        success: true,
        message: "Daily order counts reset successfully for all shippers"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to reset daily order counts",
        error: error.message
      };
    }
  }

  /**
   * Tính toán lại số đơn hàng cho shipper cụ thể
   */
  @Post("/shippers/:shipperId/reset-order-count")
  @UseBefore(Admin)
  async resetShipperOrderCount(@Param("shipperId") shipperId: string) {
    try {
      // Tính toán lại số đơn hàng thực tế cho shipper cụ thể
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { Order } = await import("@/order/order.entity");
      const { OrderStatus } = await import("@/order/dtos/update-order.dto");
      const { Account } = await import("@/auth/account/account.entity");

      const currentOrdersCount = await Order.createQueryBuilder("order")
        .where("order.shipper.id = :shipperId", { shipperId })
        .andWhere("order.orderDate >= :today", { today })
        .andWhere("order.status IN (:...statuses)", { 
          statuses: [OrderStatus.PENDING, OrderStatus.SHIPPING] 
        })
        .getCount();

      await Account.createQueryBuilder("account")
        .update()
        .set({ 
          currentOrdersToday: currentOrdersCount,
          lastOrderDate: new Date()
        })
        .where("account.id = :shipperId", { shipperId })
        .execute();

      return {
        success: true,
        message: "Đã tính toán lại số đơn hàng thực tế cho shipper",
        data: { currentOrdersCount }
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi reset số đơn hàng cho shipper",
        error: error.message
      };
    }
  }

  /**
   * Lấy cấu hình hệ thống giao hàng
   */
  @Get("/config")
  @UseBefore(Admin)
  async getAssignmentConfig() {
    try {
      return {
        success: true,
        message: "Cấu hình hệ thống phân loại đơn hàng",
        data: {
          storeLocation: {
            province: "Hà Nội",
            district: "Cầu Giấy", 
            ward: "Dịch Vọng",
            latitude: 21.0285,
            longitude: 105.8542
          },
          distanceThresholds: {
            local: 50,      // ≤ 50km
            regional: 200,  // 51-200km
            national: 1000  // 201-1000km
          },
          deliveryTimes: {
            local: 2,        // giờ
            regional: 6,     // giờ
            national: 24,    // giờ
            international: 72 // giờ
          },
          deliveryMethods: {
            local: "local_shipper",
            regional: "local_shipper", 
            national: "express_shipping",
            international: "third_party"
          }
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi lấy cấu hình",
        error: error.message
      };
    }
  }

  /**
   * Lấy thống kê giao hàng
   */
  @Get("/statistics")
  @UseBefore(Admin)
  async getAssignmentStatistics() {
    try {
      const { Account } = await import("@/auth/account/account.entity");
      const { Role } = await import("@/auth/role/role.entity");
      const { Order } = await import("@/order/order.entity");

      // Lấy thông tin shipper
      const shipperRole = await Role.findOne({ where: { name: "shipper" } });
      const totalShippers = shipperRole ? await Account.count({ where: { role: { id: shipperRole.id } } }) : 0;
      const availableShippers = shipperRole ? await Account.count({ where: { role: { id: shipperRole.id }, isAvailable: true } }) : 0;

      // Lấy thông tin đơn hàng
      const totalOrders = await Order.count();
      const assignedOrders = await Order.count({ where: { shipper: { id: { not: null } } } as any });
      const unassignedOrders = totalOrders - assignedOrders;

      return {
        success: true,
        message: "Thống kê phân loại đơn hàng",
        data: {
          totalShippers,
          availableShippers,
          totalOrders,
          assignedOrders,
          unassignedOrders,
          assignmentRate: totalOrders > 0 ? Math.round((assignedOrders / totalOrders) * 100) : 0
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi lấy thống kê",
        error: error.message
      };
    }
  }

  /**
   * Lấy trạng thái cron jobs
   */
  @Get("/cron-jobs/status")
  @UseBefore(Admin)
  async getCronJobsStatus() {
    try {
      const status = this.cronJobService.getCronJobsStatus();
      return {
        success: true,
        message: "Trạng thái cron jobs",
        data: status
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi lấy trạng thái cron jobs",
        error: error.message
      };
    }
  }

  /**
   * Chạy reset số đơn hàng ngay lập tức
   */
  @Post("/cron-jobs/run-reset-now")
  @UseBefore(Admin)
  async runDailyOrderCountResetNow() {
    try {
      await this.cronJobService.runDailyOrderCountResetNow();
      return {
        success: true,
        message: "Đã chạy reset số đơn hàng thành công"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi chạy reset số đơn hàng",
        error: error.message
      };
    }
  }

  /**
   * Chạy auto-assignment ngay lập tức
   */
  @Post("/cron-jobs/run-auto-assignment-now")
  @UseBefore(Admin)
  async runAutoAssignmentNow() {
    try {
      await this.cronJobService.runAutoAssignmentNow();
      return {
        success: true,
        message: "Đã chạy auto-assignment thành công"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi khi chạy auto-assignment",
        error: error.message
      };
    }
  }

  /**
   * Manually trigger auto-assignment cho đơn hàng cụ thể
   */
  @Post("/orders/:orderId/manual-assign")
  async manualAssignOrder(@Param("orderId") orderId: string) {
    try {
      console.log(`[DEBUG] Manual assignment triggered for order ${orderId}`);
      
      const order = await this.orderService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: "Không tìm thấy đơn hàng"
        };
      }

      console.log(`[DEBUG] Found order: ${order.id}, address: ${order.shippingAddress}, status: ${order.status}`);
      
      // Kiểm tra xem đơn hàng đã có shipper chưa
      if (order.shipper) {
        return {
          success: false,
          message: `Đơn hàng đã được gán cho shipper ${order.shipper.name || order.shipper.id}`
        };
      }

      const result = await this.orderAssignmentService.assignOrderToShipper(order);
      
      console.log(`[DEBUG] Assignment result:`, result);
      
      return {
        success: result.success,
        data: result.shipper ? {
          shipperId: result.shipper.id,
          shipperName: result.shipper.name,
          score: result.score,
          distance: result.distance
        } : null,
        message: result.message
      };
      
    } catch (error: any) {
      console.error('[Error] Manual assignment failed:', error);
      return {
        success: false,
        message: "Lỗi khi phân loại đơn hàng",
        error: error.message
      };
    }
  }

  /**
   * Debug auto-assignment issues
   */
  @Get("/debug/auto-assignment")
  async debugAutoAssignment() {
    try {
      console.log('=== DEBUGGING AUTO-ASSIGNMENT ===');
      
      // 1. Kiểm tra có đơn hàng unassigned không
      const unassignedOrders = await this.orderService.getUnassignedOrders();
      console.log(`Found ${unassignedOrders.length} unassigned orders`);
      
      // 2. Kiểm tra có shipper nào trong hệ thống không
      const { Account } = await import("@/auth/account/account.entity");
      const { Role } = await import("@/auth/role/role.entity");
      const { ShipperZone } = await import("./shipperZone.entity");
      
      const shipperRole = await Role.findOne({ where: { name: "shipper" } });
      if (!shipperRole) {
        return { success: false, message: "Không tìm thấy role shipper" };
      }
      
      const allShippers = await Account.find({
        where: { role: { id: shipperRole.id } },
        relations: ["role"]
      });
      console.log(`Found ${allShippers.length} shippers total`);
      
      // 3. Kiểm tra shippers available
      const availableShippers = allShippers.filter(s => 
        s.isRegistered === true && 
        s.isAvailable === true &&
        (s.currentOrdersToday || 0) < (s.maxOrdersPerDay || 999)
      );
      console.log(`Found ${availableShippers.length} available shippers`);
      
      // 4. Kiểm tra working zones
      const shipperZones = await ShipperZone.find({ relations: ["shipper"] });
      console.log(`Found ${shipperZones.length} shipper zones total`);
      
      // 5. Nếu có đơn hàng và shipper, test assignment cho đơn hàng đầu tiên
      let testResult = null;
      if (unassignedOrders.length > 0 && availableShippers.length > 0) {
        const testOrder = unassignedOrders[0];
        console.log(`Testing assignment for order ${testOrder.id} with address: ${testOrder.shippingAddress}`);
        
        testResult = await this.orderAssignmentService.assignOrderToShipper(testOrder);
        console.log('Assignment result:', testResult);
      }
      
      return {
        success: true,
        data: {
          unassignedOrders: unassignedOrders.length,
          totalShippers: allShippers.length,
          availableShippers: availableShippers.length,
          shipperZones: shipperZones.length,
          shipperDetails: availableShippers.map(s => ({
            id: s.id,
            name: s.name,
            isAvailable: s.isAvailable,
            currentOrdersToday: s.currentOrdersToday || 0,
            maxOrdersPerDay: s.maxOrdersPerDay || 999
          })),
          zoneDetails: shipperZones.map(z => ({
            shipperId: z.shipper.id,
            shipperName: z.shipper.name,
            province: z.province,
            district: z.district,
            ward: z.ward
          })),
          testResult
        }
      };
      
    } catch (error: any) {
      console.error('Debug error:', error);
      return {
        success: false,
        message: "Debug failed",
        error: error.message
      };
    }
  }

  /**
   * Debug address extraction và matching
   */
  @Get("/debug/address-matching")
  async debugAddressMatching() {
    try {
      // Test với địa chỉ Thanh Xuân
      const testAddresses = [
        "123 Đường ABC, Phường Thanh Xuân, Quận Thanh Xuân, Hà Nội",
        "456 Đường XYZ, Thanh Xuân, Hà Nội", 
        "đại học fpt, Phường Thanh Xuân Trung, Quận Thanh Xuân, Thành phố Hà Nội"
      ];

      const results = [];
      
      for (const address of testAddresses) {
        console.log(`\n=== TESTING ADDRESS: ${address} ===`);
        
        // 1. Test address extraction
        const mockOrder = { shippingAddress: address };
        const extractedAddress = this.extractTestOrderAddress(mockOrder);
        console.log('Extracted address:', extractedAddress);
        
        // 2. Test shipper zones
        const { ShipperZone } = await import("./shipperZone.entity");
        const zones = await ShipperZone.find({ relations: ["shipper"] });
        console.log(`Found ${zones.length} zones in database`);
        
        // 3. Test matching
        const matches = [];
        for (const zone of zones) {
          const isMatch = this.testAddressMatch(zone, extractedAddress);
          if (isMatch) {
            matches.push({
              shipperId: zone.shipper.id,
              shipperName: zone.shipper.name,
              zone: `${zone.province}-${zone.district}-${zone.ward}`
            });
          }
          console.log(`Zone ${zone.province}-${zone.district}-${zone.ward} (${zone.shipper.name}): ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        }
        
        results.push({
          testAddress: address,
          extractedAddress,
          matchingZones: matches
        });
      }

      return {
        success: true,
        data: results
      };
      
    } catch (error: any) {
      console.error('Debug address error:', error);
      return {
        success: false,
        message: "Debug address failed",
        error: error.message
      };
    }
  }

  /**
   * Simple debug endpoint to check working zones
   */
  @Get("/debug/zones")
  async debugZones() {
    try {
      const { ShipperZone } = await import("./shipperZone.entity");
      const { Account } = await import("@/auth/account/account.entity");
      
      const zones = await ShipperZone.find({ 
        relations: ["shipper"],
        order: { shipper: { name: "ASC" } }
      });
      
      const zonesData = zones.map(zone => ({
        shipperId: zone.shipper.id,
        shipperName: zone.shipper.name,
        province: zone.province,
        district: zone.district,
        ward: zone.ward || 'N/A',
        isAvailable: zone.shipper.isAvailable,
        isRegistered: zone.shipper.isRegistered
      }));
      
      // Test address
      const testAddress = "Phường Thượng Đình, Quận Thanh Xuân, Thành phố Hà Nội";
      const addressParts = testAddress.split(',').map(p => p.trim());
      const extractedAddress = {
        ward: addressParts[0]?.replace(/^(phường|xã)\s+/i, '').toLowerCase(),
        district: addressParts[1]?.replace(/^(quận|huyện)\s+/i, '').toLowerCase(),
        province: addressParts[2]?.replace(/^(thành phố|tỉnh)\s+/i, '').toLowerCase()
      };
      
      return {
        success: true,
        data: {
          totalZones: zones.length,
          zones: zonesData,
          testAddress: {
            original: testAddress,
            extracted: extractedAddress
          },
          matches: zonesData.filter(zone => {
            const zoneDistrict = zone.district.toLowerCase();
            return zoneDistrict.includes('thanh xuân') || 
                   extractedAddress.district.includes(zoneDistrict);
          })
        }
      };
      
    } catch (error: any) {
      console.error('Debug zones error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private extractTestOrderAddress(order: any): any {
    if (!order.shippingAddress) {
      return null;
    }

    const addressParts = order.shippingAddress.split(',').map((part: string) => part.trim());
    
    if (addressParts.length < 3) {
      return null;
    }

    // Lấy 3 phần cuối: Phường/Xã, Quận/Huyện, Tỉnh/Thành phố
    const ward = addressParts[addressParts.length - 3];
    const district = addressParts[addressParts.length - 2];
    const province = addressParts[addressParts.length - 1];

    return {
      province: this.normalizeTestAddress(province),
      district: this.normalizeTestAddress(district),
      ward: this.normalizeTestAddress(ward),
      original: {
        province,
        district, 
        ward
      }
    };
  }

  private normalizeTestAddress(address: string): string {
    return address.toLowerCase().trim();
  }

  private testAddressMatch(zone: any, orderAddress: any): boolean {
    if (!orderAddress) return false;
    
    const normalizeStr = (str: string) => str.toLowerCase().trim();
    
    const zoneProvince = normalizeStr(zone.province || '');
    const zoneDistrict = normalizeStr(zone.district || '');
    const zoneWard = normalizeStr(zone.ward || '');
    
    const orderProvince = normalizeStr(orderAddress.province || '');
    const orderDistrict = normalizeStr(orderAddress.district || '');
    const orderWard = normalizeStr(orderAddress.ward || '');

    console.log(`  Comparing: Zone(${zoneProvince}|${zoneDistrict}|${zoneWard}) vs Order(${orderProvince}|${orderDistrict}|${orderWard})`);

    // 1. Province + District + Ward match
    if (zoneProvince === orderProvince && 
        zoneDistrict === orderDistrict && 
        zoneWard === orderWard && 
        zoneWard !== '') {
      console.log('  → Match: Full address');
      return true;
    }

    // 2. Province + District match
    if (zoneProvince === orderProvince && 
        zoneDistrict === orderDistrict && 
        zoneDistrict !== '') {
      console.log('  → Match: Province + District');
      return true;
    }

    // 3. Province match
    if (zoneProvince === orderProvince && zoneProvince !== '') {
      console.log('  → Match: Province only');
      return true;
    }

    // 4. District match trong cùng Hà Nội
    if ((zoneProvince.includes('hà nội') || zoneProvince.includes('hanoi')) &&
        (orderProvince.includes('hà nội') || orderProvince.includes('hanoi')) &&
        zoneDistrict === orderDistrict && zoneDistrict !== '') {
      console.log('  → Match: Same Hanoi district');
      return true;
    }

    // 5. Kiểm tra district name có chứa trong zone district không
    if (zoneDistrict.includes(orderDistrict) || orderDistrict.includes(zoneDistrict)) {
      if (zoneDistrict !== '' && orderDistrict !== '') {
        console.log('  → Match: District name contains');
        return true;
      }
    }

    console.log('  → No match');
    return false;
  }
} 