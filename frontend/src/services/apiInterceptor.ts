import axios from 'axios';

const api = axios.create({
    baseURL:  import.meta.env.VITE_API_URL || "http://localhost:3000/api" 
});

// Flag to prevent infinite redirect loops
let isRedirecting = false;

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            // Only redirect if we're not already redirecting and not already on auth pages
            const currentPath = window.location.pathname;
            const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
            
            if (!authPages.includes(currentPath)) {
                isRedirecting = true;
                
                console.log('401 Unauthorized - Clearing auth data and redirecting');
                
                // Clear auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                
                // Dispatch event for AuthContext to handle
                window.dispatchEvent(new CustomEvent('auth:unauthorized', {
                    detail: { message: 'Session expired. Please login again.' }
                }));
                
                // Reset flag after a delay
                setTimeout(() => {
                    isRedirecting = false;
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 