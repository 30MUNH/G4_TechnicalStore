import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    @Length(10, 500, { message: 'Địa chỉ giao hàng phải có độ dài từ 10 đến 500 ký tự' })
    shippingAddress: string;

    @IsString()
    @IsOptional()
    @Length(0, 1000, { message: 'Ghi chú không được vượt quá 1000 ký tự' })
    note?: string;

    @IsString()
    @IsOptional()
    @Length(0, 100, { message: 'Hình thức thanh toán không được vượt quá 100 ký tự' })
    paymentMethod?: string;
} 