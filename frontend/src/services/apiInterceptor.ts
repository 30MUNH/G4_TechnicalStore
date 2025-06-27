import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api"
});

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);


let isRedirecting = false;


const authRoutes = [
    '/account/login',
    '/account/verify-login',
    '/account/register',
    '/account/verify-register'
];

api.interceptors.request.use(
    (config) => {
        const url = config.url || '';
        console.log("Gửi request đến:", (config.baseURL || "") + url);

        
        if (!authRoutes.some(route => url.includes(route))) {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', error.response?.status, error.response?.data);
        
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