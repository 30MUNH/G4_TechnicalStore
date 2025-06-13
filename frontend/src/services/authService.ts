import api from './apiInterceptor';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    async register(userData: RegisterData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    async logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    },

    getToken() {
        return localStorage.getItem('authToken');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}; 