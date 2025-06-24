import React, { useState, useCallback } from 'react'; // Assure-toi que useCallback est importé
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/services/authService';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Importe useFocusEffect

// --- TYPES (Assure-toi que TicketStatus correspond bien à tes données backend) ---
type TicketStatus = 'pending' | 'in_progress' | 'resolved'; // Assuré d'être en anglais pour correspondre au backend

type TicketData = {
    id_line: string;
    name_line: string;
    transportmode: string;
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

// --- CONFIGURATION DES STATUTS ET TYPES (reste inchangé) ---
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
    const [isLoading, setIsLoading] = useState(true); // Indique si le loader principal doit être affiché
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false); // Indique si le "pull-to-refresh" est en cours

    const getStatusStyle = (status: TicketStatus) => ({
        ...styles.statusBadge,
        backgroundColor: statusConfig[status].color,
    });

    // --- Fonction de récupération des tickets ---
    // Elle prend un paramètre pour contrôler si le grand indicateur de chargement doit s'afficher
    const fetchTickets = async (showMainLoader: boolean = true) => {
        if (showMainLoader) {
            setIsLoading(true); // Active le grand ActivityIndicator au centre de l'écran
        }
        setError(null); // Réinitialise les erreurs précédentes

        try {
            const token = await authService.getToken();
            if (!token) {
                setError('Non authentifié. Veuillez vous connecter pour voir vos signalements.');
                authService.logout();
                return;
            }

            const backendBaseUrl = 'http://192.168.1.140:3000'; // Ton adresse IP locale
            const apiUrl = `${backendBaseUrl}/api/tickets`;

            console.log('🌐 Récupération des tickets depuis :', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Erreur réponse backend lors de la récupération des tickets :', data);
                throw new Error(data.message || `Échec de la récupération des signalements (code: ${response.status}).`);
            }

            console.log('📦 Signalements reçus :', data);
            setTickets(data);

        } catch (err: any) {
            console.error('❌ Erreur lors du chargement des signalements :', err);
            setError(err.message || 'Impossible de charger vos signalements.');
            if (err.message.includes('Non authentifié') || err.message.includes('Token invalide')) {
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

    // --- Fonction utilitaire pour mapper les modes de transport de l'API à des noms d'affichage ---
    const getDisplayTransportMode = (apiMode: string, lineName: string): string => {
        switch (apiMode.toLowerCase()) {
            case 'rail':
                    return 'RER';
                
  
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

        return (
            <TouchableOpacity
                key={item._id}
                style={styles.ticketCard}
                onPress={() => router.push(`/ticket/${item._id}`)}
            >
                <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={ticketTypeIcon as any}
                                size={20}
                                color="#6B7280"
                            />
                        </View>
                        <View style={styles.lineInfoContainer}>
                            {/* Affichage combiné du mode de transport et du nom de la ligne */}
                            <Text style={styles.lineName}>
                                {displayTransportMode} {item.transportLine.name_line || 'Ligne inconnue'}
                            </Text>
                            {/* Pour les logos, on ajoutera ici une fois que tu auras les assets et les chemins définis */}
                        </View>
                        {/* Assure-toi que la date est bien dans un <Text> */}
                        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={getStatusStyle(item.status)}>
                        <Text style={styles.statusText}>
                            {ticketStatusConfig.label}
                        </Text>
                    </View>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.ticketFooter}>
                    <Ionicons
                        name={ticketStatusConfig.icon as any}
                        size={16}
                        color="#6B7280"
                    />
                    <Text style={styles.footerText}>
                        Dernière mise à jour: {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
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

                    {/* --- Logique d'affichage conditionnel des messages / liste de tickets --- */}
                    {isLoading ? ( // Affiché uniquement si isLoading est vrai (premier chargement ou après une erreur)
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

// --- STYLES (Utilise tes styles existants, plus quelques ajouts pour lineInfoContainer si tu n'avais pas) ---
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
        backgroundColor: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)', // Note: linear-gradient n'est pas supporté directement par React Native StyleSheet. Tu auras besoin d'une librairie comme 'expo-linear-gradient' si tu veux un vrai dégradé CSS. Pour l'instant, ça affichera la première couleur ou une couleur par défaut.
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
    lineInfoContainer: { // Nouveau style pour le conteneur du mode et de la ligne
        flexDirection: 'row', // Pour aligner horizontalement le texte et potentiellement les logos
        alignItems: 'center',
    },
    lineName: {
        fontWeight: '600',
        color: '#111827',
        fontSize: 16,
        // marginBottom: 6, // Enlève si tu veux aligner sur une seule ligne
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 10, // Ajoute un peu d'espace entre le nom de la ligne et la date
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
    // Ajoute ces styles pour les messages d'état (chargement, erreur, vide)
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        margin: 16, // Pour qu'il apparaisse dans la zone des cartes
    },
    messageText: {
        marginTop: 10,
        fontSize: 16,
        color: 'white',
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