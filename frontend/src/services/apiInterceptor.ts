import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        'Content-Type': 'application/json'
    }
});

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

let isRedirecting = false;

const authRoutes = [
    '/account/login',
    '/account/verify-login',
    '/account/register',
    '/account/verify-register',
    '/account/verify-registration'
];

api.interceptors.request.use(
    (config) => {
        const url = config.url || '';
        console.log("Gửi request đến:", (config.baseURL || "") + url, "với method:", config.method?.toUpperCase());
        if (config.data) {
            console.log("Request data:", {
                ...config.data,
                password: config.data.password ? '***' : undefined
            });
        }
        
        if (!authRoutes.some(route => url.includes(route))) {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error("Request error:", error.message);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("Response success:", {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url
        });
        
        if (error.response?.status === 401 && !isRedirecting) {
            const currentPath = window.location.pathname;
            const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
            
            if (!authPages.includes(currentPath)) {
                isRedirecting = true;
                console.log('401 Unauthorized - Clearing auth data and redirecting');
                
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                
                window.dispatchEvent(new CustomEvent('auth:unauthorized', {
                    detail: { message: 'Session expired. Please login again.' }
                }));
                
                setTimeout(() => {
                    isRedirecting = false;
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 