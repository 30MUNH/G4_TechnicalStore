import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  QueryParam,
  Req,
  UseBefore,
} from "routing-controllers";
import { Service } from "typedi";
import { InvoiceService } from "./invoice.service";
import { Auth, Admin, Staff } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";

@Service()
@Controller("/invoices")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * Create invoice for order (automatically called when order is created)
   * POST /api/invoices/create
   */
  @Post("/create")
  @UseBefore(Auth)
  async createInvoice(
    @Body() body: { orderId: string; paymentMethod?: string },
    @Req() req: any
  ) {
    try {
      const invoice = await this.invoiceService.createInvoiceForOrder(
        body.orderId,
        body.paymentMethod || 'COD'
      );

      return {
        success: true,
        message: "Invoice created successfully",
        data: invoice
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create invoice",
        error: error.message
      };
    }
  }

  /**
   * Get invoice by order ID
   * GET /api/invoices/order/:orderId
   */
  @Get("/order/:orderId")
  @UseBefore(Auth)
  async getInvoiceByOrderId(@Param("orderId") orderId: string, @Req() req: any) {
    try {
      const user = req.user as AccountDetailsDto;
      const invoice = await this.invoiceService.getInvoiceByOrderId(orderId);

      if (!invoice) {
        return {
          success: false,
          message: "Invoice not found"
        };
      }

      // Check if user owns this order or is admin/staff
      const isOwner = invoice.order.customer.username === user.username;
      const isAdminOrStaff = user.role?.name === 'admin' || user.role?.name === 'staff';

      if (!isOwner && !isAdminOrStaff) {
        return {
          success: false,
          message: "Unauthorized access to invoice"
        };
      }

      return {
        success: true,
        data: invoice
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to get invoice",
        error: error.message
      };
    }
  }

  /**
   * Get invoice by invoice number
   * GET /api/invoices/number/:invoiceNumber
   */
  @Get("/number/:invoiceNumber")
  @UseBefore(Auth)
  async getInvoiceByNumber(@Param("invoiceNumber") invoiceNumber: string, @Req() req: any) {
    try {
      const user = req.user as AccountDetailsDto;
      const invoice = await this.invoiceService.getInvoiceByNumber(invoiceNumber);

      if (!invoice) {
        return {
          success: false,
          message: "Invoice not found"
        };
      }

      // Check if user owns this order or is admin/staff
      const isOwner = invoice.order.customer.username === user.username;
      const isAdminOrStaff = user.role?.name === 'admin' || user.role?.name === 'staff';

      if (!isOwner && !isAdminOrStaff) {
        return {
          success: false,
          message: "Unauthorized access to invoice"
        };
      }

      return {
        success: true,
        data: invoice
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to get invoice",
        error: error.message
      };
    }
  }

  /**
   * Get user's invoices
   * GET /api/invoices/my
   */
  @Get("/my")
  @UseBefore(Auth)
  async getMyInvoices(
    @Req() req: any,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    try {
      const user = req.user as AccountDetailsDto;
      const result = await this.invoiceService.getInvoicesByCustomer(
        user.username,
        page,
        limit
      );

      return {
        success: true,
        data: result.invoices,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to get invoices",
        error: error.message
      };
    }
  }

  /**
   * Mark invoice as paid (for COD - admin/staff only)
   * PUT /api/invoices/:id/paid
   */
  @Put("/:id/paid")
  @UseBefore(Staff)
  async markAsPaid(@Param("id") invoiceId: string) {
    try {
      const invoice = await this.invoiceService.markInvoiceAsPaid(invoiceId);

      return {
        success: true,
        message: "Invoice marked as paid successfully",
        data: invoice
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to mark invoice as paid",
        error: error.message
      };
    }
  }

  /**
   * Cancel invoice (admin only)
   * PUT /api/invoices/:id/cancel
   */
  @Put("/:id/cancel")
  @UseBefore(Admin)
  async cancelInvoice(
    @Param("id") invoiceId: string,
    @Body() body: { reason?: string }
  ) {
    try {
      const invoice = await this.invoiceService.cancelInvoice(
        invoiceId,
        body.reason
      );

      return {
        success: true,
        message: "Invoice cancelled successfully",
        data: invoice
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to cancel invoice",
        error: error.message
      };
    }
  }
} 