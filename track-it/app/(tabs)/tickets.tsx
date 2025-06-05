import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    pending: { label: 'En attente', color: '#F59E0B', icon: 'time' },
    in_progress: { label: 'En cours', color: '#3B82F6', icon: 'construct' },
    resolved: { label: 'Résolu', color: '#10B981', icon: 'checkmark-circle' },
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
    const getStatusStyle = (status: TicketStatus) => ({
        ...styles.statusBadge,
        backgroundColor: statusConfig[status].color,
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Mes signalements</Text>
                    <Text style={styles.subtitle}>Suivez l'état de vos signalements</Text>
                </View>

                <View style={styles.ticketsContainer}>
                    {mockTickets.map((ticket) => (
                        <TouchableOpacity
                            key={ticket.id}
                            style={styles.ticketCard}
                        >
                            <View style={styles.ticketHeader}>
                                <View style={styles.ticketInfo}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={typeIcons[ticket.type] as any}
                                            size={20}
                                            color="#6B7280"
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.lineName}>{ticket.line}</Text>
                                        <Text style={styles.date}>{ticket.date}</Text>
                                    </View>
                                </View>
                                <View style={getStatusStyle(ticket.status)}>
                                    <Text style={styles.statusText}>
                                        {statusConfig[ticket.status].label}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.description}>{ticket.description}</Text>

                            <View style={styles.ticketFooter}>
                                <Ionicons
                                    name={statusConfig[ticket.status].icon as any}
                                    size={16}
                                    color="#6B7280"
                                />
                                <Text style={styles.footerText}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    ticketsContainer: {
        paddingBottom: 16,
    },
    ticketCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ticketHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    ticketInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 20,
        marginRight: 12,
    },
    lineName: {
        fontWeight: '600',
        color: '#111827',
        fontSize: 16,
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    description: {
        color: '#374151',
        marginBottom: 12,
        lineHeight: 20,
    },
    ticketFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#6B7280',
    },
});