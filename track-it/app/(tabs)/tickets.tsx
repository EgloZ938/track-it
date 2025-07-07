import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/services/authService';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '@/services/apiService'; 


type TicketStatus = 'pending' | 'in_progress' | 'resolved';

type TicketData = {
    id_line: string;
    name_line: string;
    transportmode: string;
    picto_line?: string;
    picto_transportmode?: string;
    shortname_line?: string;
    colourweb_hexa?: string;
    textcolourweb_hexa?: string;
};

type LocationData = {
    latitude: number;
    longitude: number;
};

type RealTicket = {
    _id: string;
    userId: string;
    type: string;
    transportLine: TicketData;
    description: string;
    location?: LocationData;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
};


const statusConfig = {
    pending: { label: 'En attente', color: '#F59E0B', icon: 'time' },
    in_progress: { label: 'En cours', color: '#3B82F6', icon: 'construct' },
    resolved: { label: 'Résolu', color: '#10B981', icon: 'checkmark-circle' },
};

const typeIcons = {
    Proprete: 'trash',
    Equipement: 'construct',
    Surcharge: 'people',
    Retard: 'time',
    Securite: 'shield-checkmark',
    Autre: 'ellipsis-horizontal',
};

// --- COMPOSANT PRINCIPAL ---
export default function TicketsScreen() {
    const [tickets, setTickets] = useState<RealTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getStatusStyle = (status: TicketStatus) => ({
        ...styles.statusBadge,
        backgroundColor: statusConfig[status].color,
    });


    const fetchTickets = async (showMainLoader: boolean = true) => {
        if (showMainLoader) {
            setIsLoading(true);
        }
        setError(null);

        try {
            // Le token est déjà géré par l'intercepteur de apiService,
            // mais vérifier s'il existe avant l'appel est une bonne pratique.
            const token = await authService.getToken();
            if (!token) {
                setError('Non authentifié. Veuillez vous connecter pour voir vos signalements.');
                authService.logout();
                return;
            }

            // --- C'EST ICI LE CHANGEMENT CLÉ ---
            // Utilisez apiService directement avec le chemin de l'endpoint
            console.log(' Récupération des tickets via apiService depuis : /tickets');

            // apiService.baseURL est déjà 'http://localhost:3000/api' (ou 10.0.2.2 etc.)
            // Donc, il suffit de passer '/tickets' à apiService.get()
            const response = await apiService.get<RealTicket[]>('/tickets'); // Le type générique pour la réponse

            const data = response.data; // Avec Axios, les données sont dans .data

            console.log(' Signalements reçus :', data);
            setTickets(data);

        } catch (err: any) {
            console.error(' Erreur lors du chargement des signalements :', err);
            // Axios met l'objet réponse d'erreur dans err.response
            // L'erreur réseau (TypeError) sera dans err.message
            let errorMessage = err.message || 'Impossible de charger vos signalements.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.response && err.response.status) {
                errorMessage = `Échec de la récupération des signalements (code: ${err.response.status}).`;
            }

            setError(errorMessage);
            if (errorMessage.includes('Non authentifié') || errorMessage.includes('Token invalide') || err.response?.status === 401 || err.response?.status === 403) {
                authService.logout();
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            console.log("TicketsScreen est focusé, rafraîchissement des données...");
            const shouldShowLoader = tickets.length === 0 && !error;
            fetchTickets(shouldShowLoader);

            return () => {
                console.log("TicketsScreen perd le focus.");
            };
        }, [tickets.length, error])
    );

    // --- Fonction pour obtenir le mode de transport à afficher ---
    const getDisplayTransportMode = (apiMode: string, lineName: string): string => {
        switch (apiMode.toLowerCase()) {
            case 'rail':
                return 'RER';

            case 'metro':
                return 'Métro';
            case 'bus':
                return 'Bus';
            case 'tram':
                return 'Tramway';

            default:
                return apiMode;
        }
    };

    // --- Rendu d'un signalement individuel ---
    const renderTicketItem = ({ item }: { item: RealTicket }) => {
        const ticketTypeIcon = typeIcons[item.type as keyof typeof typeIcons] || 'help-circle';
        const ticketStatusConfig = statusConfig[item.status] || { label: 'Inconnu', color: '#64748B', icon: 'help-circle' };


        const displayTransportMode = getDisplayTransportMode(item.transportLine.transportmode, item.transportLine.name_line);
        const hasLinePicto = item.transportLine.colourweb_hexa && item.transportLine.shortname_line;


        return (
          <TouchableOpacity
                key={item._id}
                style={styles.ticketCard}
                onPress={() => router.push(`/ticket/${item._id}`)}
            >
                {/* TOP SECTION (HEADER) */}
                <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                        {/* 1. Amélioration du Picto de Ligne */}
                        {hasLinePicto ? (
                            <View
                                style={[
                                    styles.linePictoCircle,
                                    { backgroundColor: `#${item.transportLine.colourweb_hexa?.replace('#', '')}` || '#0EA5E9' }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.linePictoText,
                                        { color: `#${item.transportLine.textcolourweb_hexa?.replace('#', '')}` || 'white' }
                                    ]}

                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                >
                                    {item.transportLine.shortname_line || item.transportLine.name_line || 'N/A'}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name="train"
                                    size={20}
                                    color="#6B7280"
                                />
                            </View>
                        )}

                        <View style={styles.lineInfoContainer}>

                            <Text
                                style={styles.lineName}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {displayTransportMode} {item.transportLine.name_line || 'Ligne inconnue'}
                            </Text>

                        </View>
                    </View>
                    <View style={getStatusStyle(item.status)}>
                        <Text style={styles.statusText}>
                            {ticketStatusConfig.label}
                        </Text>
                    </View>
                </View>


                <View style={styles.descriptionContainer}>
                    <Text
                        style={styles.descriptionText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.description}
                    </Text>
                </View>


                <View style={styles.ticketFooter}>
                    <View style={styles.footerLeft}>
                        {/* <Ionicons
                            name="time-outline" // Icône pour la date de création
                            size={16}
                            color="#6B7280"
                        /> */}
                        <Text style={styles.footerText}>
                            Créé le: {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    {/* <View style={styles.footerRight}>
                        <Ionicons
                            name={ticketStatusConfig.icon as any} // Icône du statut
                            size={16}
                            color="#6B7280"
                        />
                        <Text style={styles.footerText}>
                            MàJ: {new Date(item.updatedAt).toLocaleDateString()}
                        </Text>
                    </View> */}
                </View>
            </TouchableOpacity>
        );
    };

    //  Rendu principal du composant TicketsScreen
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.arrierePlan}>
                <View style={styles.formeDecorative1} />
                <View style={styles.formeDecorative2} />
                <ScrollView
                    style={styles.scrollView}

                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => {
                                setIsRefreshing(true);
                                fetchTickets(false);
                            }}
                            tintColor="#0EA5E9"
                            colors={['#0EA5E9']}
                        />
                    }
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Mes signalements</Text>
                        <Text style={styles.subtitle}>Suivez l'état de vos signalements</Text>
                    </View>


                    {isLoading ? (
                        <View style={styles.messageContainer}>
                            <ActivityIndicator size="large" color="#0EA5E9" />
                            <Text style={styles.messageText}>Chargement de vos signalements...</Text>
                        </View>
                    ) : error ? ( // Affiché s'il y a une erreur
                        <View style={styles.messageContainer}>
                            <Ionicons name="alert-circle-outline" size={50} color="#DC2626" />
                            <Text style={styles.messageErrorText}>{error}</Text>
                            <TouchableOpacity onPress={() => fetchTickets(true)} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : tickets.length === 0 ? (
                        <View style={styles.messageContainer}>
                            <Ionicons name="clipboard-outline" size={50} color="#64748B" />
                            <Text style={styles.messageText}>Vous n'avez pas encore de signalements.</Text>
                            <Text style={styles.messageText}>Faites-en un pour commencer !</Text>
                        </View>
                    ) : (
                        <View style={styles.ticketsContainer}>
                            {tickets.map((ticket) => renderTicketItem({ item: ticket }))}
                        </View>
                    )}
                </ScrollView>
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
    // backgroundColor: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
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
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    ticketsContainer: {
        paddingBottom: 16,
        marginBottom: 30,
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

     descriptionContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        paddingVertical: 4, 
    },
    descriptionText: {
        color: '#374151',
        lineHeight: 20,
        
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
 
     linePictoCircle: {
        width: 48, 
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden', 
        paddingHorizontal: 2, 
    },
    linePictoText: {
        fontSize: 18,
        fontWeight: 'bold',
        
    },

    lineInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lineName: {
        fontWeight: '600',
        color: '#111827',
        fontSize: 16,
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 10,
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
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        margin: 16,
    },
    messageText: {
        marginTop: 10,
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    messageErrorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontWeight: 'bold',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});