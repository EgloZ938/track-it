import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

type MenuItem = {
    icon: string;
    label: string;
    value?: string;
    action?: () => void;
};

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            console.log('🔄 Début de la déconnexion...');
            await logout();
            console.log('✅ Déconnexion terminée');
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    };

    const menuItems: MenuItem[] = [
        { icon: 'person', label: 'Nom d\'utilisateur', value: `${user?.firstName} ${user?.lastName}` },
        { icon: 'mail', label: 'Email', value: user?.email },
        { icon: 'stats-chart', label: 'Signalements envoyés', value: '12' },
        { icon: 'checkmark-circle', label: 'Problèmes résolus', value: '8' },
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
            <ScrollView style={styles.scrollView}>
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