import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '@/services/apiService'; // Assurez-vous que apiService est correctement configuré
import authService from '@/services/authService';

interface LigneTransport {
  id_line: string;
  name_line: string;
  shortname_line: string;
  transportmode: string;
  operatorname: string;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
}

interface StopPointIDFM {
  id_stop_point: string;
  name_stop_point: string;
  coord_x: number;
  coord_y: number;
}

interface DelayTicket {
  _id: string;
  userId: string;
  transportLine: LigneTransport;
  stopPoint: StopPointIDFM;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distanceFromStop: number;
  // Le statut a été entièrement retiré de l'interface
  createdAt: string;
  updatedAt: string;
}

const MyDelayTicketsScreen = () => {
  const [delayTickets, setDelayTickets] = useState<DelayTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchDelayTickets = useCallback(async () => {
    const loggedIn = await authService.isAuthenticated();
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Non connecté', 'Veuillez vous connecter pour voir vos tickets de retard.');
      // router.replace('/login'); // Optionnel: rediriger si non connecté
      return;
    }

    try {
      const response = await api.get('/delaytickets');
      if (response.data) {
        setDelayTickets(response.data);
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des tickets de retard:', error.response?.data || error.message);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger vos tickets de retard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Utiliser useFocusEffect pour recharger les données à chaque fois que l'écran est focus
  useFocusEffect(
    useCallback(() => {
      fetchDelayTickets();
      return () => {
        // Optionnel: nettoyer des choses si besoin quand l'écran perd le focus
      };
    }, [fetchDelayTickets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDelayTickets();
  };

  const renderItem = ({ item }: { item: DelayTicket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => router.push({ pathname: "/profile/my-delay-tickets/[id]", params: { id: item._id } })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badgeLigne, { backgroundColor: item.transportLine.colourweb_hexa || '#0EA5E9' }]}>
          <Text style={[styles.texteBadgeLigne, { color: item.transportLine.textcolourweb_hexa || '#FFFFFF' }]}>
            {item.transportLine.shortname_line}
          </Text>
        </View>
        {/* <Text style={styles.ticketTitle}>{item.transportLine.name_line}</Text> */}
      </View>
      <Text style={styles.ticketSubtitle}>
        <Ionicons name="location-outline" size={16} color="#64748B" /> {item.stopPoint.name_stop_point}
      </Text>
      <Text style={styles.ticketDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.ticketDate}>Déclaré le: {new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
        {/* Le badge de statut a été supprimé */}
      </View>
    </TouchableOpacity>
  );

  // Les fonctions getStatusColor et getStatusLabel ont été supprimées.

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Chargement de vos tickets de retard...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#CBD5E1" />
        <Text style={styles.emptyText}>Vous devez être connecté pour voir vos tickets de retard.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (delayTickets.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="hourglass-outline" size={80} color="#CBD5E1" />
        <Text style={styles.emptyText}>Vous n'avez pas encore déclaré de retard.</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/retard')}>
          <Text style={styles.createButtonText}>Déclarer un retard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonCustomHeader}>
  <Ionicons name="arrow-back" size={24} color="white" />
</TouchableOpacity>
        <Text style={styles.mainTitle}>Mes Retards Déclarés</Text>
        <Text style={styles.subTitle}>Suivez l'état de vos signalements de retard</Text>
      </View>
      <FlatList
        data={delayTickets}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748B',
    },

    backButtonCustomHeader: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 0,
        position: 'absolute',
        left: 20,
        top: 30,
        zIndex: 2,
        backgroundColor: 'transparent',
        padding: 0,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginTop: 10,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginTop: 10,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        paddingVertical: 25,
        paddingHorizontal: 20,
        backgroundColor: '#0F172A', // Couleur foncée pour l'en-tête
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        position: 'relative',
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: 'white',
        marginBottom: 5,
    },
    subTitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    ticketCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    badgeLigne: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
    },
    texteBadgeLigne: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    ticketTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        flexShrink: 1, // Pour éviter que le texte ne déborde
    },
    ticketSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    ticketDescription: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    ticketDate: {
        fontSize: 12,
        color: '#94A3B8',
    },
    // statusBadge et statusText ont été supprimés des styles
});

export default MyDelayTicketsScreen;