import React from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function AuthNavigator() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) {
            console.log('🔄 AuthNavigator - En cours de chargement...');
            return; // Ne rien faire pendant le chargement
        }

        // Vérifier si on est sur une page d'authentification
        const inAuthPages = segments[0] === 'login' || segments[0] === 'register';
        // Vérifier si on est dans les tabs (pages protégées)
        const inTabsGroup = segments[0] === '(tabs)';

        console.log('🧭 AuthNavigator - État actuel:', {
            segments,
            isAuthenticated,
            inAuthPages,
            inTabsGroup
        });

        if (!isAuthenticated) {
            // Utilisateur non connecté
            if (!inAuthPages) {
                // Si pas sur une page d'auth, rediriger vers login
                console.log('🔴 Redirection vers login - utilisateur non connecté');
                router.replace('/login');
            } else {
                console.log('✅ Utilisateur non connecté sur page d\'auth - OK');
            }
        } else {
            // Utilisateur connecté
            if (inAuthPages) {
                // Si sur une page d'auth, rediriger vers l'app
                console.log('🟢 Redirection vers app - utilisateur connecté sur page d\'auth');
                router.replace('/(tabs)');
            } else if (segments.length === 0) {
                // Si sur la racine, rediriger vers l'app
                console.log('🟢 Redirection vers app - racine');
                router.replace('/(tabs)');
            } else {
                console.log('✅ Utilisateur connecté dans l\'app - OK');
            }
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
});