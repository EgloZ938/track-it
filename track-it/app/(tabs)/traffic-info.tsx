import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator,
  FlatList, RefreshControl, TouchableOpacity
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import apiService from '../../services/apiService';
import { NavitiaDisruption, NavitiaApiResponse } from '../../frontend/src/types';

/* ---------- Fonctions utilitaires ---------- */
const isActive = (periods: { begin: string; end?: string | null }[]) => {
  const now = new Date();
  return periods.some(p => {
    const begin = parseISO(p.begin);
    const end = p.end ? parseISO(p.end) : null;
    return begin <= now && (!end || now < end);
  });
};

const wantedModes = ['Metro', 'RER', 'Tram', 'Train', 'Bus'];

export default function TrafficInfoScreen() {
  const [disruptions, setDisruptions] = useState<NavitiaDisruption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ---- Fetch ---- */
 const fetchTrafficInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await apiService.get<NavitiaApiResponse>('/navitia/traffic-messages');
        const data = response.data;

        if (!data || !Array.isArray(data.disruptions)) {
            setDisruptions([]);
            setError('Aucune donnée de trafic reçue.');
            return;
        }

        const filteredDisruptions = data.disruptions.filter(d => {
            if (!d.affected_objects || d.affected_objects.length === 0) return false;

            // au moins un objet impacté de type ligne avec mode valide
            return d.affected_objects.some(obj => {
                const mode = obj.pt_object?.line?.commercial_modes?.[0]?.name?.toLowerCase();
                return ['rer', 'métro', 'metro', 'tram', 'train', 'bus'].includes(mode);
            });
        });

        setDisruptions(filteredDisruptions);
    } catch (err: any) {
        console.error('Erreur fetchTrafficInfo:', err);
        if (err.message === "Network Error") {
            setError('Impossible de se connecter au serveur.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
            setError('Session expirée ou non autorisée.');
        } else {
            setError('Erreur lors du chargement des informations de trafic.');
        }
    } finally {
        setIsLoading(false);
        setRefreshing(false);
    }
}, []);


  useEffect(() => { fetchTrafficInfo(); }, [fetchTrafficInfo]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchTrafficInfo(); }, [fetchTrafficInfo]);

  /* ---- Render item ---- */
  const renderDisruptionItem = ({ item }: { item: NavitiaDisruption }) => {
    const primaryText = item.message ?? item.title ?? 'Pas de message disponible.';

    const affectedLines = item.impactedObjects
      ?.filter(o => o.line)
      .map(o => o.line?.shortName || o.line?.name)
      .filter(Boolean) ?? [];

    const period = item.applicationPeriods?.[0];
    const startTime = period?.begin
      ? format(parseISO(period.begin), 'dd/MM HH:mm', { locale: fr })
      : 'N/A';
    const endTime = period?.end
      ? format(parseISO(period.end), 'dd/MM HH:mm', { locale: fr })
      : 'N/A';

    let iconName: keyof typeof Ionicons.glyphMap = 'information-circle-outline';
    let iconColor = '#6B7280';
    switch (item.severity.name) {
      case 'BLOCKING':   iconName = 'alert-circle';        iconColor = '#DC2626'; break;
      case 'DISTURBED':  iconName = 'warning';             iconColor = '#F59E0B'; break;
      case 'INFORMATION':iconName = 'information-circle';  iconColor = '#0A7EA4'; break;
    }

    return (
      <View style={styles.disruptionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name={iconName} size={24} color={iconColor} style={styles.cardIcon} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.disruptionSeverity, { color: iconColor }]}>
              {item.severity.name}
            </Text>
            {affectedLines.length > 0 && (
              <Text style={styles.affectedLines}>
                Ligne(s) : {affectedLines.join(', ')}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.disruptionMessage}>{primaryText}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.disruptionDate}>Début : {startTime}</Text>
          <Text style={styles.disruptionDate}>Fin : {endTime}</Text>
        </View>
      </View>
    );
  };

  /* ---- UI ---- */
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Infos Trafic',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isLoading && !error && disruptions.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="information-circle-outline" size={60} color="#9CA3AF" />
          <Text style={styles.emptyText}>Aucune perturbation en cours.</Text>
        </View>
      )}
      {!isLoading && !error && disruptions.length > 0 && (
        <FlatList
          data={disruptions}
          renderItem={renderDisruptionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              colors={['#0EA5E9']} tintColor="#0EA5E9" />
          }
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6B7280', fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 10, color: '#EF4444', fontSize: 16, textAlign: 'center' },
  retryButton: { backgroundColor: '#0A7EA4', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 15, color: '#9CA3AF', fontSize: 16, textAlign: 'center' },
  listContent: { paddingVertical: 15, paddingHorizontal: 10 },
  disruptionCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { marginRight: 10 },
  headerTextContainer: { flex: 1 },
  disruptionSeverity: { fontSize: 14, fontWeight: 'bold' },
  affectedLines: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  disruptionMessage: { fontSize: 15, color: '#1F2937', marginBottom: 10 },
  dateContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  disruptionDate: { fontSize: 12, color: '#9CA3AF' },
});
