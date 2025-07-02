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

// Format phone number for login (chỉ cần 9 số, không có số 0 đầu)
const formatPhoneNumberForLogin = (phone: string): string => {
    // Remove all non-digits
    let phoneNumber = phone.replace(/\D/g, '');
    
    // Remove leading 0 if exists
    if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
    }
    
    // Validate length - chỉ cần 9 số
    if (phoneNumber.length !== 9) {
        throw new Error('Số điện thoại phải có đúng 9 số (không bao gồm số 0 đầu)');
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



// ================================
// AUTH SERVICE
// ================================
/**
 * HƯỚNG DẪN SỬ DỤNG SỐ ĐIỆN THOẠI:
 * 
 * - ĐĂNG KÝ: Nhập 10 số (bao gồm số 0 đầu) hoặc 9 số (không có số 0 đầu)
 *   Ví dụ: "0912345678" hoặc "912345678"
 * 
 * - LOGIN/FORGOT PASSWORD: Chỉ nhập 9 số (không có số 0 đầu)  
 *   Ví dụ: "912345678"
 * 
 * - Tất cả sẽ được convert thành format +84xxxxxxxxx để gửi lên server
 */
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
        console.group('🔍 [DEBUG] Registration Process');
        console.log('📥 Raw input data:', {
            username: userData.username,
            phone: userData.phone,
            passwordLength: userData.password?.length,
            roleSlug: userData.roleSlug
        });
        
        try {
            // Validate required fields
            if (!userData.phone || !userData.password || !userData.username) {
                console.error('❌ Missing required fields:', {
                    hasUsername: !!userData.username,
                    hasPhone: !!userData.phone,
                    hasPassword: !!userData.password
                });
                throw new Error('Username, phone number and password are required');
            }

            // Format phone number
            const formattedPhone = formatPhoneNumber(userData.phone);
            console.log('📱 Phone formatting:', {
                original: userData.phone,
                formatted: formattedPhone
            });

            // Prepare request data
            const cleanedData = {
                username: userData.username.trim(),
                phone: formattedPhone,
                password: userData.password,
                roleSlug: 'customer-hmfuCdU' // Đúng roleSlug từ database
            };

            console.log('📤 Sending registration request:', {
                ...cleanedData,
                password: '***' 
            });

            // Make API call
            const response = await api.post<ApiResponse>('/account/register', cleanedData);
            
            console.log('📨 Server response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });
            
            console.groupEnd();
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('❌ Registration error details:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message,
                config: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                    data: axiosError.config?.data ? JSON.parse(axiosError.config.data) : null
                }
            });
            console.groupEnd();
            throw error;
        }
    },

    /**
     * Bước 2: Xác thực OTP đăng ký - Hoàn tất tạo tài khoản
     * @param verifyData { username, password, phone, roleSlug, otp }
     * @returns {Promise<VerifyRegisterResponse>} accessToken hoặc lỗi
     */
    async verifyRegister(verifyData: VerifyRegisterData): Promise<VerifyRegisterResponse> {
        console.group('🔍 [DEBUG] OTP Verification Process');
        console.log('📥 OTP verification input:', {
            username: verifyData.username,
            phone: verifyData.phone,
            roleSlug: verifyData.roleSlug,
            otp: verifyData.otp,
            passwordLength: verifyData.password?.length
        });
        
        try {
            // Format data for API
            const formattedData = {
                username: verifyData.username,
                password: verifyData.password,
                phone: formatPhoneNumber(verifyData.phone),
                roleSlug: 'customer-hmfuCdU', // Fixed roleSlug from DB
                otp: verifyData.otp
            };

            console.log('📤 Sending OTP verification request:', {
                ...formattedData,
                password: '***' // Hide password in logs
            });

            const response = await api.post('/account/verify-register', formattedData);
            
            console.log('📨 OTP verification response:', {
                status: response.status,
                dataType: typeof response.data,
                data: response.data
            });
            
            // Enhanced response handling with success callback
            const handleSuccessResponse = async (accessToken: string) => {
                console.log('🎉 OTP verification successful!');
                console.log('🔑 Received access token:', {
                    tokenLength: accessToken?.length,
                    tokenStart: accessToken?.substring(0, 20) + '...',
                    tokenType: typeof accessToken
                });
                
                // FIX: Store token after successful registration to enable cart operations
                console.log('💾 Storing token after registration...');
                localStorage.setItem('authToken', accessToken);
                
                // Add small delay to ensure token is available for API interceptor
                console.log('⏳ Adding small delay for token availability...');
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Fetch and store user profile after registration
                try {
                    console.log('👤 Fetching user profile with new token...');
                    
                    // Double-check token is available
                    const savedToken = localStorage.getItem('authToken');
                    console.log('🔍 Token check before profile fetch:', {
                        hasToken: !!savedToken,
                        tokenLength: savedToken?.length,
                        tokensMatch: savedToken === accessToken
                    });
                    
                    // Call getUserProfile method directly from authService
                    const userProfile = await authService.getUserProfile();
                    if (userProfile) {
                        localStorage.setItem('user', JSON.stringify(userProfile));
                        console.log('✅ User profile loaded and stored after registration:', userProfile);
                        
                        // Trigger auth context update
                        window.dispatchEvent(new CustomEvent('auth:login', {
                            detail: { user: userProfile, token: accessToken }
                        }));
                        console.log('📢 Auth context update event dispatched');
                    } else {
                        console.warn('⚠️ getUserProfile returned empty data');
                    }
                } catch (error) {
                    const axiosError = error as AxiosError;
                    console.error('❌ Could not load user profile after registration:', error);
                    console.error('❌ Error details:', {
                        status: axiosError.response?.status,
                        statusText: axiosError.response?.statusText,
                        data: axiosError.response?.data,
                        hasAuthHeader: !!axiosError.config?.headers?.Authorization
                    });
                    
                    // Even if profile fetch fails, we still have the token
                    console.log('💡 Token saved but profile fetch failed - user can still use cart');
                    
                    // Try to create minimal user object from registration data
                    const minimalUser = {
                        username: verifyData.username,
                        phone: verifyData.phone,
                        role: 'customer',
                        isRegistered: true
                    };
                    localStorage.setItem('user', JSON.stringify(minimalUser));
                    console.log('💾 Stored minimal user data as fallback:', minimalUser);
                    
                    // Still trigger auth context update with minimal data
                    window.dispatchEvent(new CustomEvent('auth:login', {
                        detail: { user: minimalUser, token: accessToken }
                    }));
                    console.log('📢 Auth context update event dispatched with minimal user data');
                }
                
                console.log('✅ Registration completed with auto-login enabled');
                
                console.groupEnd();
                return { data: accessToken, status: response.status };
            };
            
            // Handle both old string format and new JSON format
            if (typeof response.data === 'string') {
                console.log('📋 String response format detected');
                // Old format - treat as access token if not error message
                if (response.data.includes('OTP') || response.data.includes('wrong') || response.data.includes('expired')) {
                    console.error('❌ OTP error in string response:', response.data);
                    throw new Error(response.data);
                }
                return await handleSuccessResponse(response.data);
            } else if (response.data && response.data.success) {
                console.log('📋 JSON success response format detected');
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
     * @param phone số điện thoại
     * @param isForLogin boolean - true nếu dùng cho login (9 số), false nếu dùng cho register (10 số)
     * @returns Promise<ApiResponse>
     */
    async resendOTP({ phone, isForLogin = false }: { phone: string, isForLogin?: boolean }): Promise<ApiResponse> {
        console.group('🔍 [DEBUG] Resend OTP Process');
        console.log('📥 Resend OTP input:', { phone, isForLogin });
        
        try {
            const formattedPhone = isForLogin ? formatPhoneNumberForLogin(phone) : formatPhoneNumber(phone);
            console.log('📱 Phone formatting for resend:', {
                original: phone,
                formatted: formattedPhone,
                isForLogin
            });
            
            const requestData = { username: formattedPhone };
            console.log('📤 Sending resend OTP request:', requestData);
            
            const response = await api.post('/account/resend-otp', requestData);
            
            console.log('📨 Resend OTP response:', {
                status: response.status,
                data: response.data
            });
            
            console.groupEnd();
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'OTP đã được gửi lại'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('❌ Resend OTP error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message
            });
            console.groupEnd();
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
     * Bước 1: Đăng nhập - Gửi username và password, nhận thông báo OTP
     * @param credentials { username, password }
     * @returns {Promise<string>} Thông báo OTP hoặc lỗi
     */
    async login(credentials: LoginCredentials): Promise<string> {
        console.group('🔍 [DEBUG] AuthService Login Process');
        console.log('📥 Login credentials received:', {
            username: credentials.username,
            usernameLength: credentials.username?.length,
            passwordLength: credentials.password?.length,
            usernameType: typeof credentials.username,
            passwordType: typeof credentials.password
        });
        
        try {
            if (!credentials.username || !credentials.password) {
                console.error('❌ Missing credentials:', {
                    hasUsername: !!credentials.username,
                    hasPassword: !!credentials.password
                });
                throw new Error('Username and password are required');
            }
            
            const cleanedCredentials = {
                username: credentials.username.trim(),
                password: credentials.password
            };
            
            console.log('📤 Cleaned credentials for API call:', {
                username: cleanedCredentials.username,
                passwordLength: cleanedCredentials.password.length,
                originalUsername: credentials.username,
                trimmed: credentials.username !== cleanedCredentials.username
            });
            
            console.log('🌐 Making login API call to /account/login...');
            const response = await api.post('/account/login', cleanedCredentials);
            
            console.log('📨 Login API response:', {
                status: response.status,
                dataType: typeof response.data,
                data: response.data,
                dataLength: typeof response.data === 'string' ? response.data.length : 'Not string'
            });
            
            console.groupEnd();
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('❌ Login error in authService:', {
                error,
                errorType: typeof error,
                message: axiosError.message,
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                responseData: axiosError.response?.data,
                requestData: {
                    username: credentials.username,
                    passwordProvided: !!credentials.password
                }
            });
            
            console.groupEnd();
            
            if (isErrorWithMessage(error) && 'response' in error) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    /**
     * Bước 2: Xác thực OTP đăng nhập - Hoàn tất đăng nhập và nhận token
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
                        console.log('✅ User profile loaded and stored after login');
                    }
                } catch (error) {
                    console.warn('Could not load user profile after login:', error);
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
     * Gửi OTP quên mật khẩu
     * @param phone số điện thoại (9 số, không có số 0 đầu)
     * @returns Promise<string>
     */
    async requestPasswordReset(phone: string) {
        try {
            const formattedPhone = formatPhoneNumberForLogin(phone);
            const response = await api.post('/account/forgot-password', { username: formattedPhone });
            return response.data;
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    /**
     * Xác thực OTP và đổi mật khẩu
     * @param username số điện thoại (9 số, không có số 0 đầu)
     * @param otp mã OTP
     * @param newPassword mật khẩu mới
     * @returns Promise<string>
     */
    async verifyResetOTP({ username, otp, newPassword }: { username: string, otp: string, newPassword: string }) {
        try {
            const formattedPhone = formatPhoneNumberForLogin(username);
            const response = await api.post('/account/verify-change-password', {
                username: formattedPhone,
                otp,
                newPassword
            });
            return response.data;
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    // ================================
    // USER MANAGEMENT
    // ================================
    
    /**
     * Lấy thông tin profile user
     * @returns Promise<any>
     */
    async getUserProfile() {
        console.group('🔍 [DEBUG] Get User Profile Process');
        
        // Check token availability before making request
        const token = localStorage.getItem('authToken');
        console.log('👤 getUserProfile - Token check:', {
            hasToken: !!token,
            tokenLength: token?.length,
            tokenStart: token?.substring(0, 20) + '...' || 'No token'
        });
        
        try {
            console.log('📤 Making GET request to /account/details...');
            const response = await api.get('/account/details');
            
            console.log('📨 getUserProfile response:', {
                status: response.status,
                dataType: typeof response.data,
                data: response.data
            });
            
            console.groupEnd();
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('❌ Get user profile error:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message,
                hasAuthHeader: !!axiosError.config?.headers?.Authorization,
                authHeaderPreview: (typeof axiosError.config?.headers?.Authorization === 'string' ? 
                    axiosError.config.headers.Authorization.substring(0, 30) + '...' : 
                    'Non-string header')
            });
            console.groupEnd();
            throw error;
        }
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
        const user = localStorage.getItem('user');
        try {
            return user ? JSON.parse(user) : null;
        } catch (error: unknown) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    },

    /**
     * Debug utility - Check complete auth state
     * @returns object with auth state details
     */
    debugAuthState() {
        console.group('🔍 [DEBUG] Complete Auth State Check');
        
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
        
        console.log('📊 Auth State Summary:', authState);
        console.log('💡 Use authService.debugAuthState() anytime to check auth state');
        console.groupEnd();
        
        return authState;
    }
};

// Expose authService to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.authService = authService;
    console.log('🛠️ authService exposed to window for debugging');
    console.log('💡 Use window.authService.debugAuthState() to check auth state');
} 