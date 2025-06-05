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
        if (isLoading) return; // Ne rien faire pendant le chargement

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            // Utilisateur non connecté, rediriger vers login
            router.replace('/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Utilisateur connecté mais sur une page d'auth, rediriger vers l'app
            router.replace('/(tabs)');
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