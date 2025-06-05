import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'L\'email est requis';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        if (!password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        try {
            setErrors({});
            await login(email, password);
            // La redirection se fait automatiquement via AuthNavigator
        } catch (error: any) {
            console.error('Erreur de connexion:', error);

            // Gestion spécifique des erreurs
            if (error.message.includes('Email ou mot de passe incorrect')) {
                setErrors({ general: 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.' });
            } else if (error.message.includes('serveur')) {
                setErrors({ general: 'Erreur de connexion au serveur. Veuillez réessayer plus tard.' });
            } else {
                setErrors({ general: error.message || 'Une erreur est survenue lors de la connexion.' });
            }
        }
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="train" size={60} color="#0a7ea4" />
                        </View>
                        <Text style={styles.title}>Track'IT</Text>
                        <Text style={styles.subtitle}>
                            Connectez-vous pour signaler les problèmes de transport
                        </Text>
                    </View>

                    {/* Erreur générale */}
                    {errors.general && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#DC2626" />
                            <Text style={styles.errorText}>{errors.general}</Text>
                        </View>
                    )}

                    {/* Formulaire */}
                    <View style={styles.form}>
                        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Adresse email"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>
                        {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                            <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                                disabled={isLoading}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Connexion...' : 'Se connecter'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotPassword} disabled={isLoading}>
                            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Pas encore de compte ?</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/register')}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerLink}>S'inscrire</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'white',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderColor: '#DC2626',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#DC2626',
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 4,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 8,
    },
    fieldError: {
        color: '#DC2626',
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    loginButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotPasswordText: {
        color: '#0a7ea4',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    registerLink: {
        color: '#0a7ea4',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
});