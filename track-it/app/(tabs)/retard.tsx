





// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Platform,
//     Alert,
//     ActivityIndicator,
//     ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Picker } from '@react-native-picker/picker';
// import * as Location from 'expo-location';
// import { Ionicons } from '@expo/vector-icons';
// import authService from '@/services/authService';
// import { router } from 'expo-router';
// import api from '@/services/apiService';
// import axios from 'axios';

// // --- IMPORTATION DES DONNÉES BRUTES ---
// // TRÈS IMPORTANT : VÉRIFIEZ MINUTIEUSEMENT CES CHEMINS !
// // Si votre fichier RetardEtudiants.tsx a été déplacé, ces chemins DOIVENT être ajustés.
// // Par exemple, si RetardEtudiants.tsx est dans le dossier 'app', il faut peut-être adapter le nombre de '..'
// import busLinesData from '../../frontend/src/data/bus_lines.json'; // Vérifiez le chemin
// import rerLinesData from '../../frontend/src/data/rer_lines.json'; // Vérifiez le chemin
// import metroLinesData from '../../frontend/src/data/metro_lines.json'; // Vérifiez le chemin
// import tramLinesData from '../../frontend/src/data/tram_lines.json'; // Vérifiez le chemin

// // Ce fichier est la source UNIQUE pour TOUTES les stations/points d'arrêt.
// import allStationsRawData from '../../frontend/src/data/arrets-lignes.json'; // Vérifiez le chemin (doit être relatif à RetardEtudiants.tsx)

// import {
//     LigneTransport,
//     LocationObject,
//     NavitiaDisruption,
//     NavitiaApiResponse,
// } from '../../frontend/src/types';

// // Interfaces pour les données des lignes et des points d'arrêt
// interface IDFMobiliteResponseLignes {
//     total_count: number;
//     results: LigneTransport[];
// }

// interface StopPointIDFM {
//     id_line: string;
//     id_stop_point: string;
//     name_stop_point: string;
//     coord_x: number;
//     coord_y: number;
// }

// interface RawStopPoint {
//     id: string; // L'ID de la ligne pour cet arrêt
//     route_long_name: string;
//     stop_id: string;
//     stop_name: string;
//     stop_lon: string;
//     stop_lat: string;
//     operatorname: string;
//     shortname: string;
//     mode: string;
//     pointgeo: {
//         lon: number;
//         lat: number;
//     };
//     nom_commune: string;
//     code_insee: string;
// }

// // Transformation de arrets-lignes.json en ALL_AVAILABLE_STATIONS
// const ALL_AVAILABLE_STATIONS: StopPointIDFM[] = (allStationsRawData as RawStopPoint[]).map(item => ({
//     id_line: item.id,
//     id_stop_point: item.stop_id,
//     name_stop_point: item.stop_name,
//     coord_x: parseFloat(item.stop_lon),
//     coord_y: parseFloat(item.stop_lat),
// }));

// // DEBUGGING : Vérifiez le contenu de ALL_AVAILABLE_STATIONS dans votre console
// console.log('ALL_AVAILABLE_STATIONS loaded count:', ALL_AVAILABLE_STATIONS.length);
// if (ALL_AVAILABLE_STATIONS.length > 0) {
//     console.log('First station example:', ALL_AVAILABLE_STATIONS[0]);
// } else {
//     console.warn('ALL_AVAILABLE_STATIONS appears empty. Check arrets-lignes.json path and content.');
// }


// // Mappage pour accéder aux données des lignes en fonction du mode de transport
// const LINES_BY_MODE: { [key: string]: LigneTransport[] } = {
//     'bus': (busLinesData as IDFMobiliteResponseLignes)?.results || [],
//     'rail': (rerLinesData as IDFMobiliteResponseLignes)?.results || [], // RER et trains
//     'metro': (metroLinesData as IDFMobiliteResponseLignes)?.results || [],
//     'tram': (tramLinesData as IDFMobiliteResponseLignes)?.results || [],
// };

// // DEBUGGING : Vérifiez le contenu de LINES_BY_MODE dans votre console
// console.log('LINES_BY_MODE loaded:', {
//     busCount: LINES_BY_MODE.bus.length,
//     railCount: LINES_BY_MODE.rail.length,
//     metroCount: LINES_BY_MODE.metro.length,
//     tramCount: LINES_BY_MODE.tram.length,
// });
// if (LINES_BY_MODE.bus.length === 0 || LINES_BY_MODE.rail.length === 0) {
//     console.warn('One or more line data files appear empty. Check their paths and content.');
// }


// const RetardEtudiants: React.FC = () => {
//     const [selectedTransportMode, setSelectedTransportMode] = useState<string | null>(null);
//     const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
//     const [selectedStopPoint, setSelectedStopPoint] = useState<StopPointIDFM | null>(null);
//     const [location, setLocation] = useState<LocationObject | null>(null);
//     const [loading, setLoading] = useState<boolean>(false); // État de chargement global pour les boutons
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

//     useEffect(() => {
//         const checkLoginStatus = async () => {
//             const loggedIn = await authService.isLoggedIn();
//             setIsLoggedIn(loggedIn);
//         };
//         checkLoginStatus();
//     }, []);

//     useEffect(() => {
//         (async () => {
//             let { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert('Permission refusée', 'Pour détecter les arrêts proches, veuillez accorder la permission de localisation.');
//                 return;
//             }

//             let currentLocation = await Location.getCurrentPositionAsync({});
//             setLocation(currentLocation);
//         })();
//     }, []);

//     const handleTransportModeChange = (mode: string) => {
//         setSelectedTransportMode(mode);
//         setSelectedLine(null); // Reset line when mode changes
//         setSelectedStopPoint(null); // Reset stop point when mode changes
//     };

//     const handleLineChange = (lineId: string) => {
//         // Ajout d'une vérification pour s'assurer que LINES_BY_MODE[selectedTransportMode!] n'est pas undefined
//         const lines = LINES_BY_MODE[selectedTransportMode!] || [];
//         const line = lines.find(l => l.id_line === lineId);
//         setSelectedLine(line || null);
//         setSelectedStopPoint(null); // Reset stop point when line changes
//     };

//     const handleStopPointChange = (stopPointId: string) => {
//         const lineIdForFiltering = selectedLine?.id_line;
//         if (!lineIdForFiltering) return;

//         const filteredStopPoints = ALL_AVAILABLE_STATIONS.filter(stop => stop.id_line === lineIdForFiltering);
//         const stopPoint = filteredStopPoints.find(sp => sp.id_stop_point === stopPointId);
//         setSelectedStopPoint(stopPoint || null);
//     };

//     const filterStopPoints = useCallback((lineId: string | undefined) => {
//         if (!lineId) {
//             return [];
//         }
//         return ALL_AVAILABLE_STATIONS.filter(stop => stop.id_line === lineId);
//     }, []);

//     const handleSubmit = async () => {
//         if (!isLoggedIn) {
//             Alert.alert("Connexion requise", "Vous devez être connecté pour déclarer un retard.");
//             router.push('/login');
//             return;
//         }

//         if (!selectedTransportMode || !selectedLine || !selectedStopPoint) {
//             Alert.alert('Champs manquants', 'Veuillez sélectionner un mode de transport, une ligne et une station.');
//             return;
//         }

//         setLoading(true);
//         try {
//             const delayData = {
//                 transportMode: selectedTransportMode,
//                 lineId: selectedLine.id_line,
//                 lineName: selectedLine.name_line,
//                 stopPointId: selectedStopPoint.id_stop_point,
//                 stopPointName: selectedStopPoint.name_stop_point,
//                 coordinates: {
//                     latitude: selectedStopPoint.coord_y,
//                     longitude: selectedStopPoint.coord_x,
//                 },
//                 timestamp: new Date().toISOString(),
//             };

//             console.log('Sending delay data:', delayData);

//             await api.post('/declare-delay', delayData); // Assurez-vous que votre API est configurée
//             Alert.alert('Retard déclaré', 'Votre déclaration a été envoyée avec succès.');
//             // Reset form
//             setSelectedTransportMode(null);
//             setSelectedLine(null);
//             setSelectedStopPoint(null);
//         } catch (error) {
//             console.error('Error declaring delay:', error);
//             if (axios.isAxiosError(error) && error.response) {
//                 console.error('API Error Response:', error.response.data);
//                 Alert.alert('Erreur', `Échec de la déclaration: ${error.response.data.message || 'Une erreur inconnue est survenue.'}`);
//             } else {
//                 Alert.alert('Erreur', 'Échec de la déclaration du retard. Veuillez réessayer.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchDisruptions = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get<NavitiaApiResponse>('https://api.navitia.io/v1/coverage/fr-idf/disruptions', {
//                 headers: {
//                     // TRÈS IMPORTANT : REMPLACEZ 'YOUR_NAVITIA_API_KEY' PAR VOTRE VRAIE CLÉ API NAVITIA !
//                     // Sans une clé valide, cette requête échouera et le loader restera bloqué.
//                     'Authorization': `Bearer YOUR_NAVITIA_API_KEY`
//                 }
//             });
//             const disruptions = response.data.disruptions;
//             console.log('Navitia Disruptions:', disruptions);
//             Alert.alert('Incidents Navitia', `Nombre d'incidents trouvés : ${disruptions.length}`);
//         } catch (error) {
//             console.error('Error fetching Navitia disruptions:', error);
//             if (axios.isAxiosError(error)) {
//                 console.error('Navitia API Error Response:', error.response?.data);
//                 Alert.alert('Erreur Navitia', `Impossible de récupérer les incidents: ${error.response?.statusText || 'Erreur réseau/API'}. Vérifiez votre clé API.`);
//             } else {
//                 Alert.alert('Erreur Navitia', 'Impossible de récupérer les incidents. Vérifiez votre connexion.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     return (
//         <SafeAreaView style={styles.container}>
//             {/* Le ScrollView doit bien s'étendre et contenir le contenu */}
//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <Text style={styles.title}>Déclarer un Retard</Text>

//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>1. Sélectionnez le mode de transport</Text>
//                     <Picker
//                         selectedValue={selectedTransportMode}
//                         onValueChange={(itemValue) => handleTransportModeChange(itemValue)}
//                         style={styles.picker}
//                         // Pour Android, assurez-vous que la couleur du texte est visible
//                         itemStyle={Platform.OS === 'android' ? { color: '#333' } : {}}
//                     >
//                         <Picker.Item label="Sélectionner un mode" value={null} />
//                         <Picker.Item label="Bus" value="bus" />
//                         <Picker.Item label="RER / Train" value="rail" />
//                         <Picker.Item label="Métro" value="metro" />
//                         <Picker.Item label="Tram" value="tram" />
//                     </Picker>
//                 </View>

//                 {selectedTransportMode && (
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>2. Sélectionnez la ligne concernée</Text>
//                         <Picker
//                             selectedValue={selectedLine?.id_line || null}
//                             onValueChange={(itemValue) => handleLineChange(itemValue)}
//                             style={styles.picker}
//                             itemStyle={Platform.OS === 'android' ? { color: '#333' } : {}}
//                         >
//                             <Picker.Item label="Sélectionner une ligne" value={null} />
//                             {/* Assurez-vous que LINES_BY_MODE[selectedTransportMode] n'est pas undefined */}
//                             {LINES_BY_MODE[selectedTransportMode]?.map((line) => (
//                                 <Picker.Item key={line.id_line} label={`${line.shortname_line} - ${line.name_line}`} value={line.id_line} />
//                             ))}
//                         </Picker>
//                     </View>
//                 )}

//                 {selectedLine && (
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>3. Sélectionnez la station de l'incident</Text>
//                         <Picker
//                             selectedValue={selectedStopPoint?.id_stop_point || null}
//                             onValueChange={(itemValue) => handleStopPointChange(itemValue)}
//                             style={styles.picker}
//                             itemStyle={Platform.OS === 'android' ? { color: '#333' } : {}}
//                         >
//                             <Picker.Item label="Sélectionner une station" value={null} />
//                             {filterStopPoints(selectedLine.id_line).map((stopPoint) => (
//                                 <Picker.Item key={stopPoint.id_stop_point} label={stopPoint.name_stop_point} value={stopPoint.id_stop_point} />
//                             ))}
//                         </Picker>
//                     </View>
//                 )}

//                 <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
//                     {loading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text style={styles.submitButtonText}>Déclarer le Retard</Text>
//                     )}
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.navitiaButton} onPress={fetchDisruptions} disabled={loading}>
//                     {loading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text style={styles.navitiaButtonText}>Voir les incidents Navitia</Text>
//                     )}
//                 </TouchableOpacity>

//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     scrollContent: {
//         flexGrow: 1, // Permet au contenu de s'étendre et d'être scrollable
//         padding: 20,
//         paddingTop: Platform.OS === 'android' ? 30 : 0, // Ajouter un padding top pour Android si nécessaire
//     },
//     title: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 30,
//         textAlign: 'center',
//     },
//     section: {
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         padding: 15,
//         marginBottom: 20, // Plus d'espace entre les sections
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#555',
//         marginBottom: 10,
//     },
//     picker: {
//         height: 50,
//         width: '100%',
//         backgroundColor: '#f0f0f0',
//         borderRadius: 8,
//         borderColor: '#ddd',
//         borderWidth: 1,
//     },
//     submitButton: {
//         backgroundColor: '#007bff',
//         padding: 15,
//         borderRadius: 10,
//         alignItems: 'center',
//         marginTop: 30, // Marge suffisante au-dessus du bouton
//     },
//     submitButtonText: {
//         color: '#fff',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     navitiaButton: {
//         backgroundColor: '#6c757d',
//         padding: 15,
//         borderRadius: 10,
//         alignItems: 'center',
//         marginTop: 15,
//         marginBottom: 20, // Marge en bas pour le dernier bouton
//     },
//     navitiaButtonText: {
//         color: '#fff',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
// });

// export default RetardEtudiants;





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
    Modal,
    TextInput,
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
import busLinesData from '../../frontend/src/data/bus_lines.json';
import rerLinesData from '../../frontend/src/data/rer_lines.json';
import metroLinesData from '../../frontend/src/data/metro_lines.json';
import tramLinesData from '../../frontend/src/data/tram_lines.json';
import allStationsRawData from '../../frontend/src/data/arrets-lignes.json';

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
    id: string;
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

// Types de transport avec leurs icônes
const typesTransport = [
    { id: 'bus', libelle: 'Bus', icone: 'bus', couleur: '#0EA5E9' },
    { id: 'rail', libelle: 'RER / Train', icone: 'train', couleur: '#10B981' },
    { id: 'metro', libelle: 'Métro', icone: 'subway', couleur: '#8B5CF6' },
    { id: 'tram', libelle: 'Tramway', icone: 'car', couleur: '#F59E0B' },
];

// Transformation de arrets-lignes.json en ALL_AVAILABLE_STATIONS
const ALL_AVAILABLE_STATIONS: StopPointIDFM[] = (allStationsRawData as RawStopPoint[]).map(item => ({
    id_line: item.id,
    id_stop_point: item.stop_id,
    name_stop_point: item.stop_name,
    coord_x: parseFloat(item.stop_lon),
    coord_y: parseFloat(item.stop_lat),
}));

// Mappage pour accéder aux données des lignes en fonction du mode de transport
const LINES_BY_MODE: { [key: string]: LigneTransport[] } = {
    'bus': (busLinesData as IDFMobiliteResponseLignes)?.results || [],
    'rail': (rerLinesData as IDFMobiliteResponseLignes)?.results || [],
    'metro': (metroLinesData as IDFMobiliteResponseLignes)?.results || [],
    'tram': (tramLinesData as IDFMobiliteResponseLignes)?.results || [],
};

console.log('ALL_AVAILABLE_STATIONS loaded count:', ALL_AVAILABLE_STATIONS.length);
console.log('LINES_BY_MODE loaded:', {
    busCount: LINES_BY_MODE.bus.length,
    railCount: LINES_BY_MODE.rail.length,
    metroCount: LINES_BY_MODE.metro.length,
    tramCount: LINES_BY_MODE.tram.length,
});

// Fonction pour calculer la distance entre deux points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
};

const RetardEtudiants: React.FC = () => {
    const [selectedTransportMode, setSelectedTransportMode] = useState<string | null>(null);
    const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
    const [selectedStopPoint, setSelectedStopPoint] = useState<StopPointIDFM | null>(null);
    const [location, setLocation] = useState<LocationObject | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [description, setDescription] = useState<string>('');
    
    // États pour les modales
    const [modaleTransportVisible, setModaleTransportVisible] = useState(false);
    const [modaleLigneVisible, setModaleLigneVisible] = useState(false);
    const [modaleStationVisible, setModaleStationVisible] = useState(false);

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
        setSelectedLine(null);
        setSelectedStopPoint(null);
        setModaleTransportVisible(false);
        setModaleLigneVisible(true);
    };

    const handleLineChange = (line: LigneTransport) => {
        setSelectedLine(line);
        setSelectedStopPoint(null);
        setModaleLigneVisible(false);
        setModaleStationVisible(true);
    };

    const handleStopPointChange = (stopPoint: StopPointIDFM) => {
        setSelectedStopPoint(stopPoint);
        setModaleStationVisible(false);
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

        if (!selectedTransportMode || !selectedLine || !selectedStopPoint || !description.trim()) {
            Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (!location) {
            Alert.alert('Localisation manquante', 'Impossible de déterminer votre position actuelle.');
            return;
        }

        // Vérifier la distance (500m maximum)
        const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            selectedStopPoint.coord_y,
            selectedStopPoint.coord_x
        );

        if (distance > 500) {
            Alert.alert(
                'Distance trop importante',
                `Vous devez être à moins de 500m de la station pour déclarer un retard. Distance actuelle: ${Math.round(distance)}m`
            );
            return;
        }

        setLoading(true);
        try {
            const delayData = {
                type: 'Retard',
                transportLine: {
                    id_line: selectedLine.id_line,
                    name_line: selectedLine.name_line,
                    shortname_line: selectedLine.shortname_line,
                    transportmode: selectedTransportMode,
                    operatorname: selectedLine.operatorname,
                    colourweb_hexa: selectedLine.colourweb_hexa,
                    textcolourweb_hexa: selectedLine.textcolourweb_hexa,
                },
                description: description,
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy || null,
                },
                stopPoint: {
                    id_stop_point: selectedStopPoint.id_stop_point,
                    name_stop_point: selectedStopPoint.name_stop_point,
                    coord_x: selectedStopPoint.coord_x,
                    coord_y: selectedStopPoint.coord_y,
                },
                distance: Math.round(distance),
            };

            console.log('Sending delay data:', delayData);

            await api.post('/tickets', delayData);
            
            Alert.alert(
                'Retard déclaré',
                `Votre déclaration de retard a été envoyée avec succès!\nDistance de la station: ${Math.round(distance)}m`,
                [{ text: 'OK', onPress: resetForm }]
            );

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

    const resetForm = () => {
        setSelectedTransportMode(null);
        setSelectedLine(null);
        setSelectedStopPoint(null);
        setDescription('');
    };

    const obtenirLocalisation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Impossible d\'accéder à votre localisation');
            return;
        }

        const position = await Location.getCurrentPositionAsync({});
        setLocation(position);
    };

    // Composant Modal Transport
    const ModalTransport = () => (
        <Modal
            visible={modaleTransportVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModaleTransportVisible(false)}
        >
            <View style={styles.overlayModale}>
                <View style={styles.contenuModale}>
                    <View style={styles.enteteModale}>
                        <Text style={styles.titreModale}>Choisir un transport</Text>
                        <TouchableOpacity onPress={() => setModaleTransportVisible(false)}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.conteneurTypesTransport}>
                        {typesTransport.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => handleTransportModeChange(type.id)}
                                style={styles.boutonTypeTransport}
                            >
                                <View style={[styles.iconeTypeTransport, { backgroundColor: `${type.couleur}20` }]}>
                                    <Ionicons name={type.icone as any} size={24} color={type.couleur} />
                                </View>
                                <Text style={styles.texteTypeTransport}>{type.libelle}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Composant Modal Ligne
    const ModaleLigne = () => (
        <Modal
            visible={modaleLigneVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModaleLigneVisible(false)}
        >
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

                    <ScrollView style={styles.conteneurLignes} showsVerticalScrollIndicator={false}>
                        <View style={styles.grilleLignes}>
                            {selectedTransportMode && LINES_BY_MODE[selectedTransportMode]?.map((ligne, index) => (
                                <TouchableOpacity
                                    key={ligne.id_line || `ligne-${index}`}
                                    onPress={() => handleLineChange(ligne)}
                                    style={[
                                        styles.boutonLigne,
                                        { backgroundColor: ligne.colourweb_hexa ? `#${ligne.colourweb_hexa}` : '#0EA5E9' }
                                    ]}
                                >
                                    <Text style={[
                                        styles.texteLigne,
                                        { color: ligne.textcolourweb_hexa ? `#${ligne.textcolourweb_hexa}` : 'white' }
                                    ]}>
                                        {ligne.shortname_line || ligne.name_line || 'N/A'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // Composant Modal Station
    const ModaleStation = () => (
        <Modal
            visible={modaleStationVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModaleStationVisible(false)}
        >
            <View style={styles.overlayModale}>
                <View style={styles.contenuModale}>
                    <View style={styles.enteteModale}>
                        <Text style={styles.titreModale}>Stations</Text>
                        <TouchableOpacity onPress={() => setModaleStationVisible(false)}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.conteneurStations} showsVerticalScrollIndicator={false}>
                        {filterStopPoints(selectedLine?.id_line).map((station) => (
                            <TouchableOpacity
                                key={station.id_stop_point}
                                onPress={() => handleStopPointChange(station)}
                                style={styles.boutonStation}
                            >
                                <View style={styles.iconeStation}>
                                    <Ionicons name="location" size={20} color="#0EA5E9" />
                                </View>
                                <Text style={styles.texteStation}>{station.name_stop_point}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.conteneur}>
            <View style={styles.arrierePlan}>
                <View style={styles.formeDecorative1} />
                <View style={styles.formeDecorative2} />

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.entete}>
                        <Text style={styles.titrePrincipal}>Déclarer un Retard</Text>
                        <Text style={styles.sousTitre}>Signalez les retards aux autres étudiants</Text>
                    </View>

                    {/* Sélection du transport */}
                    <View style={styles.section}>
                        <Text style={styles.titreSectionIcone}>
                            Type de transport <Text style={styles.obligatoire}>*</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => setModaleTransportVisible(true)}
                            style={styles.selecteurTransport}
                        >
                            <View style={styles.contenuSelecteur}>
                                {selectedTransportMode ? (
                                    <>
                                        <Ionicons 
                                            name={typesTransport.find(t => t.id === selectedTransportMode)?.icone as any} 
                                            size={20} 
                                            color={typesTransport.find(t => t.id === selectedTransportMode)?.couleur} 
                                        />
                                        <Text style={styles.texteSelecteur}>
                                            {typesTransport.find(t => t.id === selectedTransportMode)?.libelle}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="train" size={20} color="#64748B" />
                                        <Text style={styles.texteSelecteur}>Sélectionner un transport</Text>
                                    </>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Sélection de la ligne */}
                    {selectedTransportMode && (
                        <View style={styles.section}>
                            <Text style={styles.titreSectionIcone}>
                                Ligne de transport <Text style={styles.obligatoire}>*</Text>
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModaleLigneVisible(true)}
                                style={styles.selecteurTransport}
                            >
                                <View style={styles.contenuSelecteur}>
                                    {selectedLine ? (
                                        <View style={styles.conteneurLigneSelectionnee}>
                                            <View style={[
                                                styles.badgeLigne,
                                                { backgroundColor: selectedLine.colourweb_hexa ? `#${selectedLine.colourweb_hexa}` : '#0EA5E9' }
                                            ]}>
                                                <Text style={[
                                                    styles.texteBadgeLigne,
                                                    { color: selectedLine.textcolourweb_hexa ? `#${selectedLine.textcolourweb_hexa}` : 'white' }
                                                ]}>
                                                    {selectedLine.shortname_line || 'N/A'}
                                                </Text>
                                            </View>
                                            <Text style={styles.detailsLigne} numberOfLines={1}>
                                                {selectedLine.name_line || 'Nom non disponible'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            <Ionicons name="list" size={20} color="#64748B" />
                                            <Text style={styles.texteSelecteur}>Sélectionner une ligne</Text>
                                        </>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Sélection de la station */}
                    {selectedLine && (
                        <View style={styles.section}>
                            <Text style={styles.titreSectionIcone}>
                                Station concernée <Text style={styles.obligatoire}>*</Text>
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModaleStationVisible(true)}
                                style={styles.selecteurTransport}
                            >
                                <View style={styles.contenuSelecteur}>
                                    {selectedStopPoint ? (
                                        <>
                                            <Ionicons name="location" size={20} color="#10B981" />
                                            <Text style={styles.texteSelecteur}>
                                                {selectedStopPoint.name_stop_point}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="location-outline" size={20} color="#64748B" />
                                            <Text style={styles.texteSelecteur}>Sélectionner une station</Text>
                                        </>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.titreSectionIcone}>
                            Description du retard <Text style={styles.obligatoire}>*</Text>
                        </Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Décrivez la situation (ex: train en panne, correspondance ratée...)"
                            multiline
                            numberOfLines={3}
                            style={styles.champTexte}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    {/* Localisation */}
                    <View style={styles.section}>
                        <Text style={styles.titreSectionIcone}>
                            Localisation <Text style={styles.obligatoire}>*</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={obtenirLocalisation}
                            style={styles.boutonLocalisation}
                        >
                            <View style={styles.contenuBoutonLocalisation}>
                                <Ionicons name="location" size={20} color="#64748B" />
                                <Text style={styles.texteBoutonLocalisation}>
                                    {location ? 'Position capturée ✓' : 'Capturer ma position'}
                                </Text>
                            </View>
                            {location && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                        </TouchableOpacity>
                        {location && selectedStopPoint && (
                            <Text style={styles.texteDistance}>
                                Distance de la station: {Math.round(calculateDistance(
                                    location.coords.latitude,
                                    location.coords.longitude,
                                    selectedStopPoint.coord_y,
                                    selectedStopPoint.coord_x
                                ))}m
                            </Text>
                        )}
                    </View>

                    {/* Bouton de soumission */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[
                            styles.boutonSoumission,
                            (!selectedTransportMode || !selectedLine || !selectedStopPoint || !description.trim() || !location) && styles.boutonDesactive
                        ]}
                        disabled={loading || !selectedTransportMode || !selectedLine || !selectedStopPoint || !description.trim() || !location}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.texteBoutonSoumission}>
                                Déclarer le retard
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                {/* Modales */}
                <ModalTransport />
                <ModaleLigne />
                <ModaleStation />
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
        backgroundColor: '#0EA5E9',
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
        minHeight: 100,
        textAlignVertical: 'top',
    },
    boutonLocalisation: {
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
    contenuBoutonLocalisation: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    texteBoutonLocalisation: {
        marginLeft: 12,
        color: '#64748B',
        fontSize: 16,
        fontWeight: '500',
    },
    texteDistance: {
        marginTop: 8,
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
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
    boutonDesactive: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0.1,
    },
    texteBoutonSoumission: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    // Styles pour les modales
    overlayModale: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    contenuModale: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
    },

})

export default RetardEtudiants;