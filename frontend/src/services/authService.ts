import { AxiosError } from 'axios';
import api from './apiInterceptor';

// Extend window interface for debugging
declare global {
    interface Window {
        authService: typeof authService;
    }
}

// ================================
// TYPE DEFINITIONS
// ================================
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface VerifyLoginData {
    username: string;
    otp: string;
}

interface RegisterData {
    username: string;
    phone: string;
    password: string;
    roleSlug?: string;
}

interface VerifyRegisterData {
    username: string;
    password: string;
    phone: string;
    roleSlug: string;
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

interface AuthError extends Error {
    code?: string;
    response?: {
        status: number;
        data: ApiErrorResponse;
    };
}

interface VerifyRegisterResponse {
    data: string; // accessToken
    status: number;
}

// ================================
// UTILITY FUNCTIONS
// ================================
const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    let phoneNumber = phone.replace(/\D/g, '');
    
    // Remove leading 0 or 84 if present (for backward compatibility)
    if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('84')) {
        phoneNumber = phoneNumber.substring(2);
    }
    
    // Validate length - should be exactly 9 digits
    if (phoneNumber.length !== 9) {
        throw new Error('Invalid phone number format. Must be exactly 9 digits');
    }
    
    
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
    // ================================
    // REGISTRATION FLOW
    // ================================
    
    /**
     * Bước 1: Đăng ký tài khoản - Gửi thông tin và nhận OTP
     * @param userData { username, phone, password }
     * @returns {Promise<ApiResponse>} Thông báo OTP hoặc lỗi
     */
    async register(userData: RegisterData): Promise<ApiResponse> {
        // Validate required fields
        if (!userData.phone || !userData.password || !userData.username) {
            throw new Error('Username, phone number and password are required');
        }

        // Format phone number
        const formattedPhone = formatPhoneNumber(userData.phone);

        // Prepare request data
        const cleanedData = {
            username: userData.username.trim(),
            phone: formattedPhone,
            password: userData.password,
            roleSlug: 'customer-hmfuCdU' 
        };

        // Make API call
        const response = await api.post<ApiResponse>('/account/register', cleanedData);
        
        return response.data;
    },

    /**
     * Bước 2: Xác thực OTP đăng ký - Hoàn tất tạo tài khoản
     * @param verifyData { username, password, phone, roleSlug, otp }
     * @returns {Promise<VerifyRegisterResponse>} 
     */
    async verifyRegister(verifyData: VerifyRegisterData): Promise<VerifyRegisterResponse> {
        try {
            const formattedData = {
                username: verifyData.username,
                password: verifyData.password,
                phone: formatPhoneNumber(verifyData.phone),
                roleSlug: 'customer-hmfuCdU', 
                otp: verifyData.otp
            };

            const response = await api.post('/account/verify-register', formattedData);
            
            const handleSuccessResponse = async (accessToken: string) => {
                // Store token after successful registration to enable cart operations
                localStorage.setItem('authToken', accessToken);
                
                // Add small delay to ensure token is available for API interceptor
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Fetch and store user profile after registration
                try {
                    // Call getUserProfile method directly from authService
                    const userProfile = await authService.getUserProfile();
                    if (userProfile) {
                        localStorage.setItem('user', JSON.stringify(userProfile));
                        
                        // Trigger auth context update
                        window.dispatchEvent(new CustomEvent('auth:login', {
                            detail: { user: userProfile, token: accessToken }
                        }));
                    }
                } catch (error) {
                    // Even if profile fetch fails, we still have the token
                    // Try to create minimal user object from registration data
                    const minimalUser = {
                        username: verifyData.username,
                        phone: verifyData.phone,
                        role: 'customer',
                        isRegistered: true
                    };
                    localStorage.setItem('user', JSON.stringify(minimalUser));
                    
                    // Still trigger auth context update with minimal data
                    window.dispatchEvent(new CustomEvent('auth:login', {
                        detail: { user: minimalUser, token: accessToken }
                    }));
                }
                
                return { data: accessToken, status: response.status };
            };
            
            // Handle both old string format and new JSON format
            if (typeof response.data === 'string') {
                // Old format - treat as access token if not error message
                if (response.data.includes('OTP') || response.data.includes('wrong') || response.data.includes('expired')) {
                    throw new Error(response.data);
                }
                return await handleSuccessResponse(response.data);
            } else if (response.data && response.data.success) {
                // New JSON format - success
                return await handleSuccessResponse(response.data.data);
            } else {
                console.error('❌ JSON error response format:', response.data);
                // New JSON format - error
                throw new Error(response.data?.message || 'Verification failed');
            }
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('❌ OTP verification error details:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message,
                config: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method
                }
            });
            console.groupEnd();
            throw error;
        }
    },

    /**
     * Gửi lại OTP (có thể dùng cho cả đăng ký và login)
     * @param phone số điện thoại (cho registration)
     * @param username tên đăng nhập (cho login) 
     * @param isForLogin boolean - true nếu dùng cho login, false nếu dùng cho register
     * @returns Promise<ApiResponse>
     */
    async resendOTP({ phone, username, isForLogin = false }: { phone?: string, username?: string, isForLogin?: boolean }): Promise<ApiResponse> {
        try {
            let requestData;
            
            if (isForLogin && username) {
                // Login flow - use username directly
                requestData = { username: username.trim() };
            } else if (!isForLogin && phone) {
                // Registration flow - format phone number
                const formattedPhone = formatPhoneNumber(phone);
                requestData = { username: formattedPhone };
            } else {
                throw new Error('Invalid parameters: provide username for login or phone for registration');
            }
            
            const response = await api.post('/account/resend-otp', requestData);
            
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'OTP đã được gửi lại'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                message: (axiosError.response?.data as ApiErrorResponse)?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.'
            };
        }
    },

    // ================================
    // LOGIN FLOW
    // ================================
    
    /**
     
     * @param credentials { username, password }
     * @returns {Promise<string>} Thông báo OTP hoặc lỗi
     */
    async login(credentials: LoginCredentials): Promise<string> {
        try {
            if (!credentials.username || !credentials.password) {
                throw new Error('Username and password are required');
            }
            
            const cleanedCredentials = {
                username: credentials.username.trim(),
                password: credentials.password
            };
            
            const response = await api.post('/account/login', cleanedCredentials);
            
            return response.data;
        } catch (error: unknown) {
            if (isErrorWithMessage(error) && 'response' in error) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    /**
     
     * @param verifyData { username, otp }
     * @returns {Promise<string>} accessToken hoặc lỗi
     */
    async verifyLogin(verifyData: VerifyLoginData): Promise<string> {
        try {
            if (!verifyData.username || !verifyData.otp) {
                throw new Error('Username and OTP are required');
            }
            const cleanedData = {
                username: verifyData.username.trim(),
                otp: verifyData.otp.trim()
            };
            const response = await api.post('/account/verify-login', cleanedData);
            
            // Store token after successful login and fetch user profile
            if (response.data && typeof response.data === 'string') {
                localStorage.setItem('authToken', response.data);
                
                // Fetch and store user profile
                try {
                    const userProfile = await this.getUserProfile();
                    if (userProfile) {
                        localStorage.setItem('user', JSON.stringify(userProfile));
                    }
                } catch (error) {
                    // Silent fail - user can still use the app
                }
            }
            
            return response.data;
        } catch (error: unknown) {
            if (isErrorWithMessage(error) && 'response' in error) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    // ================================
    // PASSWORD MANAGEMENT
    // ================================
    
    /**
     * Request password reset - gửi OTP để reset password
     * @param username tên đăng nhập
     * @returns Promise<{ success: boolean, message: string }>
     */
    async requestPasswordReset(username: string) {
        try {
            const response = await api.post('/account/forgot-password', { username: username });
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'OTP đã được gửi'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                message: (axiosError.response?.data as ApiErrorResponse)?.message || 'Failed to send OTP'
            };
        }
    },

    /**
     * Xác thực OTP và reset password
     * @param username tên đăng nhập
     * @param otp mã OTP
     * @param newPassword mật khẩu mới
     * @returns Promise<{ success: boolean, message: string }>
     */
    async verifyResetOTP({ username, otp, newPassword }: { username: string, otp: string, newPassword: string }) {
        try {
            const response = await api.post('/account/verify-change-password', {
                username: username,
                otp,
                newPassword
            });
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'Password reset successfully'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                message: (axiosError.response?.data as ApiErrorResponse)?.message || 'Failed to reset password'
            };
        }
    },

    // ================================
    // USER MANAGEMENT
    // ================================
    
    /**
     
     * @returns 
     */
    async getUserProfile() {
        const response = await api.get('/account/details');
        return response.data;
    },

    /**
     * Đăng xuất
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    /**
     * Kiểm tra trạng thái đăng nhập
     * @returns boolean
     */
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    },

    /**
     * Lấy token
     * @returns string | null
     */
    getToken() {
        return localStorage.getItem('authToken');
    },

    /**
     * Lấy thông tin user từ localStorage
     * @returns any | null
     */
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get username by phone number
     * @param phone Phone number
     * @returns Promise<string | null> Username if found, null otherwise
     */
    async getUsernameByPhone(phone: string): Promise<string | null> {
        try {
            const formattedPhone = formatPhoneNumber(phone);
            const response = await api.get(`/account/username/${formattedPhone}`);
            return response.data?.username || null;
        } catch (error) {
            console.error('Error getting username by phone:', error);
            return null;
        }
    },

    /**
     * Debug utility - Check complete auth state
     * @returns object with auth state details
     */
    debugAuthState() {
        const token = this.getToken();
        const user = this.getUser();
        const isAuth = this.isAuthenticated();
        
        const authState = {
            // Token info
            hasToken: !!token,
            tokenLength: token?.length,
            tokenPreview: token?.substring(0, 30) + '...' || 'No token',
            
            // User info
            hasUser: !!user,
            userInfo: user,
            
            // Auth status
            isAuthenticated: isAuth,
            
            // SessionStorage info
            registrationSuccess: !!sessionStorage.getItem('registrationSuccess'),
            loginSuccess: !!sessionStorage.getItem('loginSuccess'),
            
            // Current timestamp
            timestamp: new Date().toLocaleString()
        };
        
        return authState;
    }
};

// Expose authService to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.authService = authService;
} 