import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type TicketStatus = 'pending' | 'in_progress' | 'resolved';

type Ticket = {
    id: string;
    type: string;
    line: string;
    description: string;
    status: TicketStatus;
    date: string;
};

const mockTickets: Ticket[] = [
    {
        id: '1',
        type: 'cleanliness',
        line: 'Ligne 1',
        description: 'Détritus sur le quai',
        status: 'resolved',
        date: '2025-01-10',
    },
    {
        id: '2',
        type: 'equipment',
        line: 'RER A',
        description: 'Escalator en panne à Châtelet',
        status: 'in_progress',
        date: '2025-01-12',
    },
    {
        id: '3',
        type: 'overcrowding',
        line: 'Ligne 13',
        description: 'Surcharge importante aux heures de pointe',
        status: 'pending',
        date: '2025-01-13',
    },
];

const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-500', icon: 'time' },
    in_progress: { label: 'En cours', color: 'bg-blue-500', icon: 'construct' },
    resolved: { label: 'Résolu', color: 'bg-green-500', icon: 'checkmark-circle' },
};

const typeIcons = {
    cleanliness: 'trash',
    equipment: 'construct',
    overcrowding: 'people',
    delay: 'time',
    safety: 'shield-checkmark',
    other: 'ellipsis-horizontal',
};

export default function TicketsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-4">
                <View className="py-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Mes signalements</Text>
                    <Text className="text-gray-600">Suivez l'état de vos signalements</Text>
                </View>

                <View className="space-y-4 pb-4">
                    {mockTickets.map((ticket) => (
                        <TouchableOpacity
                            key={ticket.id}
                            className="bg-white rounded-lg p-4 shadow-sm"
                        >
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-row items-center">
                                    <View className="bg-gray-100 p-2 rounded-full mr-3">
                                        <Ionicons
                                            name={typeIcons[ticket.type] as any}
                                            size={20}
                                            color="#6B7280"
                                        />
                                    </View>
                                    <View>
                                        <Text className="font-semibold text-gray-900">{ticket.line}</Text>
                                        <Text className="text-sm text-gray-500">{ticket.date}</Text>
                                    </View>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${statusConfig[ticket.status].color}`}>
                                    <Text className="text-white text-xs font-medium">
                                        {statusConfig[ticket.status].label}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-700 mb-3">{ticket.description}</Text>

                            <View className="flex-row items-center">
                                <Ionicons
                                    name={statusConfig[ticket.status].icon as any}
                                    size={16}
                                    color="#6B7280"
                                />
                                <Text className="ml-1 text-sm text-gray-600">
                                    Dernière mise à jour: {ticket.date}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}