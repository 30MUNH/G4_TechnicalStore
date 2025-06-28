import { AxiosError } from 'axios';
import api from './apiInterceptor';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface VerifyLoginData {
    username: string;
    otp: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

interface RegisterData {
    username: string;
    phone: string;
    password: string;
    roleSlug?: string;
}

interface VerifyRegisterData {
    username: string;
    phone: string;
    otp: string;
}

interface AuthError extends Error {
    code?: string;
    response?: {
        status: number;
        data: ApiErrorResponse;
    };
}

const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    let phoneNumber = phone.replace(/\D/g, '');
    
    // Remove leading 0 or 84 or +84
    if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('84')) {
        phoneNumber = phoneNumber.substring(2);
    }
    
    // Validate length after removing prefix
    if (phoneNumber.length !== 9) {
        throw new Error('Invalid phone number format. Must be 10 digits with leading 0 or 9 digits without leading 0');
    }
    
    // Always return with +84 prefix
    return '+84' + phoneNumber;
};

const handleAuthError = (error: AuthError): never => {
    const errorResponse = error.response?.data;
    const status = error.response?.status;

    let errorMessage = 'An unexpected error occurred';

    if (status === 401) {
        errorMessage = 'Invalid credentials or session expired';
    } else if (status === 400) {
        errorMessage = errorResponse?.message || errorResponse?.error || 'Invalid input data';
    } else if (status === 404) {
        errorMessage = 'Account not found';
    } else if (status === 429) {
        errorMessage = 'Too many attempts. Please try again later';
    } else if (!navigator.onLine) {
        errorMessage = 'No internet connection';
    }

    error.message = errorMessage;
    throw error;
};

// Helper type guard
function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    );
}

export const authService = {
    /**
     * Đăng nhập: Gửi username và password, nhận thông báo OTP nếu thành công
     * @param credentials { username, password }
     * @returns {Promise<string>} Thông báo OTP hoặc lỗi
     */
    async login(credentials: LoginCredentials): Promise<string> {
        try {
            if (!credentials.username || !credentials.password) {
                throw new Error('Username and password are required');
            }
            const cleanedCredentials = {
                username: credentials.username.toLowerCase().trim(),
                password: credentials.password
            };
            const response = await api.post('/account/login', cleanedCredentials);
            return response.data;
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    /**
     * Xác thực OTP: Gửi username và otp, nhận accessToken nếu thành công
     * @param verifyData { username, otp }
     * @returns {Promise<string>} accessToken hoặc lỗi
     */
    async verifyLogin(verifyData: VerifyLoginData): Promise<string> {
        try {
            if (!verifyData.username || !verifyData.otp) {
                throw new Error('Username and OTP are required');
            }
            const cleanedData = {
                username: verifyData.username.toLowerCase().trim(),
                otp: verifyData.otp.trim()
            };
            const response = await api.post('/account/verify-login', cleanedData);
            return response.data;
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    async getUserProfile() {
        try {
            const response = await api.get('/account/profile');
            return response.data;
        } catch (error) {
            console.error('Get user profile error:', error.response?.data || error.message);
            throw error;
        }
    },

    async register(userData: RegisterData): Promise<ApiResponse> {
        try {
            if (!userData.phone || !userData.password || !userData.username) {
                throw new Error('Username, phone number and password are required');
            }

            const formattedPhone = formatPhoneNumber(userData.phone);
            console.log('Original phone:', userData.phone);
            console.log('Formatted phone:', formattedPhone);

            const cleanedData = {
                username: userData.username.trim(),
                phone: formattedPhone,
                password: userData.password,
                roleSlug: 'customer'
            };

            console.log('Sending registration request with data:', {
                ...cleanedData,
                password: '***' // Hide password in logs
            });

            const response = await api.post<ApiResponse>('/account/register', cleanedData);
            console.log('Registration response:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Detailed registration error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
                request: axiosError.config?.data
            });
            throw error;
        }
    },

    async verifyRegister(verifyData: VerifyRegisterData): Promise<ApiResponse> {
        try {
            // Ensure phone number is in correct format
            const formattedData = {
                ...verifyData,
                phone: formatPhoneNumber(verifyData.phone)
            };

            const response = await api.post<ApiResponse>('/account/verify-register', formattedData);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Verification error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message
            });
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    },

    getToken() {
        return localStorage.getItem('authToken');
    },

    getUser() {
        const user = localStorage.getItem('user');
        try {
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    },

    // Gửi OTP quên mật khẩu
    async requestPasswordReset(phone: string) {
        try {
            const formattedPhone = formatPhoneNumber(phone);
            const response = await api.post('/account/forgot-password', { username: formattedPhone });
            return response.data;
        } catch (error) {
            if (isErrorWithMessage(error)) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    // Xác thực OTP và đổi mật khẩu
    async verifyResetOTP({ username, otp, newPassword }: { username: string, otp: string, newPassword: string }) {
        try {
            const formattedPhone = formatPhoneNumber(username);
            const response = await api.post('/account/verify-change-password', {
                username: formattedPhone,
                otp,
                newPassword
            });
            return response.data;
        } catch (error) {
            if (isErrorWithMessage(error)) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    }
}; 