import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Order } from "@/order/order.entity";
import { Role } from "@/auth/role/role.entity";
import { OrderStatus } from "@/order/dtos/update-order.dto";
import { DbConnection } from "@/database/dbConnection";
import { EntityManager } from "typeorm";
import { ShipperZone } from "./shipperZone.entity";

// Logging levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private static currentLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

  static error(message: string, ...args: any[]) {
    if (this.currentLevel >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.currentLevel >= LogLevel.WARN) {
      console.warn(`[WARNING] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.currentLevel >= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  static debug(message: string, ...args: any[]) {
    if (this.currentLevel >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}

// UUID validation helper
class ValidationHelper {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  static isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    return this.UUID_REGEX.test(uuid);
  }

  static validateUUID(uuid: string, fieldName: string): void {
    if (!this.isValidUUID(uuid)) {
      throw new Error(`Invalid ${fieldName} format: must be a valid UUID`);
    }
  }

  static validateRequiredString(value: string, fieldName: string, minLength: number = 1): void {
    if (!value || typeof value !== 'string' || value.trim().length < minLength) {
      throw new Error(`${fieldName} is required and must be at least ${minLength} characters`);
    }
  }
}

interface AssignmentResult {
  success: boolean;
  shipper?: Account;
  message: string;
  score?: number;
  distance?: number;
  deliveryMethod?: string;
  estimatedTime?: number;
  errorCode?: string;
  details?: any;
}

interface ShipperScore {
  shipper: Account;
  score: number;
  distance: number;
  currentOrders: number;
  isAvailable: boolean;
  priority: number;
}

interface AddressCoordinates {
  province: string;
  district: string;
  ward: string;
  latitude?: number;
  longitude?: number;
}

interface DistanceAnalysis {
  isLongDistance: boolean;
  distanceType: 'local' | 'regional' | 'national' | 'international';
  estimatedDeliveryTime: number; // giờ
  deliveryMethod: 'local_shipper' | 'express_shipping' | 'third_party';
  reason: string;
  distanceKm: number;
}

// Cấu hình hệ thống
interface SystemConfig {
  storeLocation: {
    province: string;
    district: string;
    ward: string;
    latitude: number;
    longitude: number;
  };
  distanceThresholds: {
    local: number;      // km
    regional: number;   // km
    national: number;   // km
  };
  deliveryTimes: {
    local: number;      // giờ
    regional: number;   // giờ
    national: number;   // giờ
    international: number; // giờ
  };
}

@Service()
export class OrderAssignmentService {
  private readonly CONFIG: SystemConfig = {
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
      local: 2,
      regional: 6,
      national: 24,
      international: 72
    }
  };

  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly QUERY_TIMEOUT = 10000; // 10 giây

  /**
   * Phân loại đơn hàng tự động - Logic chính
   */
  async assignOrderToShipper(order: Order): Promise<AssignmentResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!order || !order.id) {
        return this.createErrorResult("Invalid order: order object and ID are required", "INVALID_INPUT");
      }

      ValidationHelper.validateUUID(order.id, 'order.id');

      // 1. Trích xuất địa chỉ đơn hàng
      const orderAddress = this.extractOrderAddress(order);
      if (!orderAddress) {
        return this.createErrorResult("Không thể trích xuất địa chỉ từ đơn hàng", "ADDRESS_EXTRACTION_FAILED");
      }

      // 2. Phân tích khoảng cách và quyết định phương thức giao hàng
      const distanceAnalysis = this.analyzeOrderDistance(orderAddress);
      
      // 3. Xử lý theo phương thức giao hàng
      const result = await this.processOrderByDeliveryMethod(order, orderAddress, distanceAnalysis);
      
      const processingTime = Date.now() - startTime;
      return {
        ...result,
        message: `${result.message} (${processingTime}ms)`
      };

    } catch (error) {
      Logger.error("Error assigning order to shipper:", error);
      return this.createErrorResult("Lỗi khi phân loại đơn hàng", "ASSIGNMENT_ERROR", { error: (error as Error).message });
    }
  }

  /**
   * Trích xuất địa chỉ từ đơn hàng - Fix cho format Việt Nam (improved)
   */
  private extractOrderAddress(order: Order): AddressCoordinates | null {
    if (!order.shippingAddress) {
      Logger.warn(`Order ${order.id} has no shipping address`);
      return null;
    }

    const rawAddress = order.shippingAddress.trim();
    Logger.debug(`Extracting address from: "${rawAddress}"`);
    
    // Validate minimum address length
    if (rawAddress.length < 10) {
      Logger.warn(`Address too short (${rawAddress.length} chars): "${rawAddress}"`);
      return null;
    }

    const addressParts = rawAddress.split(',').map(part => part.trim()).filter(part => part.length > 0);
    Logger.debug(`Address parts (${addressParts.length}):`, addressParts);

    if (addressParts.length < 2) {
      Logger.warn(`Not enough address parts (${addressParts.length}), minimum 2 required`);
      return null;
    }

    let province = '';
    let district = '';
    let ward = '';

    // Enhanced parsing logic cho các format phổ biến
    try {
      if (addressParts.length >= 4) {
        // Format: "Số nhà đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
        province = this.normalizeAddress(addressParts[addressParts.length - 1]);
        district = this.normalizeAddress(addressParts[addressParts.length - 2]);
        ward = this.normalizeAddress(addressParts[addressParts.length - 3]);
      } else if (addressParts.length === 3) {
        // Format: "Số nhà đường, Quận/Huyện, Tỉnh/TP"
        province = this.normalizeAddress(addressParts[2]);
        district = this.normalizeAddress(addressParts[1]);
        ward = ''; // No ward info
      } else if (addressParts.length === 2) {
        // Format: "Số nhà đường, Quận/Huyện" (assume Hà Nội)
        province = "Hà Nội";
        district = this.normalizeAddress(addressParts[1]);
        ward = '';
      }

      // Post-processing: chuẩn hóa tên
      district = this.standardizeDistrictName(district);
      province = this.standardizeProvinceName(province);

      // Validation kết quả
      if (!province || !district) {
        Logger.warn(`Failed to extract required address parts - Province: "${province}", District: "${district}"`);
        return null;
      }

      // Validate Hà Nội districts
      if (province === 'Hà Nội') {
        const validHanoiDistricts = [
          "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
          "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
          "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
          "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
          "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
        ];
        
        const isValidDistrict = validHanoiDistricts.some(validDistrict => 
          this.normalizeAddress(validDistrict) === this.normalizeAddress(district) ||
          this.normalizeAddress(district).includes(this.normalizeAddress(validDistrict)) ||
          this.normalizeAddress(validDistrict).includes(this.normalizeAddress(district))
        );

        if (!isValidDistrict) {
          Logger.warn(`Invalid Hanoi district: "${district}". Available: ${validHanoiDistricts.slice(0, 5).join(', ')}...`);
          // Still continue but log warning
        }
      }

      const result = {
        province,
        district,
        ward,
        latitude: undefined,
        longitude: undefined
      };

      Logger.debug(`✅ Extracted address:`, result);
      return result;

    } catch (error) {
      Logger.error(`Failed to parse address: "${rawAddress}"`, error);
      return null;
    }
  }

  /**
   * Chuẩn hóa tên địa chỉ (improved)
   */
  private normalizeAddress(address: string): string {
    if (!address || typeof address !== 'string') return '';
    
    return address
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
      .replace(/\b(quan|huyen|phuong|xa|tinh|thanh pho|tp|tp\.)\s+/gi, '') // Remove prefixes
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Chuẩn hóa tên quận để match với working zones
   */
  private standardizeDistrictName(district: string): string {
    const normalized = this.normalizeAddress(district);
    
    // Map common variations to standard names
    const districtMapping: { [key: string]: string } = {
      'thanh xuan': 'Thanh Xuân',
      'dong da': 'Đống Đa',
      'cau giay': 'Cầu Giấy',
      'ba dinh': 'Ba Đình',
      'hoan kiem': 'Hoàn Kiếm',
      'hai ba trung': 'Hai Bà Trưng',
      'tay ho': 'Tây Hồ',
      'hoang mai': 'Hoàng Mai',
      'long bien': 'Long Biên',
      'nam tu liem': 'Nam Từ Liêm',
      'bac tu liem': 'Bắc Từ Liêm',
      'ha dong': 'Hà Đông'
    };

    return districtMapping[normalized] || district;
  }

  /**
   * Chuẩn hóa tên tỉnh
   */
  private standardizeProvinceName(province: string): string {
    const normalized = this.normalizeAddress(province);
    
    if (normalized.includes('ha noi') || normalized.includes('hanoi')) {
      return 'Hà Nội';
    }
    
    return province;
  }

  /**
   * Phân tích khoảng cách đơn hàng
   */
  private analyzeOrderDistance(orderAddress: AddressCoordinates): DistanceAnalysis {
    const distanceKm = this.calculateDistanceFromStore(orderAddress);
    const { distanceThresholds, deliveryTimes } = this.CONFIG;

    if (distanceKm <= distanceThresholds.local) {
      return {
        isLongDistance: false,
        distanceType: 'local',
        estimatedDeliveryTime: deliveryTimes.local,
        deliveryMethod: 'local_shipper',
        reason: 'Đơn hàng trong khu vực địa phương',
        distanceKm
      };
    } else if (distanceKm <= distanceThresholds.regional) {
      return {
        isLongDistance: false,
        distanceType: 'regional',
        estimatedDeliveryTime: deliveryTimes.regional,
        deliveryMethod: 'local_shipper',
        reason: 'Đơn hàng trong khu vực miền Bắc',
        distanceKm
      };
    } else if (distanceKm <= distanceThresholds.national) {
      return {
        isLongDistance: true,
        distanceType: 'national',
        estimatedDeliveryTime: deliveryTimes.national,
        deliveryMethod: 'express_shipping',
        reason: 'Đơn hàng ở xa, cần dịch vụ giao hàng nhanh',
        distanceKm
      };
    } else {
      return {
        isLongDistance: true,
        distanceType: 'international',
        estimatedDeliveryTime: deliveryTimes.international,
        deliveryMethod: 'third_party',
        reason: 'Đơn hàng ở xa, chuyển cho đối tác giao hàng',
        distanceKm
      };
    }
  }

  /**
   * Tính khoảng cách từ cửa hàng đến đơn hàng
   */
  private calculateDistanceFromStore(orderAddress: AddressCoordinates): number {
    const { storeLocation } = this.CONFIG;

    // Nếu có tọa độ, tính khoảng cách Haversine (chính xác hơn)
    if (storeLocation.latitude && storeLocation.longitude && 
        orderAddress.latitude && orderAddress.longitude) {
      const distance = this.calculateHaversineDistance(
        storeLocation.latitude, storeLocation.longitude,
        orderAddress.latitude, orderAddress.longitude
      );
      return distance;
    }

    // Fallback: tính theo cấp hành chính
    const distance = this.calculateAdministrativeDistance(storeLocation.province, orderAddress.province);
    return distance;
  }

  /**
   * Tính khoảng cách Haversine (chính xác cho địa lý)
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Tính khoảng cách theo cấp hành chính
   */
  private calculateAdministrativeDistance(storeProvince: string, orderProvince: string): number {
    // Normalize provinces for comparison
    const normalizeProvince = (province: string) => {
      return province.toLowerCase()
        .trim()
        .replace(/^(thành phố|thanh pho|tỉnh|tinh)\s*/g, '')
        .replace(/\s*(thành phố|thanh pho|tỉnh|tinh)$/g, '')
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const normalizedStore = normalizeProvince(storeProvince);
    const normalizedOrder = normalizeProvince(orderProvince);
    
    if (normalizedStore === normalizedOrder) {
      return 0; // Trong cùng tỉnh/thành phố → local delivery
    } else if (this.isSameRegion(storeProvince, orderProvince)) {
      return 200; // Trong cùng miền
    } else {
      return 1500; // Khác miền
    }
  }

  /**
   * Kiểm tra cùng miền
   */
  private isSameRegion(province1: string, province2: string): boolean {
    const regions = {
      northern: ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hưng Yên', 'Hải Dương',
                'Thái Nguyên', 'Lạng Sơn', 'Bắc Giang', 'Phú Thọ', 'Vĩnh Phúc', 'Tuyên Quang',
                'Yên Bái', 'Lào Cai', 'Sơn La', 'Điện Biên', 'Lai Châu', 'Hòa Bình', 'Ninh Bình',
                'Nam Định', 'Thái Bình', 'Hà Nam', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh'],
      central: ['Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam',
               'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận'],
      southern: ['Bình Phước', 'Tây Ninh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu',
                'TP. Hồ Chí Minh', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long',
                'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng',
                'Bạc Liêu', 'Cà Mau']
    };

    const region1 = this.getRegion(province1, regions);
    const region2 = this.getRegion(province2, regions);
    
    return region1 === region2 && region1 !== 'unknown';
  }

  private getRegion(province: string, regions: any): string {
    for (const [region, provinces] of Object.entries(regions)) {
      if ((provinces as string[]).includes(province)) {
        return region;
      }
    }
    return 'unknown';
  }

  /**
   * Xử lý đơn hàng theo phương thức giao hàng
   */
  private async processOrderByDeliveryMethod(
    order: Order, 
    orderAddress: AddressCoordinates, 
    distanceAnalysis: DistanceAnalysis
  ): Promise<AssignmentResult> {
    
    switch (distanceAnalysis.deliveryMethod) {
      case 'local_shipper':
        return await this.assignToLocalShipper(order, orderAddress, distanceAnalysis);
      
      case 'express_shipping':
        return await this.assignToExpressShipper(order, orderAddress, distanceAnalysis);
      
      case 'third_party':
        return await this.assignToThirdParty(order, orderAddress, distanceAnalysis);
      
      default:
        return this.createErrorResult("Phương thức giao hàng không hợp lệ");
    }
  }

  /**
   * Gán cho shipper nội bộ (đơn hàng gần)
   */
  private async assignToLocalShipper(
    order: Order, 
    orderAddress: AddressCoordinates, 
    distanceAnalysis: DistanceAnalysis
  ): Promise<AssignmentResult> {
    
    try {
      Logger.debug(`assignToLocalShipper - Order ${order.id}, Address:`, orderAddress);
      
      const availableShippers = await this.findAvailableShippers(orderAddress);
      Logger.debug(`Found ${availableShippers.length} available shippers`);
      
      if (availableShippers.length === 0) {
        Logger.debug(`No available shippers for this area`);
        return this.createErrorResult("Không có shipper nào phù hợp cho khu vực này");
      }

      Logger.debug(`Available shippers:`, availableShippers.map(s => ({ id: s.id, name: s.name })));

      const shipperScores = await this.calculateShipperScores(availableShippers, orderAddress);
      Logger.debug(`Shipper scores:`, shipperScores.map(s => ({ 
        name: s.shipper.name, 
        score: s.score, 
        distance: s.distance 
      })));
      
      const bestShipper = await this.selectBestShipper(shipperScores);
      Logger.debug(`Best shipper:`, bestShipper ? { 
        name: bestShipper.shipper.name, 
        score: bestShipper.score 
      } : 'NONE');
      
      if (!bestShipper) {
        Logger.debug(`No suitable shipper selected`);
        return this.createErrorResult("Không thể chọn shipper phù hợp");
      }

      Logger.debug(`Assigning order ${order.id} to shipper ${bestShipper.shipper.name}`);
             await this.assignOrderToShipperInternal(order, bestShipper.shipper);
      Logger.debug(`Assignment successful`);

      return this.createSuccessResult(
        bestShipper.shipper,
        `Đơn hàng đã được gán cho shipper ${bestShipper.shipper.name}`,
        bestShipper.score,
        bestShipper.distance,
        'local_shipper',
        distanceAnalysis.estimatedDeliveryTime
      );

    } catch (error) {
      Logger.error("Error assigning to local shipper:", error);
      Logger.error("Error details:", {
        orderId: order.id,
        orderAddress,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      });
      return this.createErrorResult("Lỗi khi gán đơn hàng cho shipper nội bộ", "SHIPPER_ASSIGNMENT_ERROR", {
        orderId: order.id,
        orderAddress,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      });
    }
  }

  /**
   * Gán cho shipper giao hàng nhanh
   */
  private async assignToExpressShipper(
    order: Order, 
    orderAddress: AddressCoordinates, 
    distanceAnalysis: DistanceAnalysis
  ): Promise<AssignmentResult> {
    
    try {
      const expressShippers = await this.findExpressShippers(orderAddress);
      
      if (expressShippers.length > 0) {
        const bestShipper = expressShippers[0];
        await this.assignOrderToShipperInternal(order, bestShipper);
        
        return this.createSuccessResult(
          bestShipper,
          `Đơn hàng đã được gán cho shipper giao hàng nhanh ${bestShipper.name}`,
          100,
          distanceAnalysis.distanceKm,
          'express_shipping',
          distanceAnalysis.estimatedDeliveryTime
        );
      } else {
        // Fallback: chuyển cho đối tác
        return await this.assignToThirdParty(order, orderAddress, distanceAnalysis);
      }

    } catch (error) {
      Logger.error("Error assigning to express shipper:", error);
      return this.createErrorResult("Lỗi khi gán đơn hàng cho shipper giao hàng nhanh", "EXPRESS_SHIPPER_ASSIGNMENT_ERROR", {
        orderId: order.id,
        orderAddress,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      });
    }
  }

  /**
   * Chuyển cho đối tác giao hàng
   */
  private async assignToThirdParty(
    order: Order, 
    orderAddress: AddressCoordinates, 
    distanceAnalysis: DistanceAnalysis
  ): Promise<AssignmentResult> {
    
    try {
      // Cập nhật trạng thái đơn hàng
      await Order.createQueryBuilder()
        .update()
        .set({ 
          status: OrderStatus.PENDING_EXTERNAL_SHIPPING,
          note: `Đơn hàng được chuyển cho đối tác giao hàng. ${distanceAnalysis.reason}. Thời gian dự kiến: ${distanceAnalysis.estimatedDeliveryTime} giờ`
        })
        .where("id = :orderId", { orderId: order.id })
        .execute();

      // Thông báo cho đối tác
      await this.notifyThirdPartyShipping(order, orderAddress, distanceAnalysis);

      return this.createSuccessResult(
        undefined,
        `Đơn hàng đã được chuyển cho đối tác giao hàng`,
        0,
        distanceAnalysis.distanceKm,
        'third_party',
        distanceAnalysis.estimatedDeliveryTime
      );

    } catch (error) {
      Logger.error("Error assigning to third party:", error);
      return this.createErrorResult("Lỗi khi chuyển đơn hàng cho đối tác", "THIRD_PARTY_ASSIGNMENT_ERROR", {
        orderId: order.id,
        orderAddress,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      });
    }
  }

  /**
   * Tìm shipper có sẵn
   */
  private async findAvailableShippers(orderAddress: AddressCoordinates): Promise<Account[]> {
    const shipperRole = await Role.findOne({ where: { name: "shipper" } });
    if (!shipperRole) {
      Logger.warn('[Warning] Shipper role not found in database');
      return [];
    }

    // Tìm shipper available
    const allAvailableShippers = await Account.createQueryBuilder("account")
      .where("account.role.id = :roleId", { roleId: shipperRole.id })
      .andWhere("account.isRegistered = :isRegistered", { isRegistered: true })
      .andWhere("account.isAvailable = :isAvailable", { isAvailable: true })
      .andWhere(
        // Fix: Nếu maxOrdersPerDay = 0 thì coi như unlimited (999)
        "account.currentOrdersToday < CASE WHEN account.maxOrdersPerDay = 0 THEN 999 ELSE account.maxOrdersPerDay END"
      )
      .orderBy("account.priority", "DESC")
      .addOrderBy("account.currentOrdersToday", "ASC")
      .getMany();

    if (allAvailableShippers.length === 0) {
      Logger.warn('[Warning] No available shippers found in system');
      return [];
    }

    Logger.debug(`Found ${allAvailableShippers.length} available shippers before zone filtering`);

    // Zone matching logic với validation chặt chẽ hơn
    const shippersWithZones = [];
    
    for (const shipper of allAvailableShippers) {
      const zones = await ShipperZone.find({
        where: { shipper: { id: shipper.id } }
      });

      Logger.debug(`Shipper ${shipper.name} has ${zones.length} zones:`, zones.map(z => z.district));

      // Kiểm tra zone matching với validation nghiêm ngặt hơn
      let hasMatchingZone = false;
      let matchReason = '';
      
      if (zones.length === 0) {
        // ❌ REMOVED: Không cho phép shipper không có zone nhận đơn
        Logger.warn(`Shipper ${shipper.name} has no working zones - SKIPPED`);
        continue;
      }
      
      for (const zone of zones) {
        if (this.isAddressMatch(zone, orderAddress)) {
          hasMatchingZone = true;
          matchReason = `Zone match: ${zone.district}`;
          break;
        }
      }

      if (hasMatchingZone) {
        shippersWithZones.push(shipper);
        Logger.debug(`✅ Shipper ${shipper.name} added - ${matchReason}`);
      } else {
        // ❌ REMOVED: Không còn fallback cho Hà Nội
        Logger.debug(`❌ Shipper ${shipper.name} no matching zone for ${orderAddress.district}, ${orderAddress.province}`);
      }
    }

    Logger.debug(`Final result: ${shippersWithZones.length} shippers with matching zones`);
    return shippersWithZones;
  }

  /**
   * Kiểm tra địa chỉ có match không (chính xác hơn)
   */
  private isAddressMatch(zone: any, orderAddress: AddressCoordinates): boolean {
    // Validate input
    if (!zone || !orderAddress) {
      Logger.warn('[Warning] Invalid zone or orderAddress for matching');
      return false;
    }

    // Normalize cả hai bên để so sánh
    const normalizeStr = (str: string) => {
      if (!str) return '';
      return str.toLowerCase()
        .trim()
        .replace(/^(quận|huyện|thành phố|tỉnh|phường|xã)\s+/g, '') // Bỏ tiền tố
        .replace(/\s+(quận|huyện|thành phố|tỉnh|phường|xã)$/g, '') // Bỏ hậu tố
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a') // Bỏ dấu tiếng Việt
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd');
    };
    
    const zoneProvince = normalizeStr(zone.province || '');
    const zoneDistrict = normalizeStr(zone.district || '');
    const zoneWard = normalizeStr(zone.ward || '');
    
    const orderProvince = normalizeStr(orderAddress.province || '');
    const orderDistrict = normalizeStr(orderAddress.district || '');
    const orderWard = normalizeStr(orderAddress.ward || '');

    Logger.debug(`Zone matching - Zone: ${zoneProvince}/${zoneDistrict}/${zoneWard} vs Order: ${orderProvince}/${orderDistrict}/${orderWard}`);

    // 1. Province validation - must match (strict)
    if (zoneProvince && orderProvince) {
      const provinceMatch = zoneProvince.includes('ha noi') && orderProvince.includes('ha noi') ||
                           zoneProvince === orderProvince;
      if (!provinceMatch) {
        Logger.debug(`❌ Province mismatch: ${zoneProvince} vs ${orderProvince}`);
        return false;
      }
    } else {
      Logger.warn(`[Warning] Missing province data - Zone: ${zoneProvince}, Order: ${orderProvince}`);
      return false;
    }

    // 2. District matching (primary criteria)
    if (zoneDistrict && orderDistrict) {
      // Exact match
      if (zoneDistrict === orderDistrict) {
        Logger.debug(`✅ Exact district match: ${zoneDistrict}`);
        return true;
      }
      
      // Partial match (contains)
      if (zoneDistrict.includes(orderDistrict) || orderDistrict.includes(zoneDistrict)) {
        Logger.debug(`✅ Partial district match: ${zoneDistrict} ↔ ${orderDistrict}`);
        return true;
      }
    } else {
      Logger.warn(`[Warning] Missing district data - Zone: ${zoneDistrict}, Order: ${orderDistrict}`);
      return false;
    }

    // 3. Ward matching (bonus, but not required)
    if (zoneWard && orderWard &&
        (zoneWard === orderWard || 
         zoneWard.includes(orderWard) || 
         orderWard.includes(zoneWard))) {
      Logger.debug(`✅ Ward bonus match: ${zoneWard} ↔ ${orderWard}`);
      return true;
    }

    Logger.debug(`❌ No match found`);
    return false;
  }

  /**
   * Tìm shipper giao hàng nhanh
   */
  private async findExpressShippers(orderAddress: AddressCoordinates): Promise<Account[]> {
    // Sử dụng logic mới từ findAvailableShippers nhưng chỉ lấy shipper có priority cao
    const availableShippers = await this.findAvailableShippers(orderAddress);
    
    return availableShippers
      .filter(shipper => (shipper.priority || 1) >= 5)
      .slice(0, 3); // Lấy tối đa 3 shipper
  }

  /**
   * Tính điểm cho shipper
   */
  private async calculateShipperScores(
    shippers: Account[], 
    orderAddress: AddressCoordinates
  ): Promise<ShipperScore[]> {
    
    const scorePromises = shippers.map(async (shipper) => {
      const currentOrders = await this.getCurrentOrdersCount(shipper.id);
      const distance = await this.calculateShipperDistance(shipper, orderAddress);
      const score = this.calculateScore(distance, currentOrders, shipper.isAvailable, shipper.priority || 1);

      return {
        shipper,
        score,
        distance,
        currentOrders,
        isAvailable: shipper.isAvailable,
        priority: shipper.priority || 1
      };
    });

    const results = await Promise.all(scorePromises);
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Tính khoảng cách từ shipper đến đơn hàng
   */
  private async calculateShipperDistance(shipper: Account, orderAddress: AddressCoordinates): Promise<number> {
    // Tìm zone gần nhất của shipper với địa chỉ đơn hàng
    const shipperZones = await ShipperZone.find({
      where: { shipper: { id: shipper.id } }
    });

    if (shipperZones.length === 0) {
      return 999; // Shipper không có zone nào
    }

    let minDistance = 999;
    
    for (const zone of shipperZones) {
      let distance = 999;
      
      // Kiểm tra theo cấp hành chính
      if (zone.province === orderAddress.province && 
          zone.district === orderAddress.district && 
          zone.ward === orderAddress.ward) {
        distance = 0;
      } else if (zone.province === orderAddress.province && 
                zone.district === orderAddress.district) {
        distance = 1;
      } else if (zone.province === orderAddress.province) {
        distance = 2;
      }
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    return minDistance;
  }

  /**
   * Tính điểm cho shipper
   */
  private calculateScore(
    distance: number, 
    currentOrders: number, 
    isAvailable: boolean, 
    priority: number
  ): number {
    let score = 100;

    // Trừ điểm theo khoảng cách
    score -= distance * 15;

    // Trừ điểm theo workload
    score -= Math.min(currentOrders * 8, 50);

    // Trừ điểm nếu không available
    if (!isAvailable) {
      score -= 100;
    }

    // Cộng điểm theo priority
    score += priority * 10;

    return Math.max(0, score);
  }

  /**
   * Chọn shipper tốt nhất
   */
  private async selectBestShipper(shipperScores: ShipperScore[]): Promise<ShipperScore | null> {
    if (shipperScores.length === 0) {
      return null;
    }

    for (let attempt = 0; attempt < Math.min(this.MAX_RETRY_ATTEMPTS, shipperScores.length); attempt++) {
      const selectedShipper = shipperScores[attempt];
      
      try {
        const isStillAvailable = await this.checkShipperAvailability(selectedShipper.shipper.id);
        if (isStillAvailable) {
          return selectedShipper;
        }
      } catch (error) {
        Logger.error(`Error checking shipper ${selectedShipper.shipper.id}:`, error);
        continue;
      }
    }

    return null;
  }

  /**
   * Kiểm tra shipper có còn available không
   */
  private async checkShipperAvailability(shipperId: string): Promise<boolean> {
    const shipper = await Account.findOne({ where: { id: shipperId } });
    return shipper?.isAvailable === true && 
           (shipper.currentOrdersToday || 0) < (shipper.maxOrdersPerDay || 999);
  }

  /**
   * Assign order to shipper
   */
  private async assignOrderToShipperInternal(order: Order, shipper: Account): Promise<void> {
    const connection = await DbConnection.getConnection();
    if (!connection) {
      throw new Error('Database connection failed');
    }

    return connection.transaction(async (transactionalEntityManager) => {
      // 1. Check if shipper is still available
      const currentShipper = await transactionalEntityManager.findOne(Account, {
        where: { id: shipper.id },
        lock: { mode: 'pessimistic_write' }
      });
      
      if (!currentShipper || !currentShipper.isAvailable) {
        throw new Error(`Shipper ${shipper.id} is no longer available`);
      }

      // 2. Check if order is already assigned
      const currentOrder = await transactionalEntityManager.findOne(Order, {
        where: { id: order.id },
        relations: ['shipper'],
        lock: { mode: 'pessimistic_write' }
      });
      
      if (!currentOrder) {
        throw new Error(`Order ${order.id} not found`);
      }
      
      if (currentOrder.shipper) {
        throw new Error(`Order ${order.id} is already assigned to shipper ${currentOrder.shipper.id}`);
      }

      // 3. Calculate current order count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentOrdersCount = await transactionalEntityManager
        .createQueryBuilder(Order, "order")
        .where("order.shipper.id = :shipperId", { shipperId: shipper.id })
        .andWhere("order.orderDate >= :today", { today })
        .andWhere("order.status IN (:...statuses)", { 
          statuses: [OrderStatus.PENDING, OrderStatus.SHIPPING] 
        })
        .getCount();

      // 4. Check if exceeds maximum orders per day
      if (currentOrdersCount >= (currentShipper.maxOrdersPerDay || 999)) {
        throw new Error(`Shipper ${shipper.id} has reached maximum orders for today (${currentOrdersCount}/${currentShipper.maxOrdersPerDay})`);
      }

      // 5. Assign order to shipper
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Order)
        .set({ shipper: currentShipper })
        .where("id = :orderId", { orderId: order.id })
        .execute();

      // 6. Update shipper statistics
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Account)
        .set({ 
          currentOrdersToday: currentOrdersCount + 1,
          lastOrderDate: new Date()
        })
        .where("id = :shipperId", { shipperId: shipper.id })
        .execute();


    });
  }

  /**
   * Cập nhật số đơn hàng của shipper
   */
  private async updateShipperOrderCount(shipperId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await Order.createQueryBuilder("order")
      .where("order.shipper.id = :shipperId", { shipperId })
      .andWhere("order.orderDate >= :today", { today })
      .andWhere("order.status IN (:...statuses)", { 
        statuses: [OrderStatus.PENDING, OrderStatus.SHIPPING] 
      })
      .getCount();

    await Account.createQueryBuilder("account")
      .update()
      .set({ 
        currentOrdersToday: count,
        lastOrderDate: new Date()
      })
      .where("account.id = :shipperId", { shipperId })
      .execute();
  }

  /**
   * Đếm số đơn hàng hiện tại của shipper
   */
  private async getCurrentOrdersCount(shipperId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await Order.createQueryBuilder("order")
      .where("order.shipper.id = :shipperId", { shipperId })
      .andWhere("order.orderDate >= :today", { today })
      .andWhere("order.status IN (:...statuses)", { 
        statuses: [OrderStatus.PENDING, OrderStatus.SHIPPING] 
      })
      .getCount();
  }

  /**
   * Thông báo cho đối tác giao hàng (implemented)
   */
  private async notifyThirdPartyShipping(
    order: Order, 
    orderAddress: AddressCoordinates, 
    distanceAnalysis: DistanceAnalysis
  ): Promise<void> {
    try {
      Logger.info(`📦 Notifying third-party shipping for order ${order.id}`);
      
      // Prepare shipping data
      const shippingData = {
        orderId: order.id,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        customerInfo: order.customer ? {
          name: order.customer.name,
          phone: order.customer.phone
        } : 'Guest Order',
        deliveryInfo: {
          estimatedTime: distanceAnalysis.estimatedDeliveryTime,
          distance: distanceAnalysis.distanceKm,
          deliveryMethod: distanceAnalysis.deliveryMethod,
          reason: distanceAnalysis.reason
        },
        specialInstructions: order.note || 'No special instructions'
      };

      Logger.info(`📋 Third-party shipping data prepared:`, {
        orderId: shippingData.orderId,
        destination: orderAddress.district + ', ' + orderAddress.province,
        estimatedTime: shippingData.deliveryInfo.estimatedTime + ' hours',
        distance: shippingData.deliveryInfo.distance + ' km'
      });

      // TODO: Integrate with actual third-party APIs
      // Example integrations:
      // - Giao Hàng Nhanh (GHN)
      // - Viettel Post
      // - Vietnam Post
      // - J&T Express
      // - Best Express
      
      // Placeholder for API integration
      await this.sendToThirdPartyAPI(shippingData);
      
      // Log successful notification
      Logger.info(`✅ Third-party shipping notification sent successfully for order ${order.id}`);
      
      // Update order with third-party tracking info (placeholder)
      await Order.createQueryBuilder()
        .update()
        .set({ 
          note: `${order.note || ''}\n[System] Sent to third-party shipping at ${new Date().toISOString()}`
        })
        .where("id = :orderId", { orderId: order.id })
        .execute();

    } catch (error) {
      Logger.error(`❌ Failed to notify third-party shipping for order ${order.id}:`, error);
      // Don't throw - log error but continue (order already marked as PENDING_EXTERNAL_SHIPPING)
      
      // Update order with failure note
      await Order.createQueryBuilder()
        .update()
        .set({ 
          note: `${order.note || ''}\n[System] Failed to notify third-party shipping: ${(error as Error).message}`
        })
        .where("id = :orderId", { orderId: order.id })
        .execute();
    }
  }

  /**
   * Send data to third-party shipping API (placeholder implementation)
   */
  private async sendToThirdPartyAPI(shippingData: any): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    Logger.info(`🚀 Simulated third-party API call for order ${shippingData.orderId}`);
    
    // TODO: Replace with actual API implementations
    // Example for GHN API:
    /*
    const ghnResponse = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': process.env.GHN_API_TOKEN,
        'ShopId': process.env.GHN_SHOP_ID
      },
      body: JSON.stringify({
        payment_type_id: 2, // COD
        note: shippingData.specialInstructions,
        required_note: "KHONGCHOXEMHANG",
        to_name: shippingData.customerInfo.name,
        to_phone: shippingData.customerInfo.phone,
        to_address: shippingData.shippingAddress,
        cod_amount: shippingData.totalAmount,
        weight: 1000, // Default 1kg
        length: 20,
        width: 20,
        height: 10,
        service_type_id: 2, // Standard service
        items: [{
          name: `Order #${shippingData.orderId}`,
          quantity: 1,
          weight: 1000
        }]
      })
    });
    */
    
    // For now, just log the shipping request
    Logger.debug(`📨 Third-party shipping request (simulated):`, {
      service: 'Placeholder Third-Party Service',
      orderId: shippingData.orderId,
      destination: shippingData.shippingAddress,
      estimatedDelivery: `${shippingData.deliveryInfo.estimatedTime} hours`,
      status: 'Sent to external partner'
    });
  }

  /**
   * Tạo kết quả lỗi với format nhất quán
   */
  private createErrorResult(message: string, errorCode?: string, details?: any): AssignmentResult {
    Logger.error(`[Assignment Error] ${message}`, details ? { details } : '');
    return {
      success: false,
      message,
      errorCode,
      details
    };
  }

  /**
   * Tạo kết quả thành công với format nhất quán (overload cho third party)
   */
  private createSuccessResult(
    shipper: Account | undefined, 
    message: string, 
    score: number, 
    distance: number,
    deliveryMethod: string,
    estimatedTime: number
  ): AssignmentResult {
    if (shipper) {
      Logger.info(`[Assignment Success] ${message} - Shipper: ${shipper.name}, Score: ${score}`);
    } else {
      Logger.info(`[Assignment Success] ${message} - Third Party, Score: ${score}`);
    }
    return {
      success: true,
      shipper,
      message,
      score,
      distance,
      deliveryMethod,
      estimatedTime
    };
  }

  // Các phương thức utility khác giữ nguyên...
  async assignMultipleOrders(orders: Order[]): Promise<AssignmentResult[]> {
    const results: AssignmentResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(order => this.assignOrderToShipper(order))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async resetDailyOrderCounts(): Promise<void> {
    const shipperRole = await Role.findOne({ where: { name: "shipper" } });
    if (!shipperRole) return;

    const shippers = await Account.find({ where: { role: { id: shipperRole.id } } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const shipper of shippers) {
      const currentOrdersCount = await Order.createQueryBuilder("order")
        .where("order.shipper.id = :shipperId", { shipperId: shipper.id })
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
        .where("account.id = :shipperId", { shipperId: shipper.id })
        .execute();
    }
  }

  /**
   * Cập nhật vùng làm việc của shipper (method cũ - deprecated)
   */
  async updateShipperWorkingZone(
    shipperId: string, 
    workingZone: { 
      province: string; 
      district: string; 
      ward: string; 
      latitude?: number; 
      longitude?: number;
      maxOrdersPerDay?: number;
      priority?: number;
    }
  ): Promise<void> {
    // Chỉ cập nhật maxOrdersPerDay và priority trong Account
    // Vùng làm việc sẽ dùng ShipperZone entity
    await Account.createQueryBuilder("account")
      .update()
      .set({
        maxOrdersPerDay: workingZone.maxOrdersPerDay || 0,
        priority: workingZone.priority || 1
      })
      .where("account.id = :shipperId", { shipperId })
      .execute();

    // Tạo/cập nhật ShipperZone
    const connection = await DbConnection.getConnection();
    if (!connection) {
      throw new Error('Database connection failed');
    }

    return connection.transaction(async (transactionalEntityManager) => {
      const shipper = await transactionalEntityManager.findOne(Account, {
        where: { id: shipperId }
      });
      
      if (!shipper) {
        throw new Error('Shipper not found');
      }

      // Xóa zone cũ
      await transactionalEntityManager.delete(ShipperZone, {
        shipper: { id: shipperId }
      });

      // Tạo zone mới
      const shipperZone = new ShipperZone();
      shipperZone.shipper = shipper;
      shipperZone.province = workingZone.province;
      shipperZone.district = workingZone.district || '';
      shipperZone.ward = workingZone.ward || '';
      
      await transactionalEntityManager.save(shipperZone);
    });
  }

  async updateShipperAvailability(shipperId: string, isAvailable: boolean): Promise<void> {
    await Account.createQueryBuilder("account")
      .update()
      .set({ isAvailable })
      .where("account.id = :shipperId", { shipperId })
      .execute();
  }

  async updateShipperWorkingZones(
    shipperId: string, 
    workingZones: string[]
  ): Promise<void> {
    Logger.debug(`Updating working zones for shipper ${shipperId}:`, workingZones);
    
    // Validate input
    ValidationHelper.validateUUID(shipperId, 'shipperId');
    
    if (!workingZones || !Array.isArray(workingZones)) {
      throw new Error('Invalid input: workingZones must be an array');
    }

    if (workingZones.length === 0) {
      throw new Error('At least one working zone is required');
    }

    if (workingZones.length > 25) {
      throw new Error('Too many working zones (max 25 allowed)');
    }

    // Validate each zone is a valid string
    for (const zone of workingZones) {
      ValidationHelper.validateRequiredString(zone, 'working zone', 2);
    }

    // Import ShipperZone entity
    const { ShipperZone } = await import('./shipperZone.entity');
    
    const connection = await DbConnection.getConnection();
    if (!connection) {
      throw new Error('Database connection failed');
    }

    return connection.transaction(async (transactionalEntityManager) => {
      try {
      // Find shipper
      const shipper = await transactionalEntityManager.findOne(Account, {
        where: { id: shipperId }
      });
      
      if (!shipper) {
          Logger.error(`[ERROR] Shipper ${shipperId} not found`);
        throw new Error('Shipper not found');
      }

        Logger.debug(`Found shipper: ${shipper.name}`);

        // Validate working zones (should be valid Hanoi districts)
        const validHanoiDistricts = [
          "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
          "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
          "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
          "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
          "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
        ];

        // Strict validation - exact match required
        const invalidZones = workingZones.filter(zone => {
          return !validHanoiDistricts.some(validDistrict => 
            this.normalizeAddress(validDistrict) === this.normalizeAddress(zone) ||
            this.normalizeAddress(zone).includes(this.normalizeAddress(validDistrict)) ||
            this.normalizeAddress(validDistrict).includes(this.normalizeAddress(zone))
          );
        });

        if (invalidZones.length > 0) {
          Logger.error(`[ERROR] Invalid working zones:`, invalidZones);
          throw new Error(`Invalid working zones: ${invalidZones.join(', ')}. Must be valid Hanoi districts.`);
        }

        // Remove duplicates and normalize
        const uniqueZones = [...new Set(workingZones.map(zone => zone.trim()).filter(zone => zone.length > 0))];
        
        if (uniqueZones.length !== workingZones.length) {
          Logger.warn(`[Warning] Removed ${workingZones.length - uniqueZones.length} duplicate/empty zones`);
        }

        // Check existing zones before delete
        const existingZones = await transactionalEntityManager.find(ShipperZone, {
          where: { shipper: { id: shipperId } }
        });
        
        Logger.debug(`Existing zones (${existingZones.length}):`, existingZones.map(z => z.district));

        // Delete existing zones with verification
        const deleteResult = await transactionalEntityManager.delete(ShipperZone, {
        shipper: { id: shipperId }
      });

        Logger.debug(`Deleted ${deleteResult.affected || 0} existing zones`);

        // Verify deletion worked
        const remainingZones = await transactionalEntityManager.find(ShipperZone, {
          where: { shipper: { id: shipperId } }
        });
        
        if (remainingZones.length > 0) {
          Logger.error(`[ERROR] Failed to delete all zones. Remaining:`, remainingZones.length);
          throw new Error('Failed to delete existing zones');
        }

        Logger.debug(`All existing zones deleted successfully`);

        // Create new zones - standardize all as Hanoi districts
        const createdZones = [];
        for (const zone of uniqueZones) {
        const shipperZone = new ShipperZone();
        shipperZone.shipper = shipper;
          shipperZone.province = 'Hà Nội';
          shipperZone.district = zone;
          shipperZone.ward = '';
          
          const savedZone = await transactionalEntityManager.save(shipperZone);
          createdZones.push(savedZone);
          Logger.debug(`Created zone: ${zone}`);
        }

        Logger.debug(`Successfully created ${createdZones.length} new zones`);

        // Final verification
        const finalZones = await transactionalEntityManager.find(ShipperZone, {
          where: { shipper: { id: shipperId } }
        });
        
        Logger.debug(`Final zones count: ${finalZones.length}, districts:`, finalZones.map(z => z.district));
        
        if (finalZones.length !== uniqueZones.length) {
          Logger.error(`Zone count mismatch. Expected: ${uniqueZones.length}, Got: ${finalZones.length}`);
          throw new Error('Zone creation verification failed');
        }

      } catch (error) {
        Logger.error(`updateShipperWorkingZones failed:`, error);
        throw error;
      }
    });
  }

  async updateShipperPriority(shipperId: string, priority: number): Promise<void> {
    // Validate input
    ValidationHelper.validateUUID(shipperId, 'shipperId');
    
    if (typeof priority !== 'number' || priority < 1 || priority > 10) {
      throw new Error('Priority must be a number between 1 and 10');
    }

    await Account.createQueryBuilder("account")
      .update()
      .set({ priority })
      .where("account.id = :shipperId", { shipperId })
      .execute();
  }

  /**
   * Test normalize address function
   */
  testNormalize(address: string): string {
    return this.normalizeAddress(address);
  }
} 