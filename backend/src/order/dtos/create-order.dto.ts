import { IsString, IsOptional, IsNotEmpty, Length, IsBoolean, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestInfoDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    email: string;
}

export class GuestCartItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    @Length(10, 500, { message: 'Địa chỉ giao hàng phải có độ dài từ 10 đến 500 ký tự' })
    shippingAddress: string;

    @IsString()
    @IsOptional()
    @Length(0, 500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
    note?: string;

    @IsString()
    @IsOptional()
    @Length(0, 100, { message: 'Hình thức thanh toán không được vượt quá 100 ký tự' })
    paymentMethod?: string;

    @IsBoolean()
    @IsOptional()
    requireInvoice?: boolean = false;

    // Guest order fields
    @IsBoolean()
    @IsOptional()
    isGuest?: boolean;

    @ValidateNested()
    @Type(() => GuestInfoDto)
    @IsOptional()
    guestInfo?: GuestInfoDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GuestCartItemDto)
    @IsOptional()
    guestCartItems?: GuestCartItemDto[];
} 