import { IsString, IsEnum, IsOptional, ValidateIf, IsNotEmpty, Length } from 'class-validator';

export enum OrderStatus {
    PENDING = 'PENDING',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    PENDING_EXTERNAL_SHIPPING = 'PENDING_EXTERNAL_SHIPPING' // Đơn hàng chờ giao qua đối tác
}

export class UpdateOrderDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ValidateIf(o => o.status === OrderStatus.CANCELLED)
    @IsString()
    @IsNotEmpty()
    @Length(10, 200, { message: 'Cancellation reason must be between 10 and 200 characters' })
    cancelReason?: string;
} 