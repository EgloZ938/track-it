// app/ticket/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import authService from '@/services/authService';

// --- TYPES (Assurez-vous que ces types sont bien définis ou importés) ---
interface TransportLine {
    _id: string;
    id_line: string;
    shortname_line: string;
    name_line: string;
    transportmode: string;
    operatorname: string;
    colourweb_hexa: string;
    textcolourweb_hexa: string;
    picto: string;
}

interface Location {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

interface RealTicket {
    _id: string;
    userId: string;
    type: string;
    transportLine: TransportLine;
    description: string;
    location?: Location;
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// --- CONFIGURATION DES STATUTS ET ICONES ---
const statusConfig = {
    pending: { label: 'En attente', color: '#F59E0B', icon: 'hourglass-outline' },
    in_progress: { label: 'En cours', color: '#3B82F6', icon: 'sync-outline' },
    resolved: { label: 'Résolu', color: '#10B981', icon: 'checkmark-circle-outline' },
    rejected: { label: 'Rejeté', color: '#EF4444', icon: 'close-circle-outline' },
};

const typeIcons = {
    'Propreté': 'trash-outline',
    'Équipement': 'build-outline',
    'Surcharge': 'people-outline',
    'Retard': 'time-outline',
    'Sécurité': 'shield-outline',
    'Autre': 'help-circle-outline',
};


// --- COMPOSANT TicketDetailScreen ---
export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [ticket, setTicket] = useState<RealTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const backendBaseUrl = 'http://192.168.1.13:3000'; 

    useEffect(() => {
        const fetchTicketDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await authService.getToken();
                if (!token) {
                    setError("Authentification requise. Veuillez vous connecter.");
                    setIsLoading(false);
                    return;
                }

                const apiUrl = `${backendBaseUrl}/api/tickets/${id}`;
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 404) {
                    setError("Signalement non trouvé.");
                    setIsLoading(false);
                    return;
                }
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Erreur de l'API:", response.status, errorText);
                    setError(`Échec du chargement du signalement. Statut: ${response.status}`);
                    setIsLoading(false);
                    return;
                }

                const data: RealTicket = await response.json();
                setTicket(data);
            } catch (err: any) {
                console.error("Erreur lors du chargement du détail du signalement :", err);
                setError(`Erreur lors du chargement du détail du signalement : ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchTicketDetails();
        } else {
            setError("ID du signalement manquant.");
            setIsLoading(false);
        }
    }, [id]);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDisplayTransportMode = (apiMode: string): string => { // name_line removed from args, it wasn't used
        switch (apiMode.toLowerCase()) {
            case 'rail': return 'RER';
            case 'metro': return 'Métro';
            case 'bus': return 'Bus';
            case 'tram': return 'Tramway';
            default: return apiMode;
        }
    };

    // --- Contenu de l'écran principal (isLoading, error, ou ticket affiché) ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.contentWrapper}>
                    <ActivityIndicator size="large" color="#0EA5E9" />
                    <Text style={styles.loadingText}>Chargement des détails du signalement...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.contentWrapper}>
                    <Ionicons name="alert-circle-outline" size={50} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!ticket) {
            return (
                <View style={styles.contentWrapper}>
                    <Ionicons name="alert-circle-outline" size={50} color="#DC2626" />
                    <Text style={styles.errorText}>Signalement introuvable.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const ticketTypeIcon = typeIcons[ticket.type as keyof typeof typeIcons] || 'help-circle';
        const ticketStatusConfig = statusConfig[ticket.status] || { label: 'Inconnu', color: '#64748B', icon: 'help-circle' };

        const displayTransportMode = getDisplayTransportMode(ticket.transportLine.transportmode); // Call with one arg
        const hasLinePicto = ticket.transportLine.colourweb_hexa && ticket.transportLine.shortname_line;

        return (
            <ScrollView style={styles.scrollViewContent}>
                <View style={styles.card}>
                    {/* Header de la carte */}
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            {/* LOGO AVEC TEXTE DEDANS */}
                            {hasLinePicto ? (
                                <View
                                    style={[
                                        styles.linePictoCircle,
                                        { backgroundColor: `#${ticket.transportLine.colourweb_hexa}` || '#0EA5E9' }
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.linePictoText,
                                            { color: `#${ticket.transportLine.textcolourweb_hexa}` || 'white' }
                                        ]}
                                        adjustsFontSizeToFit
                                        numberOfLines={1}
                                    >
                                        {ticket.transportLine.shortname_line || ticket.transportLine.name_line || 'N/A'}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.iconBackground}>
                                    <Ionicons name="train" size={24} color="#334155" />
                                </View>
                            )}
                            <View>
                                <Text style={styles.lineNameDetail}>
                                    {displayTransportMode} {ticket.transportLine.name_line}
                                </Text>
                                <Text style={styles.dateDetail}>
                                    Signalé le: {formatDateTime(ticket.createdAt)}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadgeDetail, { backgroundColor: ticketStatusConfig.color }]}>
                            <Ionicons name={ticketStatusConfig.icon as any} size={16} color="white" style={{ marginRight: 5 }} />
                            <Text style={styles.statusTextDetail}>{ticketStatusConfig.label}</Text>
                        </View>
                    </View>

                    {/* Section Type de problème */}
                    <View style={styles.detailSection}>
                        <Ionicons name={ticketTypeIcon as any} size={20} color="#6B7280" style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>Type de problème:</Text>
                        <Text style={styles.detailValue}>{ticket.type}</Text>
                    </View>

                    {/* Section Description */}
                    <View style={styles.detailSection}>
                        <Ionicons name="document-text-outline" size={20} color="#6B7280" style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>Description:</Text>
                        <Text style={styles.descriptionDetail}>{ticket.description}</Text>
                    </View>

                

                    {/* Footer de la carte */}
                    <View style={styles.cardFooter}>
                        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                        <Text style={styles.footerTextDetail}>
                            Dernière mise à jour: {formatDateTime(ticket.updatedAt)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    // --- Rendu principal du composant ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />

            {/* Arrière-plan avec les formes décoratives */}
            <View style={styles.backgroundShapes}>
                <View style={styles.formeDecorative1} />
                <View style={styles.formeDecorative2} />
            </View>

            {/* Configurer le header d'Expo Router pour qu'il soit masqué */}
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* HEADER PERSONNALISÉ */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonCustomHeader}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.customHeaderTitle}>Détail du Signalement</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Contenu principal de l'écran */}
            {renderContent()}

        </SafeAreaView>
    );
}

// --- Styles pour TicketDetailScreen ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },

    backgroundShapes: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
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
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
        zIndex: 2,
    },
    customHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    backButtonCustomHeader: {
        padding: 5,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: 'white',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    backButton: {
        marginTop: 20,
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    scrollViewContent: {
        flex: 1,
        padding: 16,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    linePictoCircle: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    linePictoText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 2,
    },
    iconBackground: {
        backgroundColor: '#E5E7EB',
        padding: 10,
        borderRadius: 24,
        marginRight: 15,
    },
    lineNameDetail: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        flexShrink: 1,
    },
    dateDetail: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    statusBadgeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusTextDetail: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    detailSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
    },
    detailIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginRight: 8,
        flexShrink: 0,
    },
    detailValue: {
        fontSize: 16,
        color: '#4B5563',
        flexShrink: 1,
    },
    descriptionDetail: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerTextDetail: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6B7280',
    },
});