// // retard.tsx
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
// import { Picker } from '@react-native-picker/picker'; // Pour les sélecteurs de ligne/station
// import * as Location from 'expo-location'; // Pour la géolocalisation
// import { Ionicons } from '@expo/vector-icons';
// import authService from '@/services/authService'; // Pour l'authentification
// import { router } from 'expo-router';
// import Constants from 'expo-constants'; // Pour l'URL du backend
// import {
//     LigneTransport,
//     LocationObject,
//     NavitiaDisruption,
//     NavitiaApiResponse,
// } from '@/types'; // Importez vos types


// // URL de base de votre backend (depuis expo-constants)
// const backendBaseUrl = Constants.expoConfig?.extra?.backendBaseUrl; // Assurez-vous que c'est bien configuré dans app.config.ts

// export default function RetardEtudiants() {
//     const [transportMode, setTransportMode] = useState<string | null>(null); // 'metro', 'rer', 'bus', 'tram'
//     const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
//     const [availableLines, setAvailableLines] = useState<LigneTransport[]>([]);
//     const [selectedStopPoint, setSelectedStopPoint] = useState<any | null>(null); // Type plus précis à définir si nécessaire pour les stations
//     const [availableStopPoints, setAvailableStopPoints] = useState<any[]>([]); // Liste des stations pour la ligne sélectionnée

//     const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
//     const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
//     const [isLocationLoading, setIsLocationLoading] = useState(false);

//     const [navitiaDisruptions, setNavitiaDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [isNavitiaLoading, setIsNavitiaLoading] = useState(false);
//     const [navitiaErrorMsg, setNavitiaErrorMsg] = useState<string | null>(null);

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [submitError, setSubmitError] = useState<string | null>(null);

//     // --- EFFET POUR OBTENIR LA LOCALISATION AU CHARGEMENT ---
//     useEffect(() => {
//         (async () => {
//             setIsLocationLoading(true);
//             let { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== 'granted') {
//                 setLocationErrorMsg('Permission d\'accès à la localisation refusée.');
//                 setIsLocationLoading(false);
//                 Alert.alert(
//                     'Localisation requise',
//                     'Pour créer un ticket de retard, nous avons besoin de votre position actuelle pour vérifier les informations trafic.'
//                 );
//                 return;
//             }

//             try {
//                 let location = await Location.getCurrentPositionAsync({});
//                 setUserLocation(location);
//                 setLocationErrorMsg(null);
//                 console.log("Localisation de l'utilisateur :", location.coords);
//             } catch (error) {
//                 console.error("Erreur lors de la récupération de la localisation :", error);
//                 setLocationErrorMsg('Impossible de récupérer votre position actuelle.');
//             } finally {
//                 setIsLocationLoading(false);
//             }
//         })();
//     }, []);

//     // --- EFFET POUR CHARGER LES LIGNES DE TRANSPORT ---
//     useEffect(() => {
//         const fetchTransportLines = async () => {
//             if (!transportMode) return;
//             try {
//                 // Ici, vous devriez appeler votre API backend pour récupérer les lignes
//                 // Exemple : GET /api/transport-lines?mode=metro
//                 // Pour l'instant, je vais simuler des données ou utiliser ce que vous avez déjà.
//                 // Si vous avez un endpoint pour les lignes par mode, utilisez-le.
//                 // Sinon, il faudra adapter.

//                 // Pour l'exemple, nous allons utiliser une simple simulation:
//                 // REMPLACER PAR VOTRE LOGIQUE RÉELLE D'APPEL API POUR LES LIGNES
//                 const lines: LigneTransport[] = [
//                     { id_line: 'line_rer:C', shortname_line: 'C', name_line: 'RER C', colourweb_hexa: '003A76', textcolourweb_hexa: 'FFFFFF', transportmode: 'rail', operatorname: 'SNCF' },
//                     { id_line: 'line_metro:1', shortname_line: '1', name_line: 'Métro 1', colourweb_hexa: 'FFC600', textcolourweb_hexa: '000000', transportmode: 'metro', operatorname: 'RATP' },
//                     { id_line: 'line_bus:20', shortname_line: '20', name_line: 'Bus 20', colourweb_hexa: 'E40033', textcolourweb_hexa: 'FFFFFF', transportmode: 'bus', operatorname: 'RATP' },
//                 ].filter(line => line.transportmode === transportMode);

//                 setAvailableLines(lines);
//                 setSelectedLine(null); // Réinitialiser la ligne sélectionnée
//                 setAvailableStopPoints([]); // Réinitialiser les points d'arrêt
//                 setSelectedStopPoint(null); // Réinitialiser la station
//             } catch (error) {
//                 console.error("Erreur lors du chargement des lignes :", error);
//                 Alert.alert("Erreur", "Impossible de charger les lignes de transport.");
//             }
//         };
//         fetchTransportLines();
//     }, [transportMode]);


//     // --- EFFET POUR CHARGER LES POINTS D'ARRÊT (STATIONS) DE LA LIGNE SÉLECTIONNÉE ---
//     useEffect(() => {
//         const fetchStopPoints = async () => {
//             if (!selectedLine) {
//                 setAvailableStopPoints([]);
//                 setSelectedStopPoint(null);
//                 return;
//             }
//             try {
//                 // IMPORTANT: L'API Navitia ne fournit pas directement les "stop_points" pour une ligne spécifique
//                 // via l'endpoint /disruptions. Il faudrait un autre endpoint (ex: /lines/{id}/stop_points)
//                 // ou un appel à une autre API.
//                 // Pour le moment, je vais simuler des points d'arrêt.
//                 // REMPLACER PAR VOTRE LOGIQUE RÉELLE D'APPEL API POUR LES STATIONS
//                 const stopPoints: any[] = [ // Utiliser un type plus précis si vous en avez un
//                     { id: 'stop_point:1', name: 'Gare de Lyon', coord: { lat: 48.845, lon: 2.374 } },
//                     { id: 'stop_point:2', name: 'Chatelet', coord: { lat: 48.859, lon: 2.347 } },
//                 ];
//                 setAvailableStopPoints(stopPoints);
//                 setSelectedStopPoint(null);
//             } catch (error) {
//                 console.error("Erreur lors du chargement des points d'arrêt :", error);
//                 Alert.alert("Erreur", "Impossible de charger les stations pour cette ligne.");
//             }
//         };
//         fetchStopPoints();
//     }, [selectedLine]);


//     // --- FONCTION POUR RÉCUPÉRER LES PERTURBATIONS NAVITIA ---
//     const fetchNavitiaData = useCallback(async () => {
//         setIsNavitiaLoading(true);
//         setNavitiaErrorMsg(null);
//         try {
//             const token = await authService.getToken();
//             if (!token) {
//                 setNavitiaErrorMsg('Non authentifié.');
//                 authService.logout();
//                 return;
//             }

//             const response = await fetch(`${backendBaseUrl}/api/navitia/disruptions`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Échec de la récupération des perturbations Navitia.');
//             }

//             const data: NavitiaApiResponse = await response.json();
//             setNavitiaDisruptions(data.disruptions);
//             console.log("Perturbations Navitia reçues :", data.disruptions.length);

//         } catch (error: any) {
//             console.error("Erreur Navitia :", error);
//             setNavitiaErrorMsg(error.message || "Impossible de récupérer les données trafic.");
//         } finally {
//             setIsNavitiaLoading(false);
//         }
//     }, []);

//     // Déclencher la récupération des données Navitia une fois la localisation obtenue ou à l'entrée
//     useEffect(() => {
//         if (userLocation) {
//             fetchNavitiaData();
//         }
//     }, [userLocation, fetchNavitiaData]); // Déclenche après la localisation


//     // --- LOGIQUE DE VALIDATION DU TICKET ---
//     const validateAndSubmitTicket = async () => {
//         if (isSubmitting) return;

//         if (!userLocation) {
//             Alert.alert("Erreur", "Localisation requise pour la validation du ticket.");
//             return;
//         }
//         if (!selectedLine || !selectedStopPoint) {
//             Alert.alert("Erreur", "Veuillez sélectionner le mode de transport, la ligne et la station.");
//             return;
//         }

//         setIsSubmitting(true);
//         setSubmitError(null);

//         try {
//             // 1. Vérification de la localisation par rapport à la station
//             const stationLat = selectedStopPoint.coord.lat;
//             const stationLon = selectedStopPoint.coord.lon;
//             const userLat = userLocation.coords.latitude;
//             const userLon = userLocation.coords.longitude;

//             // Calcul de la distance (approximative) en km entre l'utilisateur et la station
//             const R = 6371; // Rayon de la Terre en km
//             const dLat = (stationLat - userLat) * Math.PI / 180;
//             const dLon = (stationLon - userLon) * Math.PI / 180;
//             const a =
//                 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                 Math.cos(userLat * Math.PI / 180) * Math.cos(stationLat * Math.PI / 180) *
//                 Math.sin(dLon / 2) * Math.sin(dLon / 2);
//             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//             const distance = R * c; // Distance en km

//             const MAX_DISTANCE_KM = 0.5; // Max 500 mètres de la station
//             if (distance > MAX_DISTANCE_KM) {
//                 Alert.alert(
//                     "Localisation non concordante",
//                     `Vous semblez être à ${distance.toFixed(2)} km de la station ${selectedStopPoint.name}. Vous devez être à moins de ${MAX_DISTANCE_KM} km.`
//                 );
//                 setIsSubmitting(false);
//                 return;
//             }

//             // 2. Vérification des perturbations Navitia
//             const relevantDisruption = navitiaDisruptions.find(disruption => {
//                 // Vérifier si la perturbation affecte la ligne ou la station sélectionnée
//                 // et si elle est active actuellement
//                 const isLineAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.line?.id === selectedLine.id_line ||
//                     obj.pt_object.line?.code === selectedLine.shortname_line // Parfois les codes sont utilisés aussi
//                 );
//                 const isStopPointAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.stop_point?.id === selectedStopPoint.id
//                 );

//                 const isCurrentlyActive = disruption.application_periods.some(period => {
//                     const begin = new Date(period.begin);
//                     const end = period.end ? new Date(period.end) : new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // Si pas de fin, considère valide pour 24h
//                     const now = new Date();
//                     return now >= begin && now <= end;
//                 });

//                 // On cherche une perturbation active qui affecte la ligne ou la station ET qui est un "retard" ou "service réduit"
//                 const isDelayOrReducedService = ['SIGNIFICANT_DELAY', 'REDUCED_SERVICE', 'NO_SERVICE'].includes(disruption.severity.effect);


//                 return (isLineAffected || isStopPointAffected) && isCurrentlyActive && isDelayOrReducedService;
//             });


//             if (!relevantDisruption) {
//                 Alert.alert(
//                     "Pas de perturbation officielle",
//                     "Aucune perturbation significative ou retard n'est actuellement signalée pour cette ligne et/ou station."
//                 );
//                 setIsSubmitting(false);
//                 return;
//             }

//             // Si toutes les vérifications passent, soumettre le ticket de retard
//             const token = await authService.getToken();
//             if (!token) {
//                 setSubmitError('Non authentifié.');
//                 authService.logout();
//                 return;
//             }

//             const newDelayTicket = {
//                 type: 'Retard', // Type fixe pour les tickets de retard
//                 description: `Retard constaté sur la ligne ${selectedLine.name_line} (${selectedLine.shortname_line}) à la station ${selectedStopPoint.name}.`,
//                 transportLine: {
//                     id_line: selectedLine.id_line,
//                     name_line: selectedLine.name_line,
//                     transportmode: selectedLine.transportmode,
//                     shortname_line: selectedLine.shortname_line,
//                 },
//                 location: {
//                     latitude: userLocation.coords.latitude,
//                     longitude: userLocation.coords.longitude,
//                     accuracy: userLocation.coords.accuracy,
//                 },
//                 // Vous pouvez ajouter d'autres détails de la perturbation trouvée
//                 disruptionId: relevantDisruption.id,
//                 disruptionSeverity: relevantDisruption.severity.name,
//                 disruptionMessage: relevantDisruption.messages[0]?.text || "Pas de message spécifique",
//                 // On peut aussi stocker l'heure de début de la perturbation pour le justificatif
//                 disruptionStartTime: relevantDisruption.application_periods[0]?.begin,
//             };

//             const response = await fetch(`${backendBaseUrl}/api/tickets`, { // Réutiliser votre endpoint de création de ticket
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(newDelayTicket),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || "Échec de la création du ticket de retard.");
//             }

//             Alert.alert("Succès", "Votre ticket de retard a été créé avec succès et est en attente de validation finale.");
//             router.push('/tickets'); // Rediriger l'utilisateur vers la liste des tickets
//         } catch (error: any) {
//             console.error("Erreur lors de la soumission du ticket de retard :", error);
//             setSubmitError(error.message || "Une erreur inattendue est survenue.");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };


//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.arrierePlan}>
//                 <View style={styles.formeDecorative1} />
//                 <View style={styles.formeDecorative2} />
//                 <ScrollView contentContainerStyle={styles.scrollContent}>
//                     <View style={styles.header}>
//                         <Text style={styles.title}>Ticket de Retard Étudiant</Text>
//                         <Text style={styles.subtitle}>Créez un justificatif</Text>
//                     </View>

//                     {/* Section de localisation */}
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>1. Votre position actuelle</Text>
//                         {isLocationLoading ? (
//                             <ActivityIndicator size="small" color="#0EA5E9" />
//                         ) : userLocation ? (
//                             <Text style={styles.infoText}>Localisation obtenue: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}</Text>
//                         ) : (
//                             <Text style={styles.errorText}>{locationErrorMsg || "Localisation non disponible."}</Text>
//                         )}
//                         {locationErrorMsg && (
//                             <TouchableOpacity onPress={() => Location.requestForegroundPermissionsAsync().then(() => Location.getCurrentPositionAsync({}).then(setUserLocation))} style={styles.retryButton}>
//                                 <Text style={styles.retryButtonText}>Réessayer la localisation</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>

//                     {/* Sélection du mode de transport */}
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>2. Mode de transport</Text>
//                         <Picker
//                             selectedValue={transportMode}
//                             onValueChange={(itemValue) => {
//                                 setTransportMode(itemValue);
//                             }}
//                             style={styles.picker}
//                             itemStyle={styles.pickerItem}
//                         >
//                             <Picker.Item label="Sélectionner un mode" value={null} />
//                             <Picker.Item label="Métro" value="metro" />
//                             <Picker.Item label="RER / Train" value="rail" />
//                             <Picker.Item label="Bus" value="bus" />
//                             <Picker.Item label="Tramway" value="tram" />
//                         </Picker>
//                     </View>

//                     {/* Sélection de la ligne */}
//                     {transportMode && (
//                         <View style={styles.section}>
//                             <Text style={styles.sectionTitle}>3. Ligne concernée</Text>
//                             <Picker
//                                 selectedValue={selectedLine ? selectedLine.id_line : null}
//                                 onValueChange={(itemValue) => {
//                                     setSelectedLine(availableLines.find(line => line.id_line === itemValue) || null);
//                                 }}
//                                 style={styles.picker}
//                                 itemStyle={styles.pickerItem}
//                             >
//                                 <Picker.Item label="Sélectionner une ligne" value={null} />
//                                 {availableLines.map(line => (
//                                     <Picker.Item
//                                         key={line.id_line}
//                                         label={`${line.shortname_line || line.name_line} (${getDisplayTransportMode(line.transportmode, line.name_line)})`}
//                                         value={line.id_line}
//                                     />
//                                 ))}
//                             </Picker>
//                         </View>
//                     )}

//                     {/* Sélection de la station */}
//                     {selectedLine && (
//                         <View style={styles.section}>
//                             <Text style={styles.sectionTitle}>4. Station de l'incident</Text>
//                             <Picker
//                                 selectedValue={selectedStopPoint ? selectedStopPoint.id : null}
//                                 onValueChange={(itemValue) => {
//                                     setSelectedStopPoint(availableStopPoints.find(stop => stop.id === itemValue) || null);
//                                 }}
//                                 style={styles.picker}
//                                 itemStyle={styles.pickerItem}
//                             >
//                                 <Picker.Item label="Sélectionner une station" value={null} />
//                                 {availableStopPoints.map(stop => (
//                                     <Picker.Item key={stop.id} label={stop.name} value={stop.id} />
//                                 ))}
//                             </Picker>
//                         </View>
//                     )}

//                     {/* Informations trafic Navitia */}
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>5. Vérification du trafic actuel</Text>
//                         {isNavitiaLoading ? (
//                             <ActivityIndicator size="small" color="#0EA5E9" />
//                         ) : navitiaErrorMsg ? (
//                             <Text style={styles.errorText}>{navitiaErrorMsg}</Text>
//                         ) : navitiaDisruptions.length > 0 ? (
//                             <View>
//                                 <Text style={styles.infoText}>
//                                     <Ionicons name="information-circle" size={16} color="#10B981" /> Des perturbations sont actuellement signalées.
//                                 </Text>
//                                 {/* Vous pouvez afficher plus de détails ici si vous voulez */}
//                             </View>
//                         ) : (
//                             <Text style={styles.infoText}>
//                                 <Ionicons name="checkmark-circle" size={16} color="#64748B" /> Aucune perturbation majeure signalée par l'API IDF Mobilités.
//                             </Text>
//                         )}
//                         <TouchableOpacity onPress={fetchNavitiaData} style={styles.smallButton}>
//                             <Text style={styles.smallButtonText}>Rafraîchir les données trafic</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Bouton de soumission */}
//                     <TouchableOpacity
//                         style={[styles.submitButton, (isSubmitting || !userLocation || !selectedLine || !selectedStopPoint) && styles.submitButtonDisabled]}
//                         onPress={validateAndSubmitTicket}
//                         disabled={isSubmitting || !userLocation || !selectedLine || !selectedStopPoint}
//                     >
//                         {isSubmitting ? (
//                             <ActivityIndicator color="white" />
//                         ) : (
//                             <Text style={styles.submitButtonText}>Demander mon justificatif de retard</Text>
//                         )}
//                     </TouchableOpacity>

//                     {submitError && <Text style={styles.errorText}>{submitError}</Text>}
//                 </ScrollView>
//             </View>
//         </SafeAreaView>
//     );
// }

// // Fonction utilitaire pour le mode de transport (peut être déplacée dans un fichier utils si réutilisée)
// const getDisplayTransportMode = (apiMode: string, lineName: string): string => {
//     switch (apiMode.toLowerCase()) {
//         case 'rail':
//             return 'RER';
//         case 'metro':
//             return 'Métro';
//         case 'bus':
//             return 'Bus';
//         case 'tram':
//             return 'Tramway';
//         default:
//             return apiMode;
//     }
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#0F172A',
//     },
//     arrierePlan: {
//         flex: 1,
//         position: 'relative',
//     },
//     formeDecorative1: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         height: 300,
//         backgroundColor: '#0EA5E9', // Revert to solid color for simplicity, linear-gradient needs more setup
//         borderBottomLeftRadius: 50,
//         borderBottomRightRadius: 50,
//         opacity: 0.9,
//     },
//     formeDecorative2: {
//         position: 'absolute',
//         top: 80,
//         right: -50,
//         width: 200,
//         height: 200,
//         borderRadius: 100,
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     },
//     scrollContent: {
//         paddingHorizontal: 16,
//         paddingBottom: 40,
//         paddingTop: Platform.OS === 'android' ? 24 : 0, // Add padding for Android status bar
//     },
//     header: {
//         paddingVertical: 24,
//         alignItems: 'center',
//     },
//     title: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         color: 'white',
//         marginBottom: 8,
//         textAlign: 'center',
//     },
//     subtitle: {
//         fontSize: 15,
//         color: 'rgba(255, 255, 255, 0.8)',
//         textAlign: 'center',
//     },
//     section: {
//         backgroundColor: 'white',
//         borderRadius: 8,
//         padding: 16,
//         marginBottom: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#1F2937',
//         marginBottom: 10,
//     },
//     picker: {
//         width: '100%',
//         backgroundColor: '#F3F4F6',
//         borderRadius: 8,
//         marginBottom: 10,
//         color: '#1F2937', // Couleur du texte par défaut du Picker
//     },
//     pickerItem: {
//         color: '#1F2937', // Couleur des éléments du Picker
//     },
//     infoText: {
//         fontSize: 14,
//         color: '#374151',
//         marginBottom: 5,
//     },
//     errorText: {
//         fontSize: 14,
//         color: '#DC2626',
//         marginBottom: 10,
//         textAlign: 'center',
//     },
//     retryButton: {
//         backgroundColor: '#6B7280',
//         padding: 10,
//         borderRadius: 5,
//         alignItems: 'center',
//         marginTop: 10,
//     },
//     retryButtonText: {
//         color: 'white',
//         fontWeight: 'bold',
//     },
//     smallButton: {
//         backgroundColor: '#0EA5E9',
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 5,
//         alignSelf: 'flex-start',
//         marginTop: 10,
//     },
//     smallButtonText: {
//         color: 'white',
//         fontSize: 13,
//         fontWeight: 'bold',
//     },
//     submitButton: {
//         backgroundColor: '#10B981',
//         padding: 15,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginTop: 20,
//     },
//     submitButtonDisabled: {
//         backgroundColor: '#6EE7B7',
//     },
//     submitButtonText: {
//         color: 'white',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
// });


// retard.tsx
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
import Constants from 'expo-constants';
import {
    LigneTransport,
    LocationObject,
    NavitiaDisruption,
    NavitiaApiResponse,
} from '@/types';

// URL de base de votre backend
const backendBaseUrl = Constants.expoConfig?.extra?.backendBaseUrl;

// Interface pour les réponses de l'API IDF Mobilités
interface IDFMobiliteResponse {
    total_count: number;
    results: LigneTransport[];
}

export default function RetardEtudiants() {
    const [transportMode, setTransportMode] = useState<string | null>(null);
    const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
    const [availableLines, setAvailableLines] = useState<LigneTransport[]>([]);
    const [selectedStopPoint, setSelectedStopPoint] = useState<any | null>(null);
    const [availableStopPoints, setAvailableStopPoints] = useState<any[]>([]);
    const [isLoadingLines, setIsLoadingLines] = useState(false);
    const [linesError, setLinesError] = useState<string | null>(null);

    const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
    const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const [navitiaDisruptions, setNavitiaDisruptions] = useState<NavitiaDisruption[]>([]);
    const [isNavitiaLoading, setIsNavitiaLoading] = useState(false);
    const [navitiaErrorMsg, setNavitiaErrorMsg] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Mapping des modes de transport pour l'API IDF Mobilités
    const transportModeMapping = {
        'metro': 'Metro',
        'rail': 'RER',
        'bus': 'Bus',
        'tram': 'Tramway'
    };

    // --- EFFET POUR OBTENIR LA LOCALISATION AU CHARGEMENT ---
    useEffect(() => {
        (async () => {
            setIsLocationLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationErrorMsg('Permission d\'accès à la localisation refusée.');
                setIsLocationLoading(false);
                Alert.alert(
                    'Localisation requise',
                    'Pour créer un ticket de retard, nous avons besoin de votre position actuelle pour vérifier les informations trafic.'
                );
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
                setLocationErrorMsg(null);
                console.log("Localisation de l'utilisateur :", location.coords);
            } catch (error) {
                console.error("Erreur lors de la récupération de la localisation :", error);
                setLocationErrorMsg('Impossible de récupérer votre position actuelle.');
            } finally {
                setIsLocationLoading(false);
            }
        })();
    }, []);

    // --- FONCTION POUR RÉCUPÉRER LES LIGNES DEPUIS L'API IDF MOBILITÉS ---
    const fetchTransportLines = useCallback(async (mode: string) => {
        setIsLoadingLines(true);
        setLinesError(null);
        
        try {
            // Créer le filtre pour l'API IDF Mobilités
            const transportModeFilter = transportModeMapping[mode as keyof typeof transportModeMapping];
            const filtre = `transportmode="${transportModeFilter}"`;
            
            const url = `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/records?where=${encodeURIComponent(filtre)}&select=id_line,shortname_line,name_line,colourweb_hexa,textcolourweb_hexa,transportmode,operatorname&limit=100`;
            
            console.log("URL de l'API IDF Mobilités :", url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data: IDFMobiliteResponse = await response.json();
            
            console.log(`Lignes récupérées pour ${mode}:`, data.results.length);
            
            // Transformer les données pour correspondre à votre interface LigneTransport
            const transformedLines: LigneTransport[] = data.results.map(line => ({
                id_line: line.id_line,
                shortname_line: line.shortname_line,
                name_line: line.name_line,
                colourweb_hexa: line.colourweb_hexa,
                textcolourweb_hexa: line.textcolourweb_hexa,
                transportmode: mode, // Utiliser le mode sélectionné par l'utilisateur
                operatorname: line.operatorname
            }));
            
            setAvailableLines(transformedLines);
            setSelectedLine(null);
            setAvailableStopPoints([]);
            setSelectedStopPoint(null);
            
        } catch (error: any) {
            console.error("Erreur lors du chargement des lignes :", error);
            setLinesError(error.message || "Impossible de charger les lignes de transport.");
            setAvailableLines([]);
        } finally {
            setIsLoadingLines(false);
        }
    }, []);

    // --- EFFET POUR CHARGER LES LIGNES DE TRANSPORT ---
    useEffect(() => {
        if (transportMode) {
            fetchTransportLines(transportMode);
        } else {
            setAvailableLines([]);
            setSelectedLine(null);
            setAvailableStopPoints([]);
            setSelectedStopPoint(null);
        }
    }, [transportMode, fetchTransportLines]);

    // --- EFFET POUR CHARGER LES POINTS D'ARRÊT (STATIONS) DE LA LIGNE SÉLECTIONNÉE ---
    useEffect(() => {
        const fetchStopPoints = async () => {
            if (!selectedLine) {
                setAvailableStopPoints([]);
                setSelectedStopPoint(null);
                return;
            }
            
            try {
                // Pour le moment, simulation des points d'arrêt
                // Vous pouvez intégrer une autre API pour récupérer les vraies stations
                const stopPoints: any[] = [
                    { id: 'stop_point:1', name: 'Gare de Lyon', coord: { lat: 48.845, lon: 2.374 } },
                    { id: 'stop_point:2', name: 'Chatelet', coord: { lat: 48.859, lon: 2.347 } },
                    { id: 'stop_point:3', name: 'République', coord: { lat: 48.867, lon: 2.363 } },
                    { id: 'stop_point:4', name: 'Bastille', coord: { lat: 48.853, lon: 2.369 } },
                ];
                
                setAvailableStopPoints(stopPoints);
                setSelectedStopPoint(null);
            } catch (error) {
                console.error("Erreur lors du chargement des points d'arrêt :", error);
                Alert.alert("Erreur", "Impossible de charger les stations pour cette ligne.");
            }
        };
        
        fetchStopPoints();
    }, [selectedLine]);

    // --- FONCTION POUR RÉCUPÉRER LES PERTURBATIONS NAVITIA ---
    const fetchNavitiaData = useCallback(async () => {
        setIsNavitiaLoading(true);
        setNavitiaErrorMsg(null);
        
        try {
            const token = await authService.getToken();
            if (!token) {
                setNavitiaErrorMsg('Non authentifié.');
                authService.logout();
                return;
            }

            const response = await fetch(`${backendBaseUrl}/api/navitia/disruptions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Échec de la récupération des perturbations Navitia.');
            }

            const data: NavitiaApiResponse = await response.json();
            setNavitiaDisruptions(data.disruptions);
            console.log("Perturbations Navitia reçues :", data.disruptions.length);

        } catch (error: any) {
            console.error("Erreur Navitia :", error);
            setNavitiaErrorMsg(error.message || "Impossible de récupérer les données trafic.");
        } finally {
            setIsNavitiaLoading(false);
        }
    }, []);

    // Déclencher la récupération des données Navitia une fois la localisation obtenue
    useEffect(() => {
        if (userLocation) {
            fetchNavitiaData();
        }
    }, [userLocation, fetchNavitiaData]);

    // --- LOGIQUE DE VALIDATION DU TICKET ---
    const validateAndSubmitTicket = async () => {
        if (isSubmitting) return;

        if (!userLocation) {
            Alert.alert("Erreur", "Localisation requise pour la validation du ticket.");
            return;
        }
        if (!selectedLine || !selectedStopPoint) {
            Alert.alert("Erreur", "Veuillez sélectionner le mode de transport, la ligne et la station.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // 1. Vérification de la localisation par rapport à la station
            const stationLat = selectedStopPoint.coord.lat;
            const stationLon = selectedStopPoint.coord.lon;
            const userLat = userLocation.coords.latitude;
            const userLon = userLocation.coords.longitude;

            // Calcul de la distance (approximative) en km entre l'utilisateur et la station
            const R = 6371; // Rayon de la Terre en km
            const dLat = (stationLat - userLat) * Math.PI / 180;
            const dLon = (stationLon - userLon) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(stationLat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance en km

            const MAX_DISTANCE_KM = 0.5; // Max 500 mètres de la station
            if (distance > MAX_DISTANCE_KM) {
                Alert.alert(
                    "Localisation non concordante",
                    `Vous semblez être à ${distance.toFixed(2)} km de la station ${selectedStopPoint.name}. Vous devez être à moins de ${MAX_DISTANCE_KM} km.`
                );
                setIsSubmitting(false);
                return;
            }

            // 2. Vérification des perturbations Navitia
            const relevantDisruption = navitiaDisruptions.find(disruption => {
                const isLineAffected = disruption.affected_objects.some(obj =>
                    obj.pt_object.line?.id === selectedLine.id_line ||
                    obj.pt_object.line?.code === selectedLine.shortname_line
                );
                const isStopPointAffected = disruption.affected_objects.some(obj =>
                    obj.pt_object.stop_point?.id === selectedStopPoint.id
                );

                const isCurrentlyActive = disruption.application_periods.some(period => {
                    const begin = new Date(period.begin);
                    const end = period.end ? new Date(period.end) : new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
                    const now = new Date();
                    return now >= begin && now <= end;
                });

                const isDelayOrReducedService = ['SIGNIFICANT_DELAY', 'REDUCED_SERVICE', 'NO_SERVICE'].includes(disruption.severity.effect);

                return (isLineAffected || isStopPointAffected) && isCurrentlyActive && isDelayOrReducedService;
            });

            if (!relevantDisruption) {
                Alert.alert(
                    "Pas de perturbation officielle",
                    "Aucune perturbation significative ou retard n'est actuellement signalée pour cette ligne et/ou station."
                );
                setIsSubmitting(false);
                return;
            }

            // Si toutes les vérifications passent, soumettre le ticket de retard
            const token = await authService.getToken();
            if (!token) {
                setSubmitError('Non authentifié.');
                authService.logout();
                return;
            }

            const newDelayTicket = {
                type: 'Retard',
                description: `Retard constaté sur la ligne ${selectedLine.name_line} (${selectedLine.shortname_line}) à la station ${selectedStopPoint.name}.`,
                transportLine: {
                    id_line: selectedLine.id_line,
                    name_line: selectedLine.name_line,
                    transportmode: selectedLine.transportmode,
                    shortname_line: selectedLine.shortname_line,
                },
                location: {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    accuracy: userLocation.coords.accuracy,
                },
                disruptionId: relevantDisruption.id,
                disruptionSeverity: relevantDisruption.severity.name,
                disruptionMessage: relevantDisruption.messages[0]?.text || "Pas de message spécifique",
                disruptionStartTime: relevantDisruption.application_periods[0]?.begin,
            };

            const response = await fetch(`${backendBaseUrl}/api/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newDelayTicket),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Échec de la création du ticket de retard.");
            }

            Alert.alert("Succès", "Votre ticket de retard a été créé avec succès et est en attente de validation finale.");
            router.push('/tickets');
        } catch (error: any) {
            console.error("Erreur lors de la soumission du ticket de retard :", error);
            setSubmitError(error.message || "Une erreur inattendue est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.arrierePlan}>
                <View style={styles.formeDecorative1} />
                <View style={styles.formeDecorative2} />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Ticket de Retard Étudiant</Text>
                        <Text style={styles.subtitle}>Créez un justificatif</Text>
                    </View>

                    {/* Section de localisation */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Votre position actuelle</Text>
                        {isLocationLoading ? (
                            <ActivityIndicator size="small" color="#0EA5E9" />
                        ) : userLocation ? (
                            <Text style={styles.infoText}>
                                Localisation obtenue: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
                            </Text>
                        ) : (
                            <Text style={styles.errorText}>{locationErrorMsg || "Localisation non disponible."}</Text>
                        )}
                        {locationErrorMsg && (
                            <TouchableOpacity 
                                onPress={() => Location.requestForegroundPermissionsAsync().then(() => Location.getCurrentPositionAsync({}).then(setUserLocation))} 
                                style={styles.retryButton}
                            >
                                <Text style={styles.retryButtonText}>Réessayer la localisation</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Sélection du mode de transport */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Mode de transport</Text>
                        <Picker
                            selectedValue={transportMode}
                            onValueChange={(itemValue) => setTransportMode(itemValue)}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                        >
                            <Picker.Item label="Sélectionner un mode" value={null} />
                            <Picker.Item label="Métro" value="metro" />
                            <Picker.Item label="RER / Train" value="rail" />
                            <Picker.Item label="Bus" value="bus" />
                            <Picker.Item label="Tramway" value="tram" />
                        </Picker>
                    </View>

                    {/* Sélection de la ligne */}
                    {transportMode && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>3. Ligne concernée</Text>
                            {isLoadingLines ? (
                                <ActivityIndicator size="small" color="#0EA5E9" />
                            ) : linesError ? (
                                <View>
                                    <Text style={styles.errorText}>{linesError}</Text>
                                    <TouchableOpacity 
                                        onPress={() => fetchTransportLines(transportMode)} 
                                        style={styles.retryButton}
                                    >
                                        <Text style={styles.retryButtonText}>Réessayer</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Picker
                                    selectedValue={selectedLine ? selectedLine.id_line : null}
                                    onValueChange={(itemValue) => {
                                        setSelectedLine(availableLines.find(line => line.id_line === itemValue) || null);
                                    }}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                >
                                    <Picker.Item label="Sélectionner une ligne" value={null} />
                                    {availableLines.map(line => (
                                        <Picker.Item
                                            key={line.id_line}
                                            label={`${line.shortname_line || line.name_line} (${getDisplayTransportMode(line.transportmode, line.name_line)})`}
                                            value={line.id_line}
                                        />
                                    ))}
                                </Picker>
                            )}
                        </View>
                    )}

                    {/* Sélection de la station */}
                    {selectedLine && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>4. Station de l'incident</Text>
                            <Picker
                                selectedValue={selectedStopPoint ? selectedStopPoint.id : null}
                                onValueChange={(itemValue) => {
                                    setSelectedStopPoint(availableStopPoints.find(stop => stop.id === itemValue) || null);
                                }}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label="Sélectionner une station" value={null} />
                                {availableStopPoints.map(stop => (
                                    <Picker.Item key={stop.id} label={stop.name} value={stop.id} />
                                ))}
                            </Picker>
                        </View>
                    )}

                    {/* Informations trafic Navitia */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. Vérification du trafic actuel</Text>
                        {isNavitiaLoading ? (
                            <ActivityIndicator size="small" color="#0EA5E9" />
                        ) : navitiaErrorMsg ? (
                            <Text style={styles.errorText}>{navitiaErrorMsg}</Text>
                        ) : navitiaDisruptions.length > 0 ? (
                            <View>
                                <Text style={styles.infoText}>
                                    <Ionicons name="information-circle" size={16} color="#10B981" /> Des perturbations sont actuellement signalées.
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.infoText}>
                                <Ionicons name="checkmark-circle" size={16} color="#64748B" /> Aucune perturbation majeure signalée par l'API IDF Mobilités.
                            </Text>
                        )}
                        <TouchableOpacity onPress={fetchNavitiaData} style={styles.smallButton}>
                            <Text style={styles.smallButtonText}>Rafraîchir les données trafic</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bouton de soumission */}
                    <TouchableOpacity
                        style={[styles.submitButton, (isSubmitting || !userLocation || !selectedLine || !selectedStopPoint) && styles.submitButtonDisabled]}
                        onPress={validateAndSubmitTicket}
                        disabled={isSubmitting || !userLocation || !selectedLine || !selectedStopPoint}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Demander mon justificatif de retard</Text>
                        )}
                    </TouchableOpacity>

                    {submitError && <Text style={styles.errorText}>{submitError}</Text>}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

// Fonction utilitaire pour le mode de transport
const getDisplayTransportMode = (apiMode: string, lineName: string): string => {
    switch (apiMode.toLowerCase()) {
        case 'rail':
            return 'RER';
        case 'metro':
            return 'Métro';
        case 'bus':
            return 'Bus';
        case 'tram':
            return 'Tramway';
        default:
            return apiMode;
    }
};

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
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    header: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
    },
    picker: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 10,
        color: '#1F2937',
    },
    pickerItem: {
        color: '#1F2937',
    },
    infoText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 5,
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        marginBottom: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#6B7280',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    smallButton: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    smallButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#10B981',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#6EE7B7',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
