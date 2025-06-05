import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

class AuthService {
    // Connexion
    async login(data: LoginData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur de connexion');
            }

            // Sauvegarder le token et les données utilisateur
            await AsyncStorage.setItem('userToken', result.token);
            await AsyncStorage.setItem('userData', JSON.stringify(result.user));

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Inscription
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors de l\'inscription');
            }

            // Sauvegarder le token et les données utilisateur
            await AsyncStorage.setItem('userToken', result.token);
            await AsyncStorage.setItem('userData', JSON.stringify(result.user));

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer le token stocké
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            return null;
        }
    }

    // Récupérer les données utilisateur stockées
    async getUserData(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            return null;
        }
    }

    // Vérifier si l'utilisateur est connecté
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getToken();
            return !!token;
        } catch (error) {
            return false;
        }
    }

    // Déconnexion
    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    // Récupérer le profil utilisateur depuis l'API
    async getProfile(): Promise<User> {
        try {
            const token = await this.getToken();
            if (!token) {
                throw new Error('Token non trouvé');
            }

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors de la récupération du profil');
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Faire une requête authentifiée
    async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
        try {
            const token = await this.getToken();
            if (!token) {
                throw new Error('Token non trouvé');
            }

            const defaultHeaders = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            });

            // Si le token est expiré, déconnecter l'utilisateur
            if (response.status === 401 || response.status === 403) {
                await this.logout();
                throw new Error('Session expirée, veuillez vous reconnecter');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default new AuthService();