import api from './apiInterceptor';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface VerifyLoginData {
    username: string;
    otp: string;
}

export const authService = {
    async login(credentials: LoginCredentials) {
        try {
            const response = await api.post('/account/login', credentials);
            console.log('Login response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },

    async verifyLogin(verifyData: VerifyLoginData) {
        try {
            const response = await api.post('/account/verify-login', verifyData);
            console.log('Verify login response:', response.data);
            // Backend trả về trực tiếp accessToken string
            return response.data;
        } catch (error) {
            console.error('Verify login API error:', error);
            throw error;
        }
    },

    async register(userData: RegisterData) {
        try {
            const response = await api.post('/auth/register', userData);
            console.log('Register response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Register API error:', error);
            throw error;
        }
    },

    async logout() {
        const username = this.getUser()?.username;
        if (username) {
            try {
                await api.post('/account/logout', { username });
                console.log('Logout successful');
            } catch (error) {
                console.error('Logout API error:', error);
            }
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        return !!(token && user);
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