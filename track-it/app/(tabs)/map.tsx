import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.arrierePlan}>
            <View style={styles.formeDecorative1} />
            <View style={styles.formeDecorative2} />
            <View style={styles.centerContent}>
                <View style={styles.card}>
                    <Ionicons name="map" size={80} color="#9CA3AF" />
                    <Text style={styles.title}>
                        Carte des signalements
                    </Text>
                    <Text style={styles.description}>
                        La carte interactive sera disponible prochainement
                    </Text>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Activer les notifications</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    arrierePlan: {
    flex: 1,
    position: 'relative',
  },
  formeDecorative1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    opacity: 0.9,
  },
  formeDecorative2: {
    position: 'absolute',
    top: 80,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }, 
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: 'white',
        padding: 32,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    description: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
    },
});