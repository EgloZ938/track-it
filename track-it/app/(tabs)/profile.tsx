import React, { useState, useEffect, useCallback } from 'react'; 
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService'; 
import { useFocusEffect } from '@react-navigation/native'; 

type MenuItem = {
    icon: string;
    label: string;
    value?: string;
    action?: () => void;
};

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState({ totalSent: 0, totalResolved: 0 });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState<string | null>(null);
     const [isRefreshing, setIsRefreshing] = useState(false);

    const handleLogout = async () => {
        try {
            console.log('🔄 Début de la déconnexion...');
            await logout();
            console.log('✅ Déconnexion terminée');
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    };

       const fetchStats = async () => { // Pas besoin de showMainLoader ici, la logique de useFocusEffect/RefreshControl le gère
        // Si c'est un refresh manuel (pull-to-refresh), on met isRefreshing à true.
        // Sinon, si c'est le premier chargement ou suite à une erreur, on met isLoadingStats à true.
        if (!isRefreshing && stats.totalSent === 0 && !errorStats) {
             setIsLoadingStats(true);
        }
        setErrorStats(null); // Toujours réinitialiser les erreurs au début d'un fetch

        try {
            const token = await authService.getToken();
            if (!token) {
                setErrorStats('Non authentifié. Veuillez vous connecter pour voir vos statistiques.');
                logout();
                return;
            }

            const backendBaseUrl = 'http://192.168.1.140:3000';
            const apiUrl = `${backendBaseUrl}/api/tickets/stats`;

            console.log('🌐 Récupération des statistiques depuis :', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Erreur réponse backend lors de la récupération des statistiques :', data);
                throw new Error(data.message || `Échec de la récupération des statistiques (code: ${response.status}).`);
            }

            console.log('📦 Statistiques reçues :', data);
            setStats(data);

        } catch (err: any) {
            console.error('❌ Erreur lors du chargement des statistiques :', err);
            setErrorStats(err.message || 'Impossible de charger vos statistiques.');
            if (err.message.includes('Non authentifié') || err.message.includes('Token invalide')) {
                logout();
            }
        } finally {
            setIsLoadingStats(false); // Désactive le loader principal
            setIsRefreshing(false); // Désactive l'indicateur de rafraîchissement manuel
        }
    };

     useFocusEffect(
        useCallback(() => {
            console.log("ProfileScreen est focusé, rafraîchissement des statistiques...");
            fetchStats();
            return () => {
               
            };
        }, [user]) 
    );

    const menuItems: MenuItem[] = [
        { icon: 'person', label: 'Nom d\'utilisateur', value: `${user?.firstName} ${user?.lastName}` },
        { icon: 'mail', label: 'Email', value: user?.email },
        { icon: 'stats-chart', label: 'Signalements envoyés', value: isLoadingStats ? '...' : stats.totalSent.toString() },
        { icon: 'checkmark-circle', label: 'Problèmes résolus', value: isLoadingStats ? '...' : stats.totalResolved.toString() }
    ];

    const retardedMenuItems: MenuItem[] = [
        {icon : 'ticket', label: 'Tickets de retard', value: isLoadingStats ? '...' : (stats.totalSent - stats.totalResolved).toString() }
    ];

    const settingsItems: MenuItem[] = [
        { icon: 'notifications', label: 'Notifications', action: () => console.log('Notifications pressed') },
        { icon: 'shield-checkmark', label: 'Confidentialité', action: () => console.log('Privacy pressed') },
        { icon: 'help-circle', label: 'Aide et support', action: () => console.log('Help pressed') },
        { icon: 'information-circle', label: 'À propos', action: () => console.log('About pressed') },
    ];

    // Debug: vérifier que l'utilisateur existe
    console.log('👤 Profile Screen - User:', user);
    console.log('🔐 Profile Screen - Logout function:', typeof logout);

    return (
        <SafeAreaView style={styles.container}>
           <ScrollView
                style={styles.scrollView}
                // Ceci est l'endroit le plus important :
                // Le RefreshControl DOIT être passé à la prop `refreshControl` de la ScrollView.
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing} // Lié à l'état isRefreshing
                        onRefresh={() => {
                            // Quand l'utilisateur tire, active l'indicateur de rafraîchissement
                            setIsRefreshing(true); 
                            // Et lance la récupération des tickets, sans afficher le grand loader central
                            fetchStats(); 
                        }}
                        tintColor="#0EA5E9" // Couleur de l'icône de chargement (iOS)
                        colors={['#0EA5E9']} // Couleurs de l'icône de chargement (Android)
                    />
                }
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Mon profil</Text>

                    {/* Avatar et infos principales */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </Text>
                        </View>
                        <Text style={styles.userName}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text style={styles.memberSince}>
                            Membre depuis {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </Text>
                    </View>

                    {/* Statistiques */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mes statistiques</Text>
                        {menuItems.map((item, index) => (
                            <View key={index} style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.lastMenuItem
                            ]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                                </View>
                                {item.value && (
                                    <Text style={styles.menuItemValue}>{item.value}</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Tickets */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tickets</Text>
                        {retardedMenuItems.map((item, index) => (
                            <TouchableOpacity key={index} style={[
                                styles.menuItem,
                                index === retardedMenuItems.length - 1 && styles.lastMenuItem
                            ]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                                </View>
                                {item.value && (
                                    <Text style={styles.menuItemValue}>{item.value}</Text>
                                )}
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Paramètres */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Paramètres</Text>
                        {settingsItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={item.action}
                                style={[
                                    styles.menuItem,
                                    index === settingsItems.length - 1 && styles.lastMenuItem
                                ]}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bouton de déconnexion avec debug */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="log-out" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
                    </TouchableOpacity>
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
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        marginBottom: 24,
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
    avatar: {
        backgroundColor: '#0a7ea4',
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    memberSince: {
        color: '#6B7280',
        marginTop: 4,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemLabel: {
        marginLeft: 12,
        color: '#374151',
        fontSize: 16,
    },
    menuItemValue: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#DC2624',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    // Section debug (à supprimer en production)
    debugSection: {
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    debugTitle: {
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 4,
    },
    debugText: {
        color: '#92400E',
        fontSize: 12,
    },
});