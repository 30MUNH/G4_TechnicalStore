import { IsString, IsEnum, IsOptional } from 'class-validator';

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

    @IsString()
    @IsOptional()
    cancelReason?: string;
} 