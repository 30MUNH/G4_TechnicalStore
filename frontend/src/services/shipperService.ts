import api from './apiInterceptor';
import type {
  ApiResponse,
  IShipper,
  CreateShipperDto,
  UpdateShipperDto,
  ApiError
} from './types';

export const shipperService = {
  
  async getAllShippers(): Promise<ApiResponse<IShipper[]>> {
    try {
      const response = await api.get<ApiResponse<IShipper[]>>('/shippers');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get all shippers error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

 
  async getAvailableShippers(): Promise<ApiResponse<IShipper[]>> {
    try {
      const response = await api.get<ApiResponse<IShipper[]>>('/shippers/available');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get available shippers error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async getShipperById(id: string): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.get<ApiResponse<IShipper>>(`/shippers/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get shipper by ID error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async createShipper(shipperData: CreateShipperDto): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.post<ApiResponse<IShipper>>('/shippers', shipperData);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Create shipper error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async updateShipper(id: string, updateData: UpdateShipperDto): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.put<ApiResponse<IShipper>>(`/shippers/${id}`, updateData);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update shipper error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async deleteShipper(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/shippers/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Delete shipper error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async exportShippers(): Promise<ApiResponse<Blob>> {
    try {
      const response = await api.get('/shippers/export', {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
        message: 'Export successful',
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Export shippers error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  }
}; 