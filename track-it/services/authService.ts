import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiService from './apiService'; // Importez le nouveau apiService
import { User, LoginData, RegisterData, AuthResponse } from '../../track-it/frontend/src/types'; // Import des types

class AuthService {
    async login(data: LoginData): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${apiService.defaults.baseURL}/auth/login`, data);
            const result: AuthResponse = response.data;
            await AsyncStorage.setItem('userToken', result.token);
            await AsyncStorage.setItem('userData', JSON.stringify(result.user));
            return result;
        } catch (error: any) {
            console.error('Erreur de connexion:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Erreur de connexion');
        }
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${apiService.defaults.baseURL}/auth/register`, data);
            const result: AuthResponse = response.data;
            await AsyncStorage.setItem('userToken', result.token);
            await AsyncStorage.setItem('userData', JSON.stringify(result.user));
            return result;
        } catch (error: any) {
            console.error('Erreur d\'inscription:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
        }
    }

    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            return null;
        }
    }

    async getUserData(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            return null;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getToken();
            return !!token;
        } catch (error) {
            return false;
        }
    }

    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    async getProfile(): Promise<User> {
        try {
            const response = await apiService.get('/auth/profile');
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération du profil:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
        }
    }
}

export default new AuthService();