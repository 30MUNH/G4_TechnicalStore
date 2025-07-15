import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  orderInfo?: string;

  @IsOptional()
  @IsString()
  locale?: string = "vn";
}

export class VNPayReturnDto {
  @IsString()
  responseCode: string;

  @IsString()
  txnRef: string;

  @IsString()
  amount: string;

  @IsString()
  transactionNo: string;

  @IsString()
  secureHash: string;

  @IsString()
  orderInfo: string;

  queryParams: any;
}

export class VNPayIPNDto {
  @IsString()
  responseCode: string;

  @IsString()
  txnRef: string;

  @IsString()
  amount: string;

  @IsString()
  transactionNo: string;

  @IsString()
  secureHash: string;

  @IsString()
  orderInfo: string;

  queryParams: any;
}

export class PaymentStatusDto {
  orderId: string;
  status: string;
  amount: number;
  transactionId?: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}
