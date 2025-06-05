import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { register, isLoading } = useAuth();
    const router = useRouter();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Effacer l'erreur du champ modifié
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        const { firstName, lastName, email, password, confirmPassword } = formData;

        if (!firstName.trim()) {
            newErrors.firstName = 'Le prénom est requis';
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Le nom est requis';
        } else if (lastName.trim().length < 2) {
            newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            setErrors({});
            await register(
                formData.firstName.trim(),
                formData.lastName.trim(),
                formData.email,
                formData.password
            );
            // La redirection se fait automatiquement via AuthNavigator
        } catch (error: any) {
            console.error('Erreur d\'inscription:', error);

            // Gestion spécifique des erreurs
            if (error.message.includes('email est déjà utilisé')) {
                setErrors({ email: 'Cet email est déjà utilisé. Essayez de vous connecter.' });
            } else if (error.message.includes('serveur')) {
                setErrors({ general: 'Erreur de connexion au serveur. Veuillez réessayer plus tard.' });
            } else {
                setErrors({ general: error.message || 'Une erreur est survenue lors de l\'inscription.' });
            }
        }
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getInputStyle = (field: string) => [
        styles.inputContainer,
        errors[field] && styles.inputError
    ];

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            disabled={isLoading}
                        >
                            <Ionicons name="arrow-back" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Créer un compte</Text>
                        <Text style={styles.subtitle}>
                            Rejoignez Track'IT pour améliorer les transports
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
                        <View style={styles.row}>
                            <View style={styles.halfWidthContainer}>
                                <View style={[getInputStyle('firstName')[0], styles.halfWidth, getInputStyle('firstName')[1]]}>
                                    <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Prénom"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.firstName}
                                        onChangeText={(value) => handleInputChange('firstName', value)}
                                        autoCapitalize="words"
                                        editable={!isLoading}
                                    />
                                </View>
                                {errors.firstName && <Text style={styles.fieldError}>{errors.firstName}</Text>}
                            </View>

                            <View style={styles.halfWidthContainer}>
                                <View style={[getInputStyle('lastName')[0], styles.halfWidth, getInputStyle('lastName')[1]]}>
                                    <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nom"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.lastName}
                                        onChangeText={(value) => handleInputChange('lastName', value)}
                                        autoCapitalize="words"
                                        editable={!isLoading}
                                    />
                                </View>
                                {errors.lastName && <Text style={styles.fieldError}>{errors.lastName}</Text>}
                            </View>
                        </View>

                        <View style={getInputStyle('email')}>
                            <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Adresse email"
                                placeholderTextColor="#9CA3AF"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>
                        {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                        <View style={getInputStyle('password')}>
                            <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe (min. 6 caractères)"
                                placeholderTextColor="#9CA3AF"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
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

                        <View style={getInputStyle('confirmPassword')}>
                            <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmer le mot de passe"
                                placeholderTextColor="#9CA3AF"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                                disabled={isLoading}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}

                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Déjà un compte ?</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginLink}>Se connecter</Text>
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
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidthContainer: {
        width: '48%',
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
    halfWidth: {
        width: '100%',
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
    registerButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    registerButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
    loginLink: {
        color: '#0a7ea4',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
});