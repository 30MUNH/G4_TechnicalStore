import api from './apiInterceptor';
import { OrderStatus } from '../types/order';

export interface CreateOrderDto {
    shippingAddress: string;
    note?: string;
}

export interface UpdateOrderDto {
    status: OrderStatus;
    cancelReason?: string;
}

export const orderService = {
    async createOrder(createOrderDto: CreateOrderDto) {
        try {
            const response = await api.post('/orders', createOrderDto);
            return response.data;
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Create order failed:', error);
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Đặt hàng thất bại';
            throw new Error(errorMsg || 'Đặt hàng thất bại');
        }
    },

    async getOrders() {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch (error) {
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Không thể lấy danh sách đơn hàng';
            throw new Error(errorMsg || 'Không thể lấy danh sách đơn hàng');
        }
    },

    async getOrderById(id: string) {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Không thể lấy thông tin đơn hàng';
            throw new Error(errorMsg || 'Không thể lấy thông tin đơn hàng');
        }
    },

    async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {
        try {
            const response = await api.patch(`/orders/${id}/status`, updateOrderDto);
            return response.data;
        } catch (error) {
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Cập nhật trạng thái đơn hàng thất bại';
            throw new Error(errorMsg || 'Cập nhật trạng thái đơn hàng thất bại');
        }
    },

    async getOrderStatistics() {
        try {
            const response = await api.get('/orders/statistics');
            return response.data;
        } catch (error) {
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Không thể lấy thống kê đơn hàng';
            throw new Error(errorMsg || 'Không thể lấy thống kê đơn hàng');
        }
    }
}; 