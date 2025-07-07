import api from "./apiInterceptor";
import { AxiosError } from "axios";

// Interfaces
export interface IRole {
  id: string;
  name: string;
  slug: string;
}

export interface IAccount {
  id: string;
  username: string;
  phone: string;
  role: IRole;
  createdAt: string;
  isRegistered: boolean;
}

export interface CreateAccountDto {
  username: string;
  password: string;
  phone: string;
  roleSlug: string;
}

export interface UpdateAccountDto {
  username?: string;
  password?: string;
  phone?: string;
  roleSlug?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export const accountService = {
  async createAccount(
    accountData: CreateAccountDto
  ): Promise<ApiResponse<IAccount>> {
    try {
      const response = await api.post<IAccount>("/account/create", accountData);
      return {
        success: true,
        data: response.data,
        message: "Account created successfully",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Create account error:",
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  },

  async updateAccount(
    username: string,
    updateData: UpdateAccountDto
  ): Promise<ApiResponse<IAccount>> {
    try {
      const response = await api.patch<IAccount>("/account/update", {
        username,
        ...updateData,
      });
      return {
        success: true,
        data: response.data,
        message: "Account updated successfully",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Update account error:",
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  },

  async deleteAccount(username: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<void>("/account/delete", {
        data: { username },
      });
      return {
        success: true,
        data: response.data,
        message: "Account deleted successfully",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Delete account error:",
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  },

  async getAllAccounts(): Promise<ApiResponse<IAccount[]>> {
    try {
      const response = await api.get<IAccount[]>("/account/all");
      return {
        success: true,
        data: response.data,
        message: "Accounts retrieved successfully",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Get all accounts error:",
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  },

  async getAccountDetails(username?: string): Promise<ApiResponse<IAccount>> {
    try {
      const response = await api.get<IAccount>("/account/details");
      return {
        success: true,
        data: response.data,
        message: "Account details retrieved successfully",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error(
        "Get account details error:",
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  },
};
