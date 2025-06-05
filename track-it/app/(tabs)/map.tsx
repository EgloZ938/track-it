import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 items-center justify-center px-4">
                <View className="bg-white p-8 rounded-lg shadow-sm items-center">
                    <Ionicons name="map" size={80} color="#9CA3AF" />
                    <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                        Carte des signalements
                    </Text>
                    <Text className="text-gray-600 text-center mb-6">
                        La carte interactive sera disponible prochainement
                    </Text>
                    <TouchableOpacity className="bg-primary px-6 py-3 rounded-lg">
                        <Text className="text-white font-medium">Activer les notifications</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}