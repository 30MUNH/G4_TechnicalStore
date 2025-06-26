import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    username?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState(authService.getUser());
    const [token, setToken] = useState(authService.getToken());
    const navigate = useNavigate();

    const login = (userData: User, token: string) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    // Handle unauthorized events from API interceptor
    useEffect(() => {
        const handleUnauthorized = (event: CustomEvent) => {
            console.log('Unauthorized access detected:', event.detail?.message);
            
            // Clear auth state
            setUser(null);
            setToken(null);
            
            // Show notification to user
            if (event.detail?.message) {
                // You can replace this with a toast notification
                alert(event.detail.message);
            }
            
            // Navigate to login page using React Router (no page reload)
            navigate('/login', { replace: true });
        };

        // Listen for unauthorized events
        window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        
        // Cleanup listener
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        };
    }, [navigate]);

    // Verify token on mount
    useEffect(() => {
        const token = authService.getToken();
        const user = authService.getUser();
        if (token && user) {
            setToken(token);
            setUser(user);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 