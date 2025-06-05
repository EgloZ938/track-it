import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type MenuItem = {
    icon: string;
    label: string;
    value?: string;
    action?: () => void;
};

export default function ProfileScreen() {
    const menuItems: MenuItem[] = [
        { icon: 'person', label: 'Nom d\'utilisateur', value: 'Utilisateur Test' },
        { icon: 'mail', label: 'Email', value: 'user@example.com' },
        { icon: 'stats-chart', label: 'Signalements envoyés', value: '12' },
        { icon: 'checkmark-circle', label: 'Problèmes résolus', value: '8' },
    ];

    const settingsItems: MenuItem[] = [
        { icon: 'notifications', label: 'Notifications', action: () => { } },
        { icon: 'shield-checkmark', label: 'Confidentialité', action: () => { } },
        { icon: 'help-circle', label: 'Aide et support', action: () => { } },
        { icon: 'information-circle', label: 'À propos', action: () => { } },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                <View className="px-4 py-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-6">Mon profil</Text>

                    {/* Avatar et infos principales */}
                    <View className="bg-white rounded-lg p-6 mb-6 shadow-sm items-center">
                        <View className="bg-primary w-24 h-24 rounded-full items-center justify-center mb-4">
                            <Ionicons name="person" size={48} color="white" />
                        </View>
                        <Text className="text-xl font-semibold text-gray-900">Utilisateur Test</Text>
                        <Text className="text-gray-600">Membre depuis janvier 2025</Text>
                    </View>

                    {/* Statistiques */}
                    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Mes statistiques</Text>
                        {menuItems.map((item, index) => (
                            <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                <View className="flex-row items-center">
                                    <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                                    <Text className="ml-3 text-gray-700">{item.label}</Text>
                                </View>
                                {item.value && (
                                    <Text className="text-gray-900 font-medium">{item.value}</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Paramètres */}
                    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Paramètres</Text>
                        {settingsItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={item.action}
                                className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                                    <Text className="ml-3 text-gray-700">{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Déconnexion */}
                    <TouchableOpacity className="bg-red-500 py-4 rounded-lg mb-8">
                        <Text className="text-white text-center font-semibold">Se déconnecter</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}