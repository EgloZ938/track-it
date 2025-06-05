import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifier l'authentification au démarrage
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const storedToken = await authService.getToken();
            const userData = await authService.getUserData();

            if (storedToken && userData) {
                setToken(storedToken);
                setUser(userData);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            await authService.logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            setToken(response.token);
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        try {
            const response = await authService.register({ firstName, lastName, email, password });
            setToken(response.token);
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};