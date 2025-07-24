import { IsString, IsEnum, IsOptional, ValidateIf, IsNotEmpty, Length } from 'class-validator';

export enum OrderStatus {
    PENDING = 'PENDING',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    PENDING_EXTERNAL_SHIPPING = 'PENDING_EXTERNAL_SHIPPING' // Đơn hàng chờ giao qua đối tác
}

export class UpdateOrderDto {
    @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
    @IsNotEmpty({ message: 'Trạng thái đơn hàng không được để trống' })
    status: OrderStatus;

    @ValidateIf(o => o.status === OrderStatus.CANCELLED)
    @IsString({ message: 'Lý do hủy phải là chuỗi' })
    @IsNotEmpty({ message: 'Lý do hủy không được để trống khi hủy đơn hàng' })
    @Length(10, 200, { message: 'Lý do hủy phải từ 10-200 ký tự' })
    cancelReason?: string;
} 