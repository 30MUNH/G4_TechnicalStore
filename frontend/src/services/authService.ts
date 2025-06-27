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
    data?: any;
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

const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    let phoneNumber = phone.replace(/\D/g, '');
    
    // Remove leading 0 or 84
    if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('84')) {
        phoneNumber = phoneNumber.substring(2);
    }
    
    // Add 84 prefix without +
    return '84' + phoneNumber;
};

export const authService = {
    async login(credentials: LoginCredentials) {
        try {
            // Validate input
            if (!credentials.username || !credentials.password) {
                throw new Error('Username and password are required');
            }

            // Clean input
            const cleanedCredentials = {
                username: credentials.username.toLowerCase().trim(),
                password: credentials.password
            };

            console.log('Sending login request with:', {
                username: cleanedCredentials.username,
                password: '***'
            });

            const response = await api.post('/account/login', cleanedCredentials);
            
            // Log response for debugging
            if (response.data) {
                console.log('Login response type:', typeof response.data);
                console.log('Login response:', 
                    typeof response.data === 'string' 
                        ? response.data 
                        : 'Response is an object'
                );
            }

            return response.data;
        } catch (error) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    async verifyLogin(verifyData: VerifyLoginData) {
        try {
            // Validate input
            if (!verifyData.username || !verifyData.otp) {
                throw new Error('Username and OTP are required');
            }

            // Clean input
            const cleanedData = {
                username: verifyData.username.toLowerCase().trim(),
                otp: verifyData.otp.trim()
            };

            console.log('Sending verify login request with:', cleanedData);
            
            const response = await api.post('/account/verify-login', cleanedData);
            
            // Log response for debugging
            console.log('Verify login response type:', typeof response.data);
            console.log('Verify login response:', 
                typeof response.data === 'string' 
                    ? response.data 
                    : 'Response is an object'
            );

            // Handle token storage
            if (response.data) {
                if (typeof response.data === 'string') {
                    localStorage.setItem('authToken', response.data);
                } else if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }
            }

            return response.data;
        } catch (error) {
            console.error('Verify login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
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
    }
}; 