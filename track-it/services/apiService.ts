import axios from 'axios';
import AuthService from './authService';
import { Platform } from 'react-native';

const getAPIUrl = () => {
    if (!__DEV__) {
        return 'https://prod-server.com/api'; 
    }

    switch (Platform.OS) {
        case 'web':
            return 'http://localhost:3000/api'; 
        case 'ios':
        case 'android':
            return 'http://192.168.1.140:3000/api'; 
        default:
            return 'http://localhost:3000/api'; 
    }
};

const API_URL = getAPIUrl();


console.log(`🌐 Configuration API pour axios (${Platform.OS}):`, API_URL);

const apiService = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur de requêtes pour ajouter le token d'authentification
apiService.interceptors.request.use(
    async (config) => {
        const token = await AuthService.getToken(); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


apiService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true; 
            console.warn('Token expiré ou invalide. Déconnexion de l\'utilisateur.');
            await AuthService.logout(); 
            // Optionnel: Rediriger l'utilisateur vers l'écran de connexion si vous avez une navigation
            // import { useNavigation } from '@react-navigation/native';
            // const navigation = useNavigation();
            // navigation.navigate('Login'); // Assurez-vous d'avoir un écran 'Login' dans votre stack de navigation
        }
        return Promise.reject(error);
    }
);

export default apiService;