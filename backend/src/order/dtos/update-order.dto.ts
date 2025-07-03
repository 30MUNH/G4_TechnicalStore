import { IsString, IsEnum, IsOptional, ValidateIf, IsNotEmpty, Length } from 'class-validator';

export enum OrderStatus {
    PENDING = 'Đang chờ',
    PROCESSING = 'Đang xử lý',
    SHIPPING = 'Đang giao',
    DELIVERED = 'Đã giao',
    CANCELLED = 'Đã hủy'
}

export class UpdateOrderDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ValidateIf(o => o.status === OrderStatus.CANCELLED)
    @IsString()
    @IsNotEmpty()
    @Length(10, 500, { message: 'Lý do hủy đơn hàng phải có độ dài từ 10 đến 500 ký tự' })
    cancelReason?: string;
} 