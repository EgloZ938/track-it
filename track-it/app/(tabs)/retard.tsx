





import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/services/authService';
import { router } from 'expo-router';
import api from '@/services/apiService';
import axios from 'axios';

// --- IMPORTATION DES DONNÉES BRUTES ---
// TRÈS IMPORTANT : VÉRIFIEZ MINUTIEUSEMENT CES CHEMINS !
// Si votre fichier RetardEtudiants.tsx a été déplacé, ces chemins DOIVENT être ajustés.
// Par exemple, si RetardEtudiants.tsx est dans le dossier 'app', il faut peut-être adapter le nombre de '..'
import busLinesData from '../../frontend/src/data/bus_lines.json'; // Vérifiez le chemin
import rerLinesData from '../../frontend/src/data/rer_lines.json'; // Vérifiez le chemin
import metroLinesData from '../../frontend/src/data/metro_lines.json'; // Vérifiez le chemin
import tramLinesData from '../../frontend/src/data/tram_lines.json'; // Vérifiez le chemin

// Ce fichier est la source UNIQUE pour TOUTES les stations/points d'arrêt.
import allStationsRawData from '../../frontend/src/data/arrets-lignes.json'; // Vérifiez le chemin (doit être relatif à RetardEtudiants.tsx)

import {
    LigneTransport,
    LocationObject,
    NavitiaDisruption,
    NavitiaApiResponse,
} from '../../frontend/src/types';

// Interfaces pour les données des lignes et des points d'arrêt
interface IDFMobiliteResponseLignes {
    total_count: number;
    results: LigneTransport[];
}

interface StopPointIDFM {
    id_line: string;
    id_stop_point: string;
    name_stop_point: string;
    coord_x: number;
    coord_y: number;
}

interface RawStopPoint {
    id: string; // L'ID de la ligne pour cet arrêt
    route_long_name: string;
    stop_id: string;
    stop_name: string;
    stop_lon: string;
    stop_lat: string;
    operatorname: string;
    shortname: string;
    mode: string;
    pointgeo: {
        lon: number;
        lat: number;
    };
    nom_commune: string;
    code_insee: string;
}

// Transformation de arrets-lignes.json en ALL_AVAILABLE_STATIONS
const ALL_AVAILABLE_STATIONS: StopPointIDFM[] = (allStationsRawData as RawStopPoint[]).map(item => ({
    id_line: item.id,
    id_stop_point: item.stop_id,
    name_stop_point: item.stop_name,
    coord_x: parseFloat(item.stop_lon),
    coord_y: parseFloat(item.stop_lat),
}));

// DEBUGGING : Vérifiez le contenu de ALL_AVAILABLE_STATIONS dans votre console
console.log('ALL_AVAILABLE_STATIONS loaded count:', ALL_AVAILABLE_STATIONS.length);
if (ALL_AVAILABLE_STATIONS.length > 0) {
    console.log('First station example:', ALL_AVAILABLE_STATIONS[0]);
} else {
    console.warn('ALL_AVAILABLE_STATIONS appears empty. Check arrets-lignes.json path and content.');
}


// Mappage pour accéder aux données des lignes en fonction du mode de transport
const LINES_BY_MODE: { [key: string]: LigneTransport[] } = {
    'bus': (busLinesData as IDFMobiliteResponseLignes)?.results || [],
    'rail': (rerLinesData as IDFMobiliteResponseLignes)?.results || [], // RER et trains
    'metro': (metroLinesData as IDFMobiliteResponseLignes)?.results || [],
    'tram': (tramLinesData as IDFMobiliteResponseLignes)?.results || [],
};

// DEBUGGING : Vérifiez le contenu de LINES_BY_MODE dans votre console
console.log('LINES_BY_MODE loaded:', {
    busCount: LINES_BY_MODE.bus.length,
    railCount: LINES_BY_MODE.rail.length,
    metroCount: LINES_BY_MODE.metro.length,
    tramCount: LINES_BY_MODE.tram.length,
});
if (LINES_BY_MODE.bus.length === 0 || LINES_BY_MODE.rail.length === 0) {
    console.warn('One or more line data files appear empty. Check their paths and content.');
}


const RetardEtudiants: React.FC = () => {
    const [selectedTransportMode, setSelectedTransportMode] = useState<string | null>(null);
    const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
    const [selectedStopPoint, setSelectedStopPoint] = useState<StopPointIDFM | null>(null);
    const [location, setLocation] = useState<LocationObject | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // État de chargement global pour les boutons
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const loggedIn = await authService.isLoggedIn();
            setIsLoggedIn(loggedIn);
        };
        checkLoginStatus();
    }, []);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Pour détecter les arrêts proches, veuillez accorder la permission de localisation.');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        })();
    }, []);

    const handleTransportModeChange = (mode: string) => {
        setSelectedTransportMode(mode);
        setSelectedLine(null); // Reset line when mode changes
        setSelectedStopPoint(null); // Reset stop point when mode changes
    };

    const handleLineChange = (lineId: string) => {
        // Ajout d'une vérification pour s'assurer que LINES_BY_MODE[selectedTransportMode!] n'est pas undefined
        const lines = LINES_BY_MODE[selectedTransportMode!] || [];
        const line = lines.find(l => l.id_line === lineId);
        setSelectedLine(line || null);
        setSelectedStopPoint(null); // Reset stop point when line changes
    };

    const handleStopPointChange = (stopPointId: string) => {
        const lineIdForFiltering = selectedLine?.id_line;
        if (!lineIdForFiltering) return;

        const filteredStopPoints = ALL_AVAILABLE_STATIONS.filter(stop => stop.id_line === lineIdForFiltering);
        const stopPoint = filteredStopPoints.find(sp => sp.id_stop_point === stopPointId);
        setSelectedStopPoint(stopPoint || null);
    };

    const filterStopPoints = useCallback((lineId: string | undefined) => {
        if (!lineId) {
            return [];
        }
        return ALL_AVAILABLE_STATIONS.filter(stop => stop.id_line === lineId);
    }, []);

    const handleSubmit = async () => {
        if (!isLoggedIn) {
            Alert.alert("Connexion requise", "Vous devez être connecté pour déclarer un retard.");
            router.push('/login');
            return;
        }

        if (!selectedTransportMode || !selectedLine || !selectedStopPoint) {
            Alert.alert('Champs manquants', 'Veuillez sélectionner un mode de transport, une ligne et une station.');
            return;
        }

        setLoading(true);
        try {
            const delayData = {
                transportMode: selectedTransportMode,
                lineId: selectedLine.id_line,
                lineName: selectedLine.name_line,
                stopPointId: selectedStopPoint.id_stop_point,
                stopPointName: selectedStopPoint.name_stop_point,
                coordinates: {
                    latitude: selectedStopPoint.coord_y,
                    longitude: selectedStopPoint.coord_x,
                },
                timestamp: new Date().toISOString(),
            };

            console.log('Sending delay data:', delayData);

            await api.post('/declare-delay', delayData); // Assurez-vous que votre API est configurée
            Alert.alert('Retard déclaré', 'Votre déclaration a été envoyée avec succès.');
            // Reset form
            setSelectedTransportMode(null);
            setSelectedLine(null);
            setSelectedStopPoint(null);
        } catch (error) {
            console.error('Error declaring delay:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('API Error Response:', error.response.data);
                Alert.alert('Erreur', `Échec de la déclaration: ${error.response.data.message || 'Une erreur inconnue est survenue.'}`);
            } else {
                Alert.alert('Erreur', 'Échec de la déclaration du retard. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDisruptions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get<NavitiaApiResponse>('https://api.navitia.io/v1/coverage/fr-idf/disruptions', {
                headers: {
                    // TRÈS IMPORTANT : REMPLACEZ 'YOUR_NAVITIA_API_KEY' PAR VOTRE VRAIE CLÉ API NAVITIA !
                    // Sans une clé valide, cette requête échouera et le loader restera bloqué.
                    'Authorization': `Bearer YOUR_NAVITIA_API_KEY`
                }
            });
            const disruptions = response.data.disruptions;
            console.log('Navitia Disruptions:', disruptions);
            Alert.alert('Incidents Navitia', `Nombre d'incidents trouvés : ${disruptions.length}`);
        } catch (error) {
            console.error('Error fetching Navitia disruptions:', error);
            if (axios.isAxiosError(error)) {
                console.error('Navitia API Error Response:', error.response?.data);
                Alert.alert('Erreur Navitia', `Impossible de récupérer les incidents: ${error.response?.statusText || 'Erreur réseau/API'}. Vérifiez votre clé API.`);
            } else {
                Alert.alert('Erreur Navitia', 'Impossible de récupérer les incidents. Vérifiez votre connexion.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Le ScrollView doit bien s'étendre et contenir le contenu */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Déclarer un Retard</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Sélectionnez le mode de transport</Text>
                    <Picker
                        selectedValue={selectedTransportMode}
                        onValueChange={(itemValue) => handleTransportModeChange(itemValue)}
                        style={styles.picker}
                        // Pour Android, assurez-vous que la couleur du texte est visible
                        itemStyle={Platform.OS === 'android' ? { color: '#333' } : {}}
                    >
                        <Picker.Item label="Sélectionner un mode" value={null} />
                        <Picker.Item label="Bus" value="bus" />
                        <Picker.Item label="RER / Train" value="rail" />
                        <Picker.Item label="Métro" value="metro" />
                        <Picker.Item label="Tram" value="tram" />
                    </Picker>
                </View>

                {selectedTransportMode && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Sélectionnez la ligne concernée</Text>
                        <Picker
                            selectedValue={selectedLine?.id_line || null}
                            onValueChange={(itemValue) => handleLineChange(itemValue)}
                            style={styles.picker}
                            itemStyle={Platform.OS === 'android' ? { color: '#333' } : {}}
                        >
                            <Picker.Item label="Sélectionner une ligne" value={null} />
                            {/* Assurez-vous que LINES_BY_MODE[selectedTransportMode] n'est pas undefined */}
                            {LINES_BY_MODE[selectedTransportMode]?.map((line) => (
                                <Picker.Item key={line.id_line} label={`${line.shortname_line} - ${line.name_line}`} value={line.id_line} />
                            ))}
                        </Picker>
                    </View>
                )}

                {selectedLine && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Sélectionnez la station de l'incident</Text>
                        <Picker
                            selectedValue={selectedStopPoint?.id_stop_point || null}
                            onValueChange={(itemValue) => handleStopPointChange(itemValue)}
                            style={styles.picker}
                            itemStyle={Platform.OS === 'android' ? { color: '#333' } : {}}
                        >
                            <Picker.Item label="Sélectionner une station" value={null} />
                            {filterStopPoints(selectedLine.id_line).map((stopPoint) => (
                                <Picker.Item key={stopPoint.id_stop_point} label={stopPoint.name_stop_point} value={stopPoint.id_stop_point} />
                            ))}
                        </Picker>
                    </View>
                )}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Déclarer le Retard</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.navitiaButton} onPress={fetchDisruptions} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.navitiaButtonText}>Voir les incidents Navitia</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1, // Permet au contenu de s'étendre et d'être scrollable
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 30 : 0, // Ajouter un padding top pour Android si nécessaire
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20, // Plus d'espace entre les sections
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    submitButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30, // Marge suffisante au-dessus du bouton
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    navitiaButton: {
        backgroundColor: '#6c757d',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20, // Marge en bas pour le dernier bouton
    },
    navitiaButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RetardEtudiants;