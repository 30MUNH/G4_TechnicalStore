import {
  Body,
  Controller,
  Get,
  Post,
  QueryParam,
  Req,
  Res,
  UseBefore,
  Param,
  HttpCode,
} from "routing-controllers";
import { Service } from "typedi";
import { PaymentService } from "./payment.service";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";
import { Response } from "express";
import { CreatePaymentDto } from "./dtos/payment.dto";
import { JwtService } from "@/auth/jwt/jwt.service";

@Service()
@Controller("/payment")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Create VNPAY payment URL - supports both authenticated and guest users
   * POST /api/payment/create-vnpay-url
   */
  @Post("/create-vnpay-url")
  async createVNPayUrl(
    @Req() req: any,
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    try {
      let username = null;
      
      // Try to get user from Authorization header if present
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decodedToken = this.jwtService.verifyAccessToken(token);
          if (decodedToken && decodedToken.username) {
            username = decodedToken.username;
          }
        } catch (error) {
          // Invalid token - treat as guest user
          username = null;
        }
      }

      const paymentUrl = await this.paymentService.createVNPayUrl(
        username,
        createPaymentDto
      );

      return {
        success: true,
        message: "Payment URL created successfully",
        data: {
          paymentUrl,
          orderId: createPaymentDto.orderId,
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create payment URL",
        error: error.message
      };
    }
  }

  /**
   * VNPAY Return URL - handles user redirect after payment
   * GET /api/payment/vnpay-return
   */
  @Get("/vnpay-return")
  async handleVNPayReturn(
    @QueryParam("vnp_ResponseCode") responseCode: string,
    @QueryParam("vnp_TxnRef") txnRef: string,
    @QueryParam("vnp_Amount") amount: string,
    @QueryParam("vnp_TransactionNo") transactionNo: string,
    @QueryParam("vnp_SecureHash") secureHash: string,
    @QueryParam("vnp_OrderInfo") orderInfo: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const result = await this.paymentService.verifyVNPayReturn({
      responseCode,
      txnRef,
      amount,
      transactionNo,
      secureHash,
      orderInfo,
      queryParams: req.query,
    });

    if (result.success) {
      // Redirect to frontend success page
      const frontendUrl =
        process.env.VNPAY_RETURN_URL || "http://localhost:5173/vnpay-payment";
      res.redirect(
        `${frontendUrl}?status=success&orderId=${txnRef}&transactionId=${transactionNo}`
      );
    } else {
      // Redirect to frontend error page
      const frontendUrl =
        process.env.VNPAY_RETURN_URL || "http://localhost:5173/vnpay-payment";
      res.redirect(
        `${frontendUrl}?status=error&orderId=${txnRef}&error=${result.message}`
      );
    }
  }

  /**
   * VNPAY IPN URL - handles server-to-server notification
   * POST /api/payment/vnpay-ipn
   */
  @Post("/vnpay-ipn")
  @HttpCode(200)
  async handleVNPayIPN(
    @Body() body: any,
    @Req() req: any,
    @Res() res: Response
  ) {
    const result = await this.paymentService.verifyVNPayIPN({
      ...body,
      queryParams: req.body,
    });

    if (result.success) {
      res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      res.status(400).json({ RspCode: "99", Message: result.message });
    }
  }

  /**
   * Get payment status by order ID - supports both authenticated and guest users
   * GET /api/payment/status/:orderId
   */
  @Get("/status/:orderId")
  async getPaymentStatus(@Param("orderId") orderId: string, @Req() req: any) {
    try {
      let username = null;
      
      // Try to get user from Authorization header if present
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decodedToken = this.jwtService.verifyAccessToken(token);
          if (decodedToken && decodedToken.username) {
            username = decodedToken.username;
          }
        } catch (error) {
          // Invalid token - treat as guest user
          username = null;
        }
      }

      const paymentStatus = await this.paymentService.getPaymentStatus(
        orderId,
        username
      );

      return {
        success: true,
        message: "Payment status retrieved successfully",
        data: paymentStatus
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to get payment status",
        error: error.message
      };
    }
  }

  /**
   * Get payment history for user
   * GET /api/payment/history
   */
  @Get("/history")
  @UseBefore(Auth)
  async getPaymentHistory(
    @Req() req: any,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    const user = req.user as AccountDetailsDto;
    const history = await this.paymentService.getPaymentHistory(
      user.username,
      page,
      limit
    );

    return {
      payments: history.payments,
      pagination: {
        page,
        limit,
        total: history.total,
        totalPages: Math.ceil(history.total / limit),
      },
    };
  }
}
