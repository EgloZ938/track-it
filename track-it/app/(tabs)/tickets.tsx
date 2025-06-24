import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/services/authService';
import { router } from 'expo-router';

type TicketStatus = 'en attente' | 'en cours' | 'résolu';

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


// const mockTickets: TicketData[] = [
//     {
//         id: '1',
//         type: 'cleanliness',
//         line: 'Ligne 1',
//         description: 'Détritus sur le quai',
//         status: 'resolved',
//         date: '2025-01-10',
//     },
//     {
//         id: '2',
//         type: 'equipment',
//         line: 'RER A',
//         description: 'Escalator en panne à Châtelet',
//         status: 'in_progress',
//         date: '2025-01-12',
//     },
//     {
//         id: '3',
//         type: 'overcrowding',
//         line: 'Ligne 13',
//         description: 'Surcharge importante aux heures de pointe',
//         status: 'pending',
//         date: '2025-01-13',
//     },
// ];

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

export default function TicketsScreen() {

     const [tickets, setTickets] = useState<RealTicket[]>([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null); 

    const getStatusStyle = (status: TicketStatus) => ({
        ...styles.statusBadge,
        backgroundColor: statusConfig[status].color,
    });

    const fetchTickets = async () => {
        setIsLoading(true); // Active l'indicateur de chargement
        setError(null);    // Réinitialise les erreurs précédentes

        try {
            // Récupère le token d'authentification. Essentiel car votre API est protégée.
            const token = await authService.getToken();
            if (!token) {
                throw new Error('Non authentifié. Veuillez vous connecter pour voir vos signalements.');
            }

            // Définition de l'URL du backend pour la récupération des tickets
            // Utilisez la même logique que celle définie dans votre authService.ts pour getAPIUrl()
            const backendBaseUrl = 'http://192.168.1.140:3000'; // Votre adresse IP locale
    const apiUrl = `${backendBaseUrl}/api/tickets`;

    console.log('🌐 Récupération des tickets depuis :', apiUrl);

    const response = await fetch(apiUrl, {
                method: 'GET', // Méthode GET pour récupérer des données
                headers: {
                    'Authorization': `Bearer ${token}`, // Envoyez le token
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json(); // Tente de parser la réponse JSON

            if (!response.ok) {
                // Si la réponse n'est pas OK (statut 4xx ou 5xx)
                console.error('Erreur réponse backend lors de la récupération des tickets :', data);
                throw new Error(data.message || `Échec de la récupération des signalements (code: ${response.status}).`);
            }

            console.log('📦 Signalements reçus :', data);
            setTickets(data); // Met à jour l'état avec les signalements réels

        } catch (err: any) {
            console.error('❌ Erreur lors du chargement des signalements :', err);
            setError(err.message || 'Impossible de charger vos signalements.');
            // Gérer les cas spécifiques, par exemple déconnexion si token invalide
            if (err.message.includes('Non authentifié')) {
                // Optionnel: Rediriger vers la page de connexion ou déconnecter l'utilisateur
                // router.replace('/login'); // Si vous utilisez expo-router
                authService.logout(); // Si le token est invalide/expiré
            }
        } finally {
            setIsLoading(false); // Arrête l'indicateur de chargement
        }
    };

    // --- Utiliser useEffect pour charger les tickets au montage du composant ---
    useEffect(() => {
        fetchTickets();
    }, []);

     const renderTicketItem = ({ item }: { item: RealTicket }) => {
        const ticketTypeIcon = typeIcons[item.type] || 'help-circle'; // Fallback pour l'icône
        const ticketStatusConfig = statusConfig[item.status] || { label: 'Inconnu', color: '#64748B', icon: 'help-circle' };

     return (
            <TouchableOpacity
                key={item._id} // Utilisez _id de MongoDB comme clé unique
                style={styles.ticketCard}
                // Optionnel: onPress pour voir les détails du ticket
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
                        <View>
                            {/* Assurez-vous que item.transportLine.name_line existe */}
                            <Text style={styles.lineName}>{item.transportLine.transportmode || 'Transport inconnu'}  {item.transportLine.name_line || 'Ligne inconnue'}</Text>
                            {/* item.createdAt est une chaîne ISO, convertissez-la en Date pour l'afficher */}
                            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
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
                    {/* item.updatedAt est une chaîne ISO, convertissez-la en Date pour l'afficher */}
                    <Text style={styles.footerText}>
                        Dernière mise à jour: {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.arrierePlan}>
                <View style={styles.formeDecorative1} />
                <View style={styles.formeDecorative2} />
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Mes signalements</Text>
                        <Text style={styles.subtitle}>Suivez l'état de vos signalements</Text>
                    </View>

                    {/* --- Logique d'affichage conditionnel --- */}
                    {isLoading ? (
                        <View style={styles.messageContainer}>
                            <ActivityIndicator size="large" color="#0EA5E9" />
                            <Text style={styles.messageText}>Chargement de vos signalements...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.messageContainer}>
                            <Ionicons name="alert-circle-outline" size={50} color="#DC2626" />
                            <Text style={styles.messageErrorText}>{error}</Text>
                            <TouchableOpacity onPress={fetchTickets} style={styles.retryButton}>
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
                            {tickets.map((ticket) => renderTicketItem({ item: ticket }))} {/* Utilisez la nouvelle fonction de rendu */}
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
        marginBottom: 6,
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