import React, { useState, useEffect, useCallback } from 'react'; 
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService'; 
import { useFocusEffect } from '@react-navigation/native'; 
import api from '@/services/apiService';
import axios from 'axios';
import { router } from 'expo-router'; // Assurez-vous d'importer 'router'

type MenuItem = {
    icon: string;
    label: string;
    value?: string;
    action?: () => void; // L'action sera un onPress handler
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

    const fetchStats = async () => {
    if (!isRefreshing && stats.totalSent === 0 && !errorStats) {
        setIsLoadingStats(true);
    }
    setErrorStats(null); 

    try {
        const token = await authService.getToken(); 
        if (!token) {
            setErrorStats('Non authentifié. Veuillez vous connecter pour voir vos statistiques.');
            logout();
            return;
        }

        const apiUrlPath = '/tickets/stats'; 

        console.log('🌐 Récupération des statistiques depuis :', api.defaults.baseURL + apiUrlPath); 

        const response = await api.get(apiUrlPath); 

        const data = response.data; 

        console.log('📦 Statistiques reçues :', data);
        setStats(data);

    } catch (err: any) { 
        console.error('❌ Erreur lors du chargement des statistiques :', err);
        
        if (axios.isAxiosError(err)) { 
            if (err.response) {
                console.error('Erreur de réponse du serveur:', err.response.status, err.response.data);
                if (err.response.status === 401 || err.response.status === 403) {
                    setErrorStats('Session expirée ou non autorisée. Veuillez vous reconnecter.');
                    logout(); 
                } else {
                    setErrorStats(err.response.data.message || `Erreur du serveur (${err.response.status}) : Impossible de charger vos statistiques.`);
                }
            } else if (err.request) {
                console.error('Aucune réponse du serveur (problème réseau) :', err.request);
                setErrorStats('Impossible de se connecter au serveur. Vérifiez votre connexion ou l\'état du serveur.');
            } else {
                console.error('Erreur de configuration de requête Axios:', err.message);
                setErrorStats('Une erreur inattendue est survenue.');
            }
        } else {
            setErrorStats(err.message || 'Impossible de charger vos statistiques.');
            if (err.message.includes('Non authentifié') || err.message.includes('Token invalide')) {
                logout();
            }
        }
    } finally {
        setIsLoadingStats(false); 
        setIsRefreshing(false); 
    }
};

useFocusEffect(
    useCallback(() => {
        console.log("ProfileScreen est focusé, rafraîchissement des statistiques...");
        fetchStats();
        return () => {
            // Cleanup si nécessaire
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
        { 
            icon: 'ticket', 
            label: 'Tickets de retard', 
            // value: isLoadingStats ? '...' : (stats.totalSent - stats.totalResolved).toString(),
            action: () => router.push('/profile/my-delay-tickets') // <-- NOUVELLE ACTION ICI
        }
    ];

    const settingsItems: MenuItem[] = [
        { icon: 'notifications', label: 'Notifications', action: () => console.log('Notifications pressed') },
        { icon: 'shield-checkmark', label: 'Confidentialité', action: () => console.log('Privacy pressed') },
        { icon: 'help-circle', label: 'Aide et support', action: () => console.log('Help pressed') },
        { icon: 'information-circle', label: 'À propos', action: () => console.log('About pressed') },
    ];

    console.log('👤 Profile Screen - User:', user);
    console.log('🔐 Profile Screen - Logout function:', typeof logout);

    return (
        <SafeAreaView style={styles.container}>
           <ScrollView
                style={styles.scrollView}
           
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing} 
                        onRefresh={() => {
                            
                            setIsRefreshing(true); 
                            
                            fetchStats(); 
                        }}
                        tintColor="#0EA5E9" 
                        colors={['#0EA5E9']} 
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
                            <TouchableOpacity 
                                key={index} 
                                style={[
                                    styles.menuItem,
                                    index === retardedMenuItems.length - 1 && styles.lastMenuItem
                                ]}
                                 onPress={() => router.push('../profile/my-delay-tickets')}
                            >
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
                                style={[
                                    styles.menuItem,
                                    index === settingsItems.length - 1 && styles.lastMenuItem
                                ]}
                                onPress={item.action}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bouton de déconnexion */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                        <Text style={styles.logoutButtonText}>Déconnexion</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... (vos styles existants restent inchangés) ...
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 30,
        textAlign: 'center',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0EA5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 5,
    },
    memberSince: {
        fontSize: 14,
        color: '#64748B',
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Pour que le texte puisse prendre de la place
    },
    menuItemLabel: {
        fontSize: 16,
        color: '#334155',
        marginLeft: 15,
        fontWeight: '500',
    },
    menuItemValue: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
        marginRight: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE', // Un fond léger pour le bouton de déconnexion
        borderRadius: 20,
        paddingVertical: 15,
        marginBottom: 20,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    logoutButtonText: {
        color: '#EF4444',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
});
