import api from './apiInterceptor';
import { OrderStatus } from '../types/order';

interface ErrorResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        success: boolean;
        message?: string;
        error?: string;
    };
}

export interface CreateOrderDto {
    shippingAddress: string;
    note?: string;
    paymentMethod: 'Cash on delivery' | 'Online payment';
    requireInvoice?: boolean;
    isGuest?: boolean;
    guestInfo?: {
        fullName: string;
        phone: string;
        email: string;
    };
    guestCartItems?: Array<{
        productId: string;
        quantity: number;
        price: number;
        name: string;
    }>;
}

export interface UpdateOrderDto {
    status: OrderStatus;
    cancelReason?: string;
}

export interface GetOrdersByShipperParams {
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
}

export interface UpdateOrderByShipperDto {
    status: string;
    reason?: string;
}

export const orderService = {
    async createOrder(createOrderDto: CreateOrderDto) {
        try {
            const response = await api.post('/orders', createOrderDto);
            const responseData = response.data;

            // Check for nested error structure
            if (responseData.data?.success === false) {
                throw new Error(responseData.data.message || responseData.data.error || 'Order creation failed');
            }

            // Return the response data
            return responseData;
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Create order failed:', error);
            
            // Handle nested error structure
            if (error instanceof Error && 'response' in error) {
                const responseError = error as { response?: { data?: ErrorResponse } };
                const errorData = responseError.response?.data;
                
                // Check for nested error structure
                if (errorData?.data?.success === false) {
                    throw new Error(errorData.data.message || errorData.data.error || 'Order creation failed');
                }
                
                // Check for regular error structure
                if (errorData?.message) {
                    throw new Error(errorData.message);
                }
            }
            
            throw new Error('Đặt hàng thất bại');
        }
    },

    async getOrders(params = { limit: 10000, page: 1 }) { // Đặt limit rất cao để lấy tất cả đơn hàng
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    const strValue = String(value);
                    if (strValue !== '') {
                        queryParams.append(key, strValue);
                    }
                }
            });

            const queryString = queryParams.toString();
            const url = `/orders${queryString ? '?' + queryString : ''}`;
            
            const response = await api.get(url);
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
    },

    // =============== SHIPPER-SPECIFIC METHODS ===============
    
    async getOrdersByShipper(shipperId: string, params: GetOrdersByShipperParams = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const queryString = queryParams.toString();
            const url = `/shippers/${shipperId}/orders${queryString ? '?' + queryString : ''}`;
            
            console.log('🚀 [ORDER_SERVICE] Fetching orders by shipper:', { shipperId, url, params });
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Get orders by shipper failed:', error);
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Không thể lấy danh sách đơn hàng của shipper';
            throw new Error(errorMsg || 'Không thể lấy danh sách đơn hàng của shipper');
        }
    },

    async updateOrderStatusByShipper(shipperId: string, orderId: string, updateData: UpdateOrderByShipperDto) {
        try {
            console.log('🚀 [ORDER_SERVICE] Updating order status by shipper:', { 
                shipperId, 
                orderId, 
                updateData 
            });
            
            const response = await api.put(`/shippers/${shipperId}/orders/${orderId}/status`, updateData);
            return response.data;
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Update order status by shipper failed:', error);
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Cập nhật trạng thái đơn hàng thất bại';
            throw new Error(errorMsg || 'Cập nhật trạng thái đơn hàng thất bại');
        }
    },

    // =============== ADMIN/STAFF METHODS ===============
    
    async getAllOrdersForAdmin(params = {}) {
        try {
            console.log('🚀 [ORDER_SERVICE] Fetching all orders for admin:', params);
            
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const queryString = queryParams.toString();
            const url = `/orders/admin${queryString ? '?' + queryString : ''}`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Get all orders for admin failed:', error);
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Không thể lấy danh sách đơn hàng';
            throw new Error(errorMsg || 'Không thể lấy danh sách đơn hàng');
        }
    },

    async deleteOrder(id: string) {
        try {
            console.log('🚀 [ORDER_SERVICE] Deleting order:', id);
            
            const response = await api.delete(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Delete order failed:', error);
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Xóa đơn hàng thất bại';
            throw new Error(errorMsg || 'Xóa đơn hàng thất bại');
        }
    },

    async exportOrders() {
        try {
            console.log('🚀 [ORDER_SERVICE] Exporting orders...');
            
            const response = await api.get('/orders/export', {
                responseType: 'blob',
            });
            
            return {
                success: true,
                data: response.data,
                message: 'Export successful',
            };
        } catch (error) {
            console.error('❌ [ORDER_SERVICE] Export orders failed:', error);
            const errorMsg = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : 'Xuất dữ liệu thất bại';
            throw new Error(errorMsg || 'Xuất dữ liệu thất bại');
        }
    }
}; 