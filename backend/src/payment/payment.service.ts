import { Service } from "typedi";
import { DbConnection } from "@/database/dbConnection";
import { Payment } from "./payment.entity";
import { Order } from "@/order/order.entity";
import { Account } from "@/auth/account/account.entity";
import {
  CreatePaymentDto,
  VNPayReturnDto,
  VNPayIPNDto,
  PaymentStatusDto,
} from "./dtos/payment.dto";
import * as crypto from "crypto";
import { OrderStatus } from "@/order/dtos/update-order.dto";

@Service()
export class PaymentService {
  /**
   * Create VNPAY payment URL
   */
  async createVNPayUrl(
    username: string,
    createPaymentDto: CreatePaymentDto
  ): Promise<string> {
    // Validate payment amount
    if (!createPaymentDto.amount || createPaymentDto.amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Get order and validate
    const order = await DbConnection.appDataSource.manager.findOne(Order, {
      where: { id: createPaymentDto.orderId },
      relations: ["customer"],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Security: Validate payment amount matches order total
    if (Math.abs(order.totalAmount - createPaymentDto.amount) > 0.01) {
      throw new Error(`Payment amount mismatch: order ${order.totalAmount}, payment ${createPaymentDto.amount}`);
    }

    // For authenticated users, verify order ownership
    // For guest orders, customer will be null
    if (username && order.customer) {
      if (order.customer.username !== username) {
        throw new Error("Unauthorized access to order");
      }
    } else if (username && !order.customer) {
      // Authenticated user trying to pay for guest order - not allowed
      throw new Error("Cannot pay for guest order with authenticated account");
    } else if (!username && order.customer) {
      // Guest trying to pay for authenticated user's order - not allowed
      throw new Error("Cannot pay for user order as guest");
    }
    // If (!username && !order.customer) - guest paying for guest order - allowed

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PENDING_EXTERNAL_SHIPPING) {
      throw new Error("Order is not in pending status");
    }

    // VNPAY configuration
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
    const vnp_Url = process.env.VNPAY_PAYMENT_URL;
    const vnp_ReturnUrl =
      process.env.VNPAY_RETURN_URL || "http://localhost:5173/vnpay-payment";
    const vnp_IpnUrl =
      process.env.VNPAY_IPN_URL ||
      "http://localhost:3000/api/payment/vnpay-ipn";

    if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url) {
      throw new Error("VNPAY configuration is missing");
    }

    // Prepare VNPAY parameters
    // Create timestamp in GMT+7 (Vietnam timezone) format: yyyyMMddHHmmss
    const now = new Date();
    // Convert to Vietnam timezone (GMT+7)
    const vietnamOffset = 7 * 60; // 7 hours in minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vietnamTime = new Date(utc + vietnamOffset * 60000);

    // Format: yyyyMMddHHmmss (14 digits)
    const year = vietnamTime.getFullYear();
    const month = (vietnamTime.getMonth() + 1).toString().padStart(2, "0");
    const day = vietnamTime.getDate().toString().padStart(2, "0");
    const hours = vietnamTime.getHours().toString().padStart(2, "0");
    const minutes = vietnamTime.getMinutes().toString().padStart(2, "0");
    const seconds = vietnamTime.getSeconds().toString().padStart(2, "0");

    const createDate = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: Math.round(createPaymentDto.amount * 100), // Convert to VND (multiply by 100)
      vnp_CurrCode: "VND",
      vnp_BankCode: createPaymentDto.bankCode || "",
      vnp_TxnRef: createPaymentDto.orderId,
      vnp_OrderInfo:
        createPaymentDto.orderInfo ||
        `Thanh toan don hang ${createPaymentDto.orderId}`,
      vnp_OrderType: "other",
      vnp_Locale: createPaymentDto.locale || "vn",
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpnUrl: vnp_IpnUrl,
      vnp_IpAddr: "127.0.0.1", // TODO: Get real IP from request in production
      vnp_CreateDate: createDate,
    };

    // Remove empty parameters
    Object.keys(vnp_Params).forEach((key) => {
      if (
        vnp_Params[key] === "" ||
        vnp_Params[key] === null ||
        vnp_Params[key] === undefined
      ) {
        delete vnp_Params[key];
      }
    });

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(vnp_Params);

    // Create query string
    const signData = new URLSearchParams(sortedParams).toString();

    // Create secure hash
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Add secure hash to parameters
    vnp_Params.vnp_SecureHash = signed;

    // Build payment URL
    const paymentUrl = `${vnp_Url}?${new URLSearchParams(
      vnp_Params
    ).toString()}`;

    return paymentUrl;
  }

  /**
   * Verify VNPAY return parameters
   */
  async verifyVNPayReturn(
    params: VNPayReturnDto
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
    if (!vnp_HashSecret) {
      throw new Error("VNPAY hash secret not configured");
    }

    // Verify secure hash
    const isValidHash = this.verifySecureHash(
      params.queryParams,
      vnp_HashSecret
    );
    if (!isValidHash) {
      return { success: false, message: "Invalid secure hash" };
    }

    // Check response code
    if (params.responseCode !== "00") {
      return {
        success: false,
        message: this.getVNPayErrorMessage(params.responseCode),
      };
    }

    // Update payment and order status
    await this.updatePaymentStatus(
      params.txnRef,
      params.transactionNo,
      "completed",
      params.amount
    );

    return {
      success: true,
      message: "Payment successful",
      data: {
        orderId: params.txnRef,
        transactionId: params.transactionNo,
        amount: params.amount,
      },
    };
  }

  /**
   * Verify VNPAY IPN parameters
   */
  async verifyVNPayIPN(
    params: VNPayIPNDto
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
    if (!vnp_HashSecret) {
      throw new Error("VNPAY hash secret not configured");
    }

    // Verify secure hash
    const isValidHash = this.verifySecureHash(
      params.queryParams,
      vnp_HashSecret
    );
    if (!isValidHash) {
      return { success: false, message: "Invalid secure hash" };
    }

    // Check response code
    if (params.responseCode !== "00") {
      return {
        success: false,
        message: this.getVNPayErrorMessage(params.responseCode),
      };
    }

    // Update payment and order status
    await this.updatePaymentStatus(
      params.txnRef,
      params.transactionNo,
      "completed",
      params.amount
    );

    return {
      success: true,
      message: "Payment confirmed successfully",
      data: {
        orderId: params.txnRef,
        transactionId: params.transactionNo,
        amount: params.amount,
      },
    };
  }

  /**
   * Get payment status by order ID
   */
  async getPaymentStatus(
    orderId: string,
    username: string
  ): Promise<PaymentStatusDto> {
    // Build query conditions based on whether it's an authenticated user or guest order
    let whereCondition: any = { order: { id: orderId } };
    
    if (username) {
      // For authenticated users, ensure they can only access their own orders
      whereCondition.order.customer = { username };
    } else {
      // For guest orders, ensure the order has no customer (is a guest order)
      whereCondition.order.customer = null;
    }

    const payment = await DbConnection.appDataSource.manager.findOne(Payment, {
      where: whereCondition,
      relations: ["order", "order.customer"],
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      orderId: payment.order.id,
      status: payment.status,
      amount: payment.amount,
      transactionId: payment.id,
      paymentMethod: payment.method,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(
    username: string,
    page: number = 1,
    limit: number = 10
  ) {
    // Payment history is only available for authenticated users
    if (!username) {
      throw new Error("Payment history is only available for authenticated users");
    }

    const skip = (page - 1) * limit;

    const [payments, total] =
      await DbConnection.appDataSource.manager.findAndCount(Payment, {
        where: { order: { customer: { username } } },
        relations: ["order", "order.customer"],
        order: { createdAt: "DESC" },
        skip,
        take: limit,
      });

    return {
      payments: payments.map((payment) => ({
        id: payment.id,
        orderId: payment.order.id,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      total,
    };
  }

  /**
   * Update payment and order status
   */
  private async updatePaymentStatus(
    orderId: string,
    transactionNo: string,
    status: string,
    amount: string
  ): Promise<void> {
    await DbConnection.appDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        // Find order
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        // Create or update payment record
        let payment = await transactionalEntityManager.findOne(Payment, {
          where: { order: { id: orderId } },
        });

        if (!payment) {
          payment = new Payment();
          payment.order = order;
          payment.method = "VNPAY";
        }

        payment.amount = parseFloat(amount) / 100; // Convert from VND (divide by 100)
        payment.status = status;
        await transactionalEntityManager.save(payment);

        // Update order status
        if (status === "completed") {
          order.status = OrderStatus.SHIPPING;
          order.paymentMethod = "VNPAY";
          await transactionalEntityManager.save(order);
        }
      }
    );
  }

  /**
   * Sort object by keys
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (const key of str) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  /**
   * Verify secure hash
   */
  private verifySecureHash(queryParams: any, hashSecret: string): boolean {
    try {
      const vnp_SecureHash = queryParams.vnp_SecureHash;
      delete queryParams.vnp_SecureHash;
      delete queryParams.vnp_SecureHashType;

      const sortedParams = this.sortObject(queryParams);
      const signData = new URLSearchParams(sortedParams).toString();

      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", hashSecret);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      return vnp_SecureHash === signed;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get VNPAY error message by response code
   */
  private getVNPayErrorMessage(responseCode: string): string {
    const errorMessages: { [key: string]: string } = {
      "00": "Giao dịch thành công",
      "01": "Giao dịch chưa hoàn tất",
      "02": "Giao dịch bị lỗi",
      "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
      "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
      "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "GD Hoàn trả bị từ chối",
      "10": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      "99": "Các lỗi khác",
    };

    return errorMessages[responseCode] || "Lỗi không xác định";
  }
}
