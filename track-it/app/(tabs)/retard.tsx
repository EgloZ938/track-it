import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/services/authService';
import { router } from 'expo-router';
import api from '@/services/apiService';
import allStationsRawData from '../../frontend/src/data/arrets-lignes.json';

interface StopPointIDFM {
  id_line: string;
  id_stop_point: string;
  name_stop_point: string;
  coord_x: number;
  coord_y: number;
}

interface RawStopPoint {
  id: string;
  route_long_name: string;
  stop_id: string;
  stop_name: string;
  stop_lon: string;
  stop_lat: string;
  operatorname: string;
  shortname: string;
  mode: string;
}

interface LigneTransport {
  id_line: string;
  name_line: string;
  shortname_line: string;
  transportmode: string;
  operatorname: string;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
}

const typesTransport = [
  { id: 'rail', libelle: 'RER', icone: 'train', couleur: '#10B981' },
  { id: 'metro', libelle: 'Métro', icone: 'subway', couleur: '#8B5CF6' },
  { id: 'tram', libelle: 'Tramway', icone: 'car', couleur: '#F59E0B' },
  { id: 'bus', libelle: 'Bus', icone: 'bus', couleur: '#0EA5E9' },
];

const ALL_STOP_POINTS: StopPointIDFM[] = (allStationsRawData as RawStopPoint[]).map((item) => ({
  id_line: item.id,
  id_stop_point: item.stop_id,
  name_stop_point: item.stop_name,
  coord_x: parseFloat(item.stop_lon),
  coord_y: parseFloat(item.stop_lat),
}));

const ALL_LINES: LigneTransport[] = Array.from(
  new Map(
    (allStationsRawData as RawStopPoint[]).map((item) => [
      item.id,
      {
        id_line: item.id,
        name_line: item.route_long_name,
        shortname_line: item.shortname,
        transportmode: item.mode.toLowerCase(),
        operatorname: item.operatorname,
        colourweb_hexa: '#0EA5E9',
        textcolourweb_hexa: '#FFFFFF',
      },
    ])
  ).values()
);

const LINES_BY_MODE: { [key: string]: LigneTransport[] } = {
  bus: ALL_LINES.filter((l) => l.transportmode === 'bus'),
  rail: ALL_LINES.filter((l) => l.transportmode === 'localtrain'),
  metro: ALL_LINES.filter((l) => l.transportmode === 'metro'),
  tram: ALL_LINES.filter((l) => l.transportmode === 'tram'),
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const RetardEtudiants = () => {
  const [selectedTransportMode, setSelectedTransportMode] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
  const [selectedStopPoint, setSelectedStopPoint] = useState<StopPointIDFM | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [modaleTransportVisible, setModaleTransportVisible] = useState(false);
  const [modaleLigneVisible, setModaleLigneVisible] = useState(false);
  const [modaleStationVisible, setModaleStationVisible] = useState(false);

  useEffect(() => {
    // Vérification de la localisation de l'utilisateur
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync();
        setLocation(currentLocation);
      } else {
        Alert.alert('Permission refusée', 'La localisation est nécessaire pour cette fonctionnalité.');
      }
    };

    requestLocationPermission();
  }, []);

  const filterStopPoints = useCallback((lineId: string | undefined) => {
    if (!lineId) return [];
    return ALL_STOP_POINTS.filter((stop) => stop.id_line === lineId);
  }, []);

  const handleSubmit = async () => {
    setLoading(true); // Activer l'indicateur de chargement
    console.log('Début de handleSubmit'); // AJOUTEZ CECI
    const loggedIn = await authService.isAuthenticated();
    if (!loggedIn) {
      Alert.alert('Non connecté', 'Connectez-vous pour déclarer un retard.');
      router.push('/login');
      setLoading(false);
      console.log('Utilisateur non connecté, annulation.'); // AJOUTEZ CECI
      return;
    }

    if (!selectedTransportMode || !selectedLine || !selectedStopPoint || !description.trim() || !location) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      setLoading(false);
      console.log('Champs manquants, annulation.'); // AJOUTEZ CECI
      return;
    }

    const dist = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      selectedStopPoint.coord_y,
      selectedStopPoint.coord_x
    );

    // if (dist > 500) {
    //   Alert.alert('Trop loin', `Vous êtes à ${Math.round(dist)}m. Max autorisé : 500m.`);
    //   setLoading(false);
    //   console.log('Trop loin de la station, annulation.'); // AJOUTEZ CECI
    //   return;
    // }

    try {
      const delayTicketData = {
        transportLine: selectedLine,
        stopPoint: selectedStopPoint,
        description: description.trim(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        distanceFromStop: Math.round(dist),
      };

      console.log('Données envoyées au backend:', JSON.stringify(delayTicketData, null, 2)); // AJOUTEZ CECI (pour voir les données exactes)

      const response = await api.post('/delaytickets', delayTicketData);

      console.log('Réponse du backend:', response.data); // AJOUTEZ CECI (pour voir la réponse complète)

      if (response.data && response.data.delayTicket) {
        Alert.alert('Succès', 'Votre ticket de retard a été créé !');
        router.replace('/profile/my-delay-tickets');
        console.log('Ticket créé avec succès, redirection.'); // AJOUTEZ CECI
      } else {
        Alert.alert('Erreur', 'Une erreur inattendue est survenue lors de la création du ticket.');
        console.log('Réponse inattendue du backend.'); // AJOUTEZ CECI
      }

    } catch (error: any) {
      console.error('Erreur lors de la création du ticket de retard:', error.response?.data || error.message);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer le ticket de retard. Veuillez réessayer.');
      console.log('Erreur dans le bloc catch.'); // AJOUTEZ CECI
    } finally {
      setLoading(false);
      console.log('Fin de handleSubmit, loading désactivé.'); // AJOUTEZ CECI
    }
  };

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.arrierePlan}>
        <View style={styles.formeDecorative1} />
        <View style={styles.formeDecorative2} />
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.entete}>
            <Text style={styles.titrePrincipal}>Déclaration de Retard</Text>
            <Text style={styles.sousTitre}>Signalez un retard sur votre ligne</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
               Type de transport <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TouchableOpacity onPress={() => setModaleTransportVisible(true)} style={styles.selecteurTransport}>
              <View style={styles.contenuSelecteur}>
                {selectedTransportMode ? (
                  <>
                    <Ionicons 
                      name={typesTransport.find(t => t.id === selectedTransportMode)?.icone as any} 
                      size={24} 
                      color={typesTransport.find(t => t.id === selectedTransportMode)?.couleur} 
                    />
                    <Text style={[styles.texteSelecteur, { color: '#1E293B' }]}>
                      {typesTransport.find(t => t.id === selectedTransportMode)?.libelle}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={24} color="#64748B" />
                    <Text style={styles.texteSelecteur}>Choisir un transport</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
               Ligne <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TouchableOpacity 
              onPress={() => selectedTransportMode && setModaleLigneVisible(true)} 
              style={[styles.selecteurTransport, !selectedTransportMode && { opacity: 0.5 }]}
              disabled={!selectedTransportMode}
            >
              <View style={styles.contenuSelecteur}>
                {selectedLine ? (
                  <View style={styles.conteneurLigneSelectionnee}>
                    <View style={[styles.badgeLigne, { backgroundColor: selectedLine.colourweb_hexa }]}>
                      <Text style={[styles.texteBadgeLigne, { color: selectedLine.textcolourweb_hexa }]}>
                        {selectedLine.shortname_line}
                      </Text>
                    </View>
                    <Text style={styles.detailsLigne}>{selectedLine.name_line}</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={24} color="#64748B" />
                    <Text style={styles.texteSelecteur}>Choisir une ligne</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
              📍 Station <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TouchableOpacity 
              onPress={() => selectedLine && setModaleStationVisible(true)} 
              style={[styles.selecteurTransport, !selectedLine && { opacity: 0.5 }]}
              disabled={!selectedLine}
            >
              <View style={styles.contenuSelecteur}>
                {selectedStopPoint ? (
                  <>
                    <Ionicons name="location" size={24} color="#0EA5E9" />
                    <Text style={[styles.texteSelecteur, { color: '#1E293B' }]}>
                      {selectedStopPoint.name_stop_point}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={24} color="#64748B" />
                    <Text style={styles.texteSelecteur}>Choisir une station</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
               Description <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TextInput
              style={styles.champTexte}
              placeholder="Décrivez le retard (durée, cause, etc.)"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !selectedTransportMode || !selectedLine || !selectedStopPoint || !description.trim()}
            style={[
              styles.boutonSoumission,
              (!selectedTransportMode || !selectedLine || !selectedStopPoint || !description.trim()) && { backgroundColor: '#94A3B8' },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.texteBoutonSoumission}>Continuer</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Modal Transport */}
        <Modal visible={modaleTransportVisible} transparent animationType="slide">
          <View style={styles.overlayModale}>
            <View style={styles.contenuModale}>
              <View style={styles.enteteModale}>
                <Text style={styles.titreModale}>Choisir un transport</Text>
                <TouchableOpacity onPress={() => setModaleTransportVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.conteneurTypesTransport}>
                {typesTransport.map(t => (
                  <TouchableOpacity key={t.id} style={styles.boutonTypeTransport} onPress={() => {
                    setSelectedTransportMode(t.id);
                    setSelectedLine(null);
                    setSelectedStopPoint(null);
                    setModaleTransportVisible(false);
                  }}>
                    <View style={styles.iconeTypeTransport}>
                      <Ionicons name={t.icone as any} size={32} color={t.couleur} />
                    </View>
                    <Text style={styles.texteTypeTransport}>{t.libelle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Ligne */}
        <Modal visible={modaleLigneVisible} transparent animationType="slide">
          <View style={styles.overlayModale}>
            <View style={styles.contenuModale}>
              <View style={styles.enteteModale}>
                <Text style={styles.titreModale}>
                  Lignes {typesTransport.find(t => t.id === selectedTransportMode)?.libelle}
                </Text>
                <TouchableOpacity onPress={() => setModaleLigneVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.conteneurLignes}>
                {LINES_BY_MODE[selectedTransportMode!]?.length > 0 ? (
                  <View style={styles.grilleLignes}>
                    {LINES_BY_MODE[selectedTransportMode!].map((l) => (
                      <TouchableOpacity 
                        key={l.id_line} 
                        style={[
                          styles.boutonLigne,
                          { backgroundColor: l.colourweb_hexa }
                        ]} 
                        onPress={() => {
                          setSelectedLine(l);
                          setSelectedStopPoint(null);
                          setModaleLigneVisible(false);
                        }}
                      >
                        <Text style={[styles.texteLigne, { color: l.textcolourweb_hexa }]}>
                          {l.shortname_line}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.texteAucuneLigne}>Aucune ligne disponible</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal Station */}
        <Modal visible={modaleStationVisible} transparent animationType="slide">
          <View style={styles.overlayModale}>
            <View style={styles.contenuModale}>
              <View style={styles.enteteModale}>
                <Text style={styles.titreModale}>Stations</Text>
                <TouchableOpacity onPress={() => setModaleStationVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.conteneurLignes}>
                {filterStopPoints(selectedLine?.id_line).length > 0 ? (
                  <View>
                    {filterStopPoints(selectedLine?.id_line).map((s) => (
                      <TouchableOpacity 
                        key={s.id_stop_point} 
                        style={styles.boutonStation}
                        onPress={() => {
                          setSelectedStopPoint(s);
                          setModaleStationVisible(false);
                        }}
                      >
                        <Ionicons name="location" size={20} color="#0EA5E9" />
                        <Text style={styles.texteStation}>{s.name_stop_point}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.texteAucuneLigne}>Aucune station disponible</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneur: {
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
    paddingHorizontal: 20,
  },
  entete: {
    paddingVertical: 50,
    marginBottom: 10,
    alignItems: 'center',
  },
  titrePrincipal: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  sousTitre: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  titreSectionIcone: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  obligatoire: {
    color: '#EF4444',
  },
  selecteurTransport: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contenuSelecteur: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  texteSelecteur: {
    marginLeft: 12,
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  conteneurLigneSelectionnee: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgeLigne: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  texteBadgeLigne: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsLigne: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  champTexte: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  boutonSoumission: {
    backgroundColor: '#0EA5E9',
    borderRadius: 20,
    paddingVertical: 18,
    marginBottom: 60,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  texteBoutonSoumission: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  overlayModale: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  contenuModale: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  enteteModale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titreModale: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  conteneurTypesTransport: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 46,
  },
  boutonTypeTransport: {
    alignItems: 'center',
    padding: 16,
  },
  iconeTypeTransport: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  texteTypeTransport: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  conteneurLignes: {
    maxHeight: 400,
  },
  grilleLignes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
  },
  boutonLigne: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texteLigne: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  texteAucuneLigne: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    padding: 32,
  },
  boutonStation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  texteStation: {
    marginLeft: 12,
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RetardEtudiants;