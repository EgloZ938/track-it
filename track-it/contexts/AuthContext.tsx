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
            console.log('Vérification du statut d\'authentification...');
            const storedToken = await authService.getToken();
            const userData = await authService.getUserData();

            console.log('Token trouvé:', !!storedToken);
            console.log('Données utilisateur trouvées:', !!userData);

            if (storedToken && userData) {
                setToken(storedToken);
                setUser(userData);
                console.log('Utilisateur authentifié:', userData.email);
            } else {
                console.log('Aucune session active trouvée');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            await authService.logout();
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            console.log('Tentative de connexion pour:', email);
            const response = await authService.login({ email, password });
            setToken(response.token);
            setUser(response.user);
            console.log('Connexion réussie pour:', response.user.email);
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        try {
            console.log('Tentative d\'inscription pour:', email);
            const response = await authService.register({ firstName, lastName, email, password });
            setToken(response.token);
            setUser(response.user);
            console.log('Inscription réussie pour:', response.user.email);
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log('Déconnexion en cours...');
            await authService.logout();
            setToken(null);
            setUser(null);
            console.log('Déconnexion réussie');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            // Même en cas d'erreur, on déconnecte localement
            setToken(null);
            setUser(null);
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

    console.log('AuthContext state:', {
        hasUser: !!user,
        hasToken: !!token,
        isLoading,
        isAuthenticated: !!token && !!user
    });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};