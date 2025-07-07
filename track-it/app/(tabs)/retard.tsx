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
// import Constants from 'expo-constants';
// import {
//     LigneTransport,
//     LocationObject,
//     NavitiaDisruption,
//     NavitiaApiResponse,
// } from '../../frontend/src/types';

// // URL de base de votre backend
// const backendBaseUrl = Constants.expoConfig?.extra?.backendBaseUrl;

// // Interface pour les réponses de l'API IDF Mobilités
// interface IDFMobiliteResponse {
//     total_count: number;
//     results: LigneTransport[];
// }

// export default function RetardEtudiants() {
//     const [transportMode, setTransportMode] = useState<string | null>(null);
//     const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
//     const [availableLines, setAvailableLines] = useState<LigneTransport[]>([]);
//     const [selectedStopPoint, setSelectedStopPoint] = useState<any | null>(null);
//     const [availableStopPoints, setAvailableStopPoints] = useState<any[]>([]);
//     const [isLoadingLines, setIsLoadingLines] = useState(false);
//     const [linesError, setLinesError] = useState<string | null>(null);

//     const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
//     const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
//     const [isLocationLoading, setIsLocationLoading] = useState(false);

//     const [navitiaDisruptions, setNavitiaDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [isNavitiaLoading, setIsNavitiaLoading] = useState(false);
//     const [navitiaErrorMsg, setNavitiaErrorMsg] = useState<string | null>(null);

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [submitError, setSubmitError] = useState<string | null>(null);

//     // Mapping des modes de transport pour l'API IDF Mobilités
//     const transportModeMapping = {
//         'metro': 'Metro',
//         'rail': 'RER',
//         'bus': 'Bus',
//         'tram': 'Tramway'
//     };

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

//     // --- FONCTION POUR RÉCUPÉRER LES LIGNES DEPUIS L'API IDF MOBILITÉS ---
//     const fetchTransportLines = useCallback(async (mode: string) => {
//         setIsLoadingLines(true);
//         setLinesError(null);
        
//         try {
//             // Créer le filtre pour l'API IDF Mobilités
//             const transportModeFilter = transportModeMapping[mode as keyof typeof transportModeMapping];
//             const filtre = `transportmode="${transportModeFilter}"`;
            
//             const url = `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/records?where=${encodeURIComponent(filtre)}&select=id_line,shortname_line,name_line,colourweb_hexa,textcolourweb_hexa,transportmode,operatorname&limit=100`;
            
//             console.log("URL de l'API IDF Mobilités :", url);
            
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
//             }
            
//             const data: IDFMobiliteResponse = await response.json();
            
//             console.log(`Lignes récupérées pour ${mode}:`, data.results.length);
            
//             // Transformer les données pour correspondre à votre interface LigneTransport
//             const transformedLines: LigneTransport[] = data.results.map(line => ({
//                 id_line: line.id_line,
//                 shortname_line: line.shortname_line,
//                 name_line: line.name_line,
//                 colourweb_hexa: line.colourweb_hexa,
//                 textcolourweb_hexa: line.textcolourweb_hexa,
//                 transportmode: mode, // Utiliser le mode sélectionné par l'utilisateur
//                 operatorname: line.operatorname
//             }));
            
//             setAvailableLines(transformedLines);
//             setSelectedLine(null);
//             setAvailableStopPoints([]);
//             setSelectedStopPoint(null);
            
//         } catch (error: any) {
//             console.error("Erreur lors du chargement des lignes :", error);
//             setLinesError(error.message || "Impossible de charger les lignes de transport.");
//             setAvailableLines([]);
//         } finally {
//             setIsLoadingLines(false);
//         }
//     }, []);

//     // --- EFFET POUR CHARGER LES LIGNES DE TRANSPORT ---
//     useEffect(() => {
//         if (transportMode) {
//             fetchTransportLines(transportMode);
//         } else {
//             setAvailableLines([]);
//             setSelectedLine(null);
//             setAvailableStopPoints([]);
//             setSelectedStopPoint(null);
//         }
//     }, [transportMode, fetchTransportLines]);

//     // --- EFFET POUR CHARGER LES POINTS D'ARRÊT (STATIONS) DE LA LIGNE SÉLECTIONNÉE ---
//     useEffect(() => {
//         const fetchStopPoints = async () => {
//             if (!selectedLine) {
//                 setAvailableStopPoints([]);
//                 setSelectedStopPoint(null);
//                 return;
//             }
            
//             try {
//                 // Pour le moment, simulation des points d'arrêt
//                 // Vous pouvez intégrer une autre API pour récupérer les vraies stations
//                 const stopPoints: any[] = [
//                     { id: 'stop_point:1', name: 'Gare de Lyon', coord: { lat: 48.845, lon: 2.374 } },
//                     { id: 'stop_point:2', name: 'Chatelet', coord: { lat: 48.859, lon: 2.347 } },
//                     { id: 'stop_point:3', name: 'République', coord: { lat: 48.867, lon: 2.363 } },
//                     { id: 'stop_point:4', name: 'Bastille', coord: { lat: 48.853, lon: 2.369 } },
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

//             const response = await fetch(`${backendBaseUrl}/api/navitia/traffic-messages`, {
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

//     // Déclencher la récupération des données Navitia une fois la localisation obtenue
//     useEffect(() => {
//         if (userLocation) {
//             fetchNavitiaData();
//         }
//     }, [userLocation, fetchNavitiaData]);

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
//                 const isLineAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.line?.id === selectedLine.id_line ||
//                     obj.pt_object.line?.code === selectedLine.shortname_line
//                 );
//                 const isStopPointAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.stop_point?.id === selectedStopPoint.id
//                 );

//                 const isCurrentlyActive = disruption.application_periods.some(period => {
//                     const begin = new Date(period.begin);
//                     const end = period.end ? new Date(period.end) : new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
//                     const now = new Date();
//                     return now >= begin && now <= end;
//                 });

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
//                 type: 'Retard',
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
//                 disruptionId: relevantDisruption.id,
//                 disruptionSeverity: relevantDisruption.severity.name,
//                 disruptionMessage: relevantDisruption.messages[0]?.text || "Pas de message spécifique",
//                 disruptionStartTime: relevantDisruption.application_periods[0]?.begin,
//             };

//             const response = await fetch(`${backendBaseUrl}/api/tickets`, {
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
//             router.push('/tickets');
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
//                             <Text style={styles.infoText}>
//                                 Localisation obtenue: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
//                             </Text>
//                         ) : (
//                             <Text style={styles.errorText}>{locationErrorMsg || "Localisation non disponible."}</Text>
//                         )}
//                         {locationErrorMsg && (
//                             <TouchableOpacity 
//                                 onPress={() => Location.requestForegroundPermissionsAsync().then(() => Location.getCurrentPositionAsync({}).then(setUserLocation))} 
//                                 style={styles.retryButton}
//                             >
//                                 <Text style={styles.retryButtonText}>Réessayer la localisation</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>

//                     {/* Sélection du mode de transport */}
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>2. Mode de transport</Text>
//                         <Picker
//                             selectedValue={transportMode}
//                             onValueChange={(itemValue) => setTransportMode(itemValue)}
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
//                             {isLoadingLines ? (
//                                 <ActivityIndicator size="small" color="#0EA5E9" />
//                             ) : linesError ? (
//                                 <View>
//                                     <Text style={styles.errorText}>{linesError}</Text>
//                                     <TouchableOpacity 
//                                         onPress={() => fetchTransportLines(transportMode)} 
//                                         style={styles.retryButton}
//                                     >
//                                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             ) : (
//                                 <Picker
//                                     selectedValue={selectedLine ? selectedLine.id_line : null}
//                                     onValueChange={(itemValue) => {
//                                         setSelectedLine(availableLines.find(line => line.id_line === itemValue) || null);
//                                     }}
//                                     style={styles.picker}
//                                     itemStyle={styles.pickerItem}
//                                 >
//                                     <Picker.Item label="Sélectionner une ligne" value={null} />
//                                     {availableLines.map(line => (
//                                         <Picker.Item
//                                             key={line.id_line}
//                                             label={`${line.shortname_line || line.name_line} (${getDisplayTransportMode(line.transportmode, line.name_line)})`}
//                                             value={line.id_line}
//                                         />
//                                     ))}
//                                 </Picker>
//                             )}
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

// // Fonction utilitaire pour le mode de transport
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
//         backgroundColor: '#0EA5E9',
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
//         paddingTop: Platform.OS === 'android' ? 24 : 0,
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
//         color: '#1F2937',
//     },
//     pickerItem: {
//         color: '#1F2937',
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
// import Constants from 'expo-constants';
// import api from '@/services/apiService'; // <-- Assurez-vous que le chemin est correct pour votre apiService.ts
// import axios from 'axios'; // Importez axios pour axios.isAxiosError

// import {
//     LigneTransport,
//     LocationObject,
//     NavitiaDisruption,
//     NavitiaApiResponse,
// } from '../../frontend/src/types'; // Assurez-vous que ce chemin est correct

// // L'URL de base de votre backend n'est plus nécessaire ici si vous utilisez apiService.ts
// // const backendBaseUrl = Constants.expoConfig?.extra?.backendBaseUrl; 

// // Interface pour les réponses de l'API IDF Mobilités (lignes)
// interface IDFMobiliteResponseLignes {
//     total_count: number;
//     results: LigneTransport[];
// }

// // Interface pour les réponses de l'API IDF Mobilités (points d'arrêt/stations)
// // Ajustez cette interface en fonction de la structure réelle des données de l'API des arrêts
// interface StopPointIDFM {
//     id_line: string;
//     id_stop_point: string;
//     name_stop_point: string;
//     coord_x: number; // Longitude
//     coord_y: number; // Latitude
//     // Ajoutez d'autres champs si vous en avez besoin de l'API des arrêts
// }

// interface IDFMobiliteResponseStopPoints {
//     total_count: number;
//     results: StopPointIDFM[];
// }

// export default function RetardEtudiants() {
//     const [transportMode, setTransportMode] = useState<string | null>(null);
//     const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
//     const [availableLines, setAvailableLines] = useState<LigneTransport[]>([]);
//     // Le type de selectedStopPoint et availableStopPoints doit correspondre à StopPointIDFM maintenant
//     const [selectedStopPoint, setSelectedStopPoint] = useState<StopPointIDFM | null>(null);
//     const [availableStopPoints, setAvailableStopPoints] = useState<StopPointIDFM[]>([]);
//     const [isLoadingLines, setIsLoadingLines] = useState(false);
//     const [linesError, setLinesError] = useState<string | null>(null);
//     const [isLoadingStopPoints, setIsLoadingStopPoints] = useState(false); // Nouveau loader
//     const [stopPointsError, setStopPointsError] = useState<string | null>(null); // Nouvelle erreur

//     const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
//     const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
//     const [isLocationLoading, setIsLocationLoading] = useState(false);

//     const [navitiaDisruptions, setNavitiaDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [isNavitiaLoading, setIsNavitiaLoading] = useState(false);
//     const [navitiaErrorMsg, setNavitiaErrorMsg] = useState<string | null>(null);

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [submitError, setSubmitError] = useState<string | null>(null);

//     // Mapping des modes de transport pour l'API IDF Mobilités
//     const transportModeMapping = {
//         'metro': 'Metro',
//         'rail': 'RER', // L'API utilise 'RER' pour les RER, 'Tramway' pour les trams, etc.
//         'bus': 'Bus',
//         'tram': 'Tramway'
//     };

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

//     // --- FONCTION POUR RÉCUPÉRER LES LIGNES DEPUIS L'API IDF MOBILITÉS (avec Axios) ---
//     const fetchTransportLines = useCallback(async (mode: string) => {
//         setIsLoadingLines(true);
//         setLinesError(null);

//         try {
//             const transportModeFilter = transportModeMapping[mode as keyof typeof transportModeMapping];
//             const filtre = `transportmode="${transportModeFilter}"`;

//             // Utilisation directe de l'API IDF Mobilités pour les lignes (pas besoin de votre backend pour ça)
//             const idfM_lines_url = `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/records?where=${encodeURIComponent(filtre)}&select=id_line,shortname_line,name_line,colourweb_hexa,textcolourweb_hexa,transportmode,operatorname&limit=100`;

//             console.log("URL de l'API IDF Mobilités (lignes) :", idfM_lines_url);

//             // Utilisation d'axios pour la requête
//             const response = await axios.get<IDFMobiliteResponseLignes>(idfM_lines_url);

//             const data = response.data;

//             console.log(`Lignes récupérées pour ${mode}:`, data.results.length);

//             const transformedLines: LigneTransport[] = data.results.map(line => ({
//                 id_line: line.id_line,
//                 shortname_line: line.shortname_line,
//                 name_line: line.name_line,
//                 colourweb_hexa: line.colourweb_hexa,
//                 textcolourweb_hexa: line.textcolourweb_hexa,
//                 transportmode: mode, // Utiliser le mode sélectionné par l'utilisateur
//                 operatorname: line.operatorname
//             }));

//             setAvailableLines(transformedLines);
//             setSelectedLine(null);
//             setAvailableStopPoints([]);
//             setSelectedStopPoint(null);

//         } catch (error: any) {
//             console.error("Erreur lors du chargement des lignes :", error);
//             if (axios.isAxiosError(error)) {
//                 setLinesError(error.message || "Impossible de charger les lignes de transport.");
//             } else {
//                 setLinesError("Une erreur inattendue est survenue lors du chargement des lignes.");
//             }
//             setAvailableLines([]);
//         } finally {
//             setIsLoadingLines(false);
//         }
//     }, []);

//     // --- EFFET POUR CHARGER LES LIGNES DE TRANSPORT ---
//     useEffect(() => {
//         if (transportMode) {
//             fetchTransportLines(transportMode);
//         } else {
//             setAvailableLines([]);
//             setSelectedLine(null);
//             setAvailableStopPoints([]);
//             setSelectedStopPoint(null);
//         }
//     }, [transportMode, fetchTransportLines]);

//     // --- EFFET POUR CHARGER LES POINTS D'ARRÊT (STATIONS) DE LA LIGNE SÉLECTIONNÉE (avec Axios) ---
//     useEffect(() => {
//         const fetchStopPoints = async () => {
//             if (!selectedLine) {
//                 setAvailableStopPoints([]);
//                 setSelectedStopPoint(null);
//                 setStopPointsError(null);
//                 return;
//             }

//             setIsLoadingStopPoints(true);
//             setStopPointsError(null);

//             try {
//                 // API pour les points d'arrêt associés à une ligne
//                 // URL: https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/arrets-lignes-points-darret/
//                 // Filtre par id_line du selectedLine
//                 const idfM_stop_points_url = `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/arrets-lignes-points-darret/records?where=id_line%3D%22${encodeURIComponent(selectedLine.id_line)}%22&select=id_line,id_stop_point,name_stop_point,coord_x,coord_y&limit=1000`; // Limit élevé pour s'assurer d'avoir toutes les stations d'une ligne

//                 console.log("URL de l'API IDF Mobilités (stations) :", idfM_stop_points_url);

//                 const response = await axios.get<IDFMobiliteResponseStopPoints>(idfM_stop_points_url);
//                 const data = response.data;

//                 console.log(`Stations récupérées pour la ligne ${selectedLine.shortname_line || selectedLine.name_line}:`, data.results.length);

//                 setAvailableStopPoints(data.results);
//                 setSelectedStopPoint(null);

//             } catch (error: any) {
//                 console.error("Erreur lors du chargement des points d'arrêt :", error);
//                 if (axios.isAxiosError(error)) {
//                     setStopPointsError(error.message || "Impossible de charger les stations pour cette ligne.");
//                 } else {
//                     setStopPointsError("Une erreur inattendue est survenue lors du chargement des stations.");
//                 }
//                 setAvailableStopPoints([]);
//             } finally {
//                 setIsLoadingStopPoints(false);
//             }
//         };

//         fetchStopPoints();
//     }, [selectedLine]);

//     // --- FONCTION POUR RÉCUPÉRER LES PERTURBATIONS NAVITIA (avec Axios) ---
//     const fetchNavitiaData = useCallback(async () => {
//         setIsNavitiaLoading(true);
//         setNavitiaErrorMsg(null);

//         try {
//             // L'intercepteur Axios dans apiService.ts gère l'ajout du token
//             // Votre backend (via apiService) est le proxy pour Navitia
//             const response = await api.get<NavitiaApiResponse>('/navitia/traffic-messages'); // <-- MODIFICATION : Utilisation de api.get()

//             setNavitiaDisruptions(response.data.disruptions); // <-- MODIFICATION : Les données sont dans response.data
//             console.log("Perturbations Navitia reçues :", response.data.disruptions.length);

//         } catch (error: any) {
//             console.error("Erreur Navitia :", error);
//             if (axios.isAxiosError(error)) {
//                 if (error.response?.status === 401 || error.response?.status === 403) {
//                     setNavitiaErrorMsg('Session expirée ou non autorisée. Veuillez vous reconnecter.');
//                     authService.logout();
//                 } else {
//                     setNavitiaErrorMsg(error.message || "Impossible de récupérer les données trafic.");
//                 }
//             } else {
//                 setNavitiaErrorMsg("Une erreur inattendue est survenue lors de la récupération des données trafic.");
//             }
//         } finally {
//             setIsNavitiaLoading(false);
//         }
//     }, []);

//     // Déclencher la récupération des données Navitia une fois la localisation obtenue
//     useEffect(() => {
//         if (userLocation) {
//             fetchNavitiaData();
//         }
//     }, [userLocation, fetchNavitiaData]);

//     // --- LOGIQUE DE VALIDATION DU TICKET (avec Axios) ---
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
//             // N'oubliez pas que coord_x est la longitude et coord_y est la latitude dans l'API IDF Mobilités
//             const stationLat = selectedStopPoint.coord_y;
//             const stationLon = selectedStopPoint.coord_x;
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

//             // Augmentation de la marge d'erreur à 500m (0.5 km) si vous le souhaitez, ou gardez 300m (0.3 km)
//             const MAX_DISTANCE_KM = 0.3; // Max 300 mètres de la station (0.3 km)
//             if (distance > MAX_DISTANCE_KM) {
//                 Alert.alert(
//                     "Localisation non concordante",
//                     `Vous semblez être à ${Math.round(distance * 1000)} mètres de la station ${selectedStopPoint.name_stop_point}. Vous devez être à moins de ${Math.round(MAX_DISTANCE_KM * 1000)} mètres.`
//                 );
//                 setIsSubmitting(false);
//                 return;
//             }

//             // 2. Vérification des perturbations Navitia
//             const relevantDisruption = navitiaDisruptions.find(disruption => {
//                 const isLineAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.line?.id === selectedLine.id_line ||
//                     obj.pt_object.line?.code === selectedLine.shortname_line
//                 );
//                 const isStopPointAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.stop_point?.id === selectedStopPoint.id_stop_point // <-- Utiliser id_stop_point de l'API IDF Mobilités
//                 );

//                 const isCurrentlyActive = disruption.application_periods.some(period => {
//                     const begin = new Date(period.begin);
//                     const end = period.end ? new Date(period.end) : new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
//                     const now = new Date();
//                     return now >= begin && now <= end;
//                 });

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
//             // Le token est géré par l'intercepteur Axios de `api`
//             const newDelayTicket = {
//                 type: 'Retard',
//                 description: `Retard constaté sur la ligne ${selectedLine.name_line} (${selectedLine.shortname_line}) à la station ${selectedStopPoint.name_stop_point}.`, // <-- Utiliser name_stop_point
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
//                 disruptionId: relevantDisruption.id,
//                 disruptionSeverity: relevantDisruption.severity.name,
//                 disruptionMessage: relevantDisruption.messages[0]?.text || "Pas de message spécifique",
//                 disruptionStartTime: relevantDisruption.application_periods[0]?.begin,
//             };

//             const response = await api.post('/tickets', newDelayTicket); // <-- MODIFICATION : Utilisation de api.post()

//             // Axios rejette la promesse en cas de !response.ok, donc pas besoin de if (!response.ok)

//             Alert.alert("Succès", "Votre ticket de retard a été créé avec succès et est en attente de validation finale.");
//             router.push('/tickets');
//         } catch (error: any) {
//             console.error("Erreur lors de la soumission du ticket de retard :", error);
//             if (axios.isAxiosError(error)) {
//                 if (error.response) {
//                     console.error('Erreur de réponse du serveur (soumission ticket):', error.response.status, error.response.data);
//                     if (error.response.status === 401 || error.response.status === 403) {
//                         setSubmitError('Session expirée. Veuillez vous reconnecter.');
//                         authService.logout();
//                     } else {
//                         setSubmitError(error.response.data.message || `Échec de la création du ticket (code: ${error.response.status}).`);
//                     }
//                 } else if (error.request) {
//                     setSubmitError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
//                 } else {
//                     setSubmitError('Erreur inattendue lors de la soumission du ticket.');
//                 }
//             } else {
//                 setSubmitError(error.message || "Une erreur inattendue est survenue.");
//             }
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
//                             <Text style={styles.infoText}>
//                                 Localisation obtenue: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
//                             </Text>
//                         ) : (
//                             <Text style={styles.errorText}>{locationErrorMsg || "Localisation non disponible."}</Text>
//                         )}
//                         {locationErrorMsg && (
//                             <TouchableOpacity 
//                                 onPress={() => Location.requestForegroundPermissionsAsync().then(() => Location.getCurrentPositionAsync({}).then(setUserLocation))} 
//                                 style={styles.retryButton}
//                             >
//                                 <Text style={styles.retryButtonText}>Réessayer la localisation</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>

//                     {/* Sélection du mode de transport */}
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>2. Mode de transport</Text>
//                         <Picker
//                             selectedValue={transportMode}
//                             onValueChange={(itemValue) => setTransportMode(itemValue)}
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
//                             {isLoadingLines ? (
//                                 <ActivityIndicator size="small" color="#0EA5E9" />
//                             ) : linesError ? (
//                                 <View>
//                                     <Text style={styles.errorText}>{linesError}</Text>
//                                     <TouchableOpacity 
//                                         onPress={() => fetchTransportLines(transportMode)} 
//                                         style={styles.retryButton}
//                                     >
//                                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             ) : (
//                                 <Picker
//                                     selectedValue={selectedLine ? selectedLine.id_line : null}
//                                     onValueChange={(itemValue) => {
//                                         setSelectedLine(availableLines.find(line => line.id_line === itemValue) || null);
//                                     }}
//                                     style={styles.picker}
//                                     itemStyle={styles.pickerItem}
//                                 >
//                                     <Picker.Item label="Sélectionner une ligne" value={null} />
//                                     {availableLines.map(line => (
//                                         <Picker.Item
//                                             key={line.id_line}
//                                             label={`${line.shortname_line || line.name_line} (${getDisplayTransportMode(line.transportmode, line.name_line)})`}
//                                             value={line.id_line}
//                                         />
//                                     ))}
//                                 </Picker>
//                             )}
//                         </View>
//                     )}

//                     {/* Sélection de la station */}
//                     {selectedLine && (
//                         <View style={styles.section}>
//                             <Text style={styles.sectionTitle}>4. Station de l'incident</Text>
//                             {isLoadingStopPoints ? ( // Nouveau loader
//                                 <ActivityIndicator size="small" color="#0EA5E9" />
//                             ) : stopPointsError ? ( // Nouvelle erreur
//                                 <View>
//                                     <Text style={styles.errorText}>{stopPointsError}</Text>
//                                     <TouchableOpacity 
//                                         onPress={() => setSelectedLine(selectedLine)} // Déclenche un re-fetch des stations
//                                         style={styles.retryButton}
//                                     >
//                                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             ) : (
//                                 <Picker
//                                     selectedValue={selectedStopPoint ? selectedStopPoint.id_stop_point : null} // <-- Utiliser id_stop_point
//                                     onValueChange={(itemValue) => {
//                                         setSelectedStopPoint(availableStopPoints.find(stop => stop.id_stop_point === itemValue) || null); // <-- Utiliser id_stop_point
//                                     }}
//                                     style={styles.picker}
//                                     itemStyle={styles.pickerItem}
//                                 >
//                                     <Picker.Item label="Sélectionner une station" value={null} />
//                                     {availableStopPoints.map(stop => (
//                                         <Picker.Item key={stop.id_stop_point} label={stop.name_stop_point} value={stop.id_stop_point} />
//                                     ))}
//                                 </Picker>
//                             )}
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

// // Fonction utilitaire pour le mode de transport
// const getDisplayTransportMode = (apiMode: string, lineName: string): string => {
//     switch (apiMode.toLowerCase()) {
//         case 'rail':
//             // Pour les RER, l'API 'referentiel-des-lignes' indique parfois "RER" dans name_line
//             if (lineName.includes('RER')) return 'RER';
//             return 'Train'; // Ou 'Transilien' si vous préférez
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
//         backgroundColor: '#0EA5E9',
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
//         paddingTop: Platform.OS === 'android' ? 24 : 0,
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
//         color: '#1F2937',
//     },
//     pickerItem: {
//         color: '#1F2937',
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
// // Assurez-vous que les chemins d'accès sont corrects pour votre projet
// import busLinesData from '../../frontend/src/data/bus_lines.json'; // VOTRE FICHIER POUR LES BUS
// import rerLinesData from '../../frontend/src/data/rer_lines.json'; // VOTRE FICHIER POUR LES RER
// import metroLinesData from '../../frontend/src/data/metro_lines.json'; // VOTRE FICHIER POUR LES METROS
// import tramLinesData from '../../frontend/src/data/tram_lines.json'; // VOTRE FICHIER POUR LES TRAMS

// // import allStationsData from '../../frontend/src/data/stations.json'; // Votre fichier avec TOUTES les stations

// import {
//     LigneTransport,
//     LocationObject,
//     NavitiaDisruption,
//     NavitiaApiResponse,
// } from '../../frontend/src/types';

// // Interface pour les réponses de l'API IDF Mobilités (lignes) - Pour les types
// interface IDFMobiliteResponseLignes {
//     total_count: number;
//     results: LigneTransport[];
// }

// // Interface pour les réponses de l'API IDF Mobilités (points d'arrêt/stations) - Pour les types
// interface StopPointIDFM {
//     id_line: string;
//     id_stop_point: string;
//     name_stop_point: string;
//     coord_x: number; // Longitude
//     coord_y: number; // Latitude
// }

// interface IDFMobiliteResponseStopPoints {
//     total_count: number;
//     results: StopPointIDFM[];
// }

// // Extraire les données brutes directement de l'import pour les stations
// // const ALL_AVAILABLE_STATIONS: StopPointIDFM[] = (allStationsData as IDFMobiliteResponseStopPoints).results;

// // Mapping pour accéder aux données des lignes en fonction du mode de transport
// const LINES_BY_MODE: { [key: string]: LigneTransport[] } = {
//     'bus': (busLinesData as IDFMobiliteResponseLignes).results,
//     'rail': (rerLinesData as IDFMobiliteResponseLignes).results, // Correspond au RER/Train
//     'metro': (metroLinesData as IDFMobiliteResponseLignes).results,
//     'tram': (tramLinesData as IDFMobiliteResponseLignes).results,
// };

// export default function RetardEtudiants() {
//     const [transportMode, setTransportMode] = useState<string | null>(null);
//     const [selectedLine, setSelectedLine] = useState<LigneTransport | null>(null);
//     const [availableLines, setAvailableLines] = useState<LigneTransport[]>([]);
//     const [selectedStopPoint, setSelectedStopPoint] = useState<StopPointIDFM | null>(null);
//     const [availableStopPoints, setAvailableStopPoints] = useState<StopPointIDFM[]>([]);
//     const [isLoadingLines, setIsLoadingLines] = useState(false);
//     const [linesError, setLinesError] = useState<string | null>(null);
//     const [isLoadingStopPoints, setIsLoadingStopPoints] = useState(false);
//     const [stopPointsError, setStopPointsError] = useState<string | null>(null);

//     const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
//     const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
//     const [isLocationLoading, setIsLocationLoading] = useState(false);

//     const [navitiaDisruptions, setNavitiaDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [isNavitiaLoading, setIsNavitiaLoading] = useState(false);
//     const [navitiaErrorMsg, setNavitiaErrorMsg] = useState<string | null>(null);

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [submitError, setSubmitError] = useState<string | null>(null);

//     // --- EFFET POUR OBTENIR LA LOCALISATION AU CHARGEMENT --- (inchangé)
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

//     // --- FONCTION POUR CHARGER LES LIGNES À PARTIR DES DONNÉES LOCALES SPÉCIFIQUES AU MODE ---
//     const loadTransportLines = useCallback((mode: string) => {
//         setIsLoadingLines(true);
//         setLinesError(null);

//         try {
//             // Utilise le mapping pour récupérer les lignes spécifiques au mode
//             const filtered = LINES_BY_MODE[mode];

//             if (!filtered) {
//                 setLinesError(`Aucune donnée de ligne trouvée pour le mode ${mode}.`);
//                 setAvailableLines([]);
//             } else {
//                 setAvailableLines(filtered);
//             }
//             setSelectedLine(null);
//             setAvailableStopPoints([]);
//             setSelectedStopPoint(null);

//         } catch (error: any) {
//             console.error("Erreur lors du chargement des lignes locales :", error);
//             setLinesError("Impossible de charger les lignes de transport pour ce mode.");
//             setAvailableLines([]);
//         } finally {
//             setIsLoadingLines(false);
//         }
//     }, []);

//     // --- EFFET POUR CHARGER LES LIGNES DE TRANSPORT (via données locales) ---
//     useEffect(() => {
//         if (transportMode) {
//             loadTransportLines(transportMode); // <-- Appel de la fonction de chargement locale spécifique au mode
//         } else {
//             setAvailableLines([]);
//             setSelectedLine(null);
//             setAvailableStopPoints([]);
//             setSelectedStopPoint(null);
//         }
//     }, [transportMode, loadTransportLines]);

//     // --- EFFET POUR CHARGER LES POINTS D'ARRÊT (STATIONS) DE LA LIGNE SÉLECTIONNÉE (via données locales) ---
//     useEffect(() => {
//         const filterStopPoints = () => {
//             if (!selectedLine) {
//                 setAvailableStopPoints([]);
//                 setSelectedStopPoint(null);
//                 setStopPointsError(null);
//                 return;
//             }

//             setIsLoadingStopPoints(true);
//             setStopPointsError(null);

//             try {
//                 // Filtrer les stations par l'id_line de la ligne sélectionnée
//                 const filteredStations = ALL_AVAILABLE_STATIONS.filter(stop =>
//                     stop.id_line === selectedLine.id_line
//                 );

//                 setAvailableStopPoints(filteredStations);
//                 setSelectedStopPoint(null);

//             } catch (error) {
//                 console.error("Erreur lors du filtrage des points d'arrêt locaux :", error);
//                 setStopPointsError("Impossible de charger les stations pour cette ligne depuis les données locales.");
//                 setAvailableStopPoints([]);
//             } finally {
//                 setIsLoadingStopPoints(false);
//             }
//         };

//         filterStopPoints(); // <-- Appel de la fonction de filtrage locale
//     }, [selectedLine]);

//     // --- FONCTION POUR RÉCUPÉRER LES PERTURBATIONS NAVITIA (inchangé, via backend) ---
//     const fetchNavitiaData = useCallback(async () => {
//         setIsNavitiaLoading(true);
//         setNavitiaErrorMsg(null);

//         try {
//             const response = await api.get<NavitiaApiResponse>('/navitia/traffic-messages');
//             setNavitiaDisruptions(response.data.disruptions);
//             console.log("Perturbations Navitia reçues :", response.data.disruptions.length);

//         } catch (error: any) {
//             console.error("Erreur Navitia :", error);
//             if (axios.isAxiosError(error)) {
//                 if (error.response?.status === 401 || error.response?.status === 403) {
//                     setNavitiaErrorMsg('Session expirée ou non autorisée. Veuillez vous reconnecter.');
//                     authService.logout();
//                 } else {
//                     setNavitiaErrorMsg(error.message || "Impossible de récupérer les données trafic.");
//                 }
//             } else {
//                 setNavitiaErrorMsg("Une erreur inattendue est survenue lors de la récupération des données trafic.");
//             }
//         } finally {
//             setIsNavitiaLoading(false);
//         }
//     }, []);

//     // Déclencher la récupération des données Navitia une fois la localisation obtenue (inchangé)
//     useEffect(() => {
//         if (userLocation) {
//             fetchNavitiaData();
//         }
//     }, [userLocation, fetchNavitiaData]);

//     // --- LOGIQUE DE VALIDATION DU TICKET (inchangé) ---
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
//             const stationLat = selectedStopPoint.coord_y; // Latitude de la station
//             const stationLon = selectedStopPoint.coord_x; // Longitude de la station
//             const userLat = userLocation.coords.latitude;
//             const userLon = userLocation.coords.longitude;

//             const R = 6371; // Rayon de la Terre en km
//             const dLat = (stationLat - userLat) * Math.PI / 180;
//             const dLon = (stationLon - userLon) * Math.PI / 180;
//             const a =
//                 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                 Math.cos(userLat * Math.PI / 180) * Math.cos(stationLat * Math.PI / 180) *
//                 Math.sin(dLon / 2) * Math.sin(dLon / 2);
//             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//             const distance = R * c; // Distance en km

//             const MAX_DISTANCE_KM = 0.3; // Max 300 mètres de la station (0.3 km)
//             if (distance > MAX_DISTANCE_KM) {
//                 Alert.alert(
//                     "Localisation non concordante",
//                     `Vous semblez être à ${Math.round(distance * 1000)} mètres de la station ${selectedStopPoint.name_stop_point}. Vous devez être à moins de ${Math.round(MAX_DISTANCE_KM * 1000)} mètres.`
//                 );
//                 setIsSubmitting(false);
//                 return;
//             }

//             // 2. Vérification des perturbations Navitia
//             const relevantDisruption = navitiaDisruptions.find(disruption => {
//                 const isLineAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.line?.id === selectedLine.id_line ||
//                     obj.pt_object.line?.code === selectedLine.shortname_line
//                 );
//                 const isStopPointAffected = disruption.affected_objects.some(obj =>
//                     obj.pt_object.stop_point?.id === selectedStopPoint.id_stop_point
//                 );

//                 const isCurrentlyActive = disruption.application_periods.some(period => {
//                     const begin = new Date(period.begin);
//                     const end = period.end ? new Date(period.end) : new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
//                     const now = new Date();
//                     return now >= begin && now <= end;
//                 });

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

//             const newDelayTicket = {
//                 type: 'Retard',
//                 description: `Retard constaté sur la ligne ${selectedLine.name_line} (${selectedLine.shortname_line}) à la station ${selectedStopPoint.name_stop_point}.`,
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
//                 disruptionId: relevantDisruption.id,
//                 disruptionSeverity: relevantDisruption.severity.name,
//                 disruptionMessage: relevantDisruption.messages[0]?.text || "Pas de message spécifique",
//                 disruptionStartTime: relevantDisruption.application_periods[0]?.begin,
//             };

//             const response = await api.post('/tickets', newDelayTicket);

//             Alert.alert("Succès", "Votre ticket de retard a été créé avec succès et est en attente de validation finale.");
//             router.push('/tickets');
//         } catch (error: any) {
//             console.error("Erreur lors de la soumission du ticket de retard :", error);
//             if (axios.isAxiosError(error)) {
//                 if (error.response) {
//                     console.error('Erreur de réponse du serveur (soumission ticket):', error.response.status, error.response.data);
//                     if (error.response.status === 401 || error.response.status === 403) {
//                         setSubmitError('Session expirée. Veuillez vous reconnecter.');
//                         authService.logout();
//                     } else {
//                         setSubmitError(error.response.data.message || `Échec de la création du ticket (code: ${error.response.status}).`);
//                     }
//                 } else if (error.request) {
//                     setSubmitError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
//                 } else {
//                     setSubmitError('Erreur inattendue lors de la soumission du ticket.');
//                 }
//             } else {
//                 setSubmitError(error.message || "Une erreur inattendue est survenue.");
//             }
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
//                             <Text style={styles.infoText}>
//                                 Localisation obtenue: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
//                             </Text>
//                         ) : (
//                             <Text style={styles.errorText}>{locationErrorMsg || "Localisation non disponible."}</Text>
//                         )}
//                         {locationErrorMsg && (
//                             <TouchableOpacity
//                                 onPress={() => Location.requestForegroundPermissionsAsync().then(() => Location.getCurrentPositionAsync({}).then(setUserLocation))}
//                                 style={styles.retryButton}
//                             >
//                                 <Text style={styles.retryButtonText}>Réessayer la localisation</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>

//                     {/* Sélection du mode de transport */}
//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>2. Mode de transport</Text>
//                         <Picker
//                             selectedValue={transportMode}
//                             onValueChange={(itemValue) => setTransportMode(itemValue)}
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
//                             {isLoadingLines ? (
//                                 <ActivityIndicator size="small" color="#0EA5E9" />
//                             ) : linesError ? (
//                                 <View>
//                                     <Text style={styles.errorText}>{linesError}</Text>
//                                     <TouchableOpacity
//                                         onPress={() => loadTransportLines(transportMode)} // Re-déclencher le chargement local
//                                         style={styles.retryButton}
//                                     >
//                                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             ) : (
//                                 <Picker
//                                     selectedValue={selectedLine ? selectedLine.id_line : null}
//                                     onValueChange={(itemValue) => {
//                                         setSelectedLine(availableLines.find(line => line.id_line === itemValue) || null);
//                                     }}
//                                     style={styles.picker}
//                                     itemStyle={styles.pickerItem}
//                                 >
//                                     <Picker.Item label="Sélectionner une ligne" value={null} />
//                                     {availableLines.map(line => (
//                                         <Picker.Item
//                                             key={line.id_line}
//                                             label={`${line.shortname_line || line.name_line} (${getDisplayTransportMode(line.transportmode, line.name_line)})`}
//                                             value={line.id_line}
//                                         />
//                                     ))}
//                                 </Picker>
//                             )}
//                         </View>
//                     )}

//                     {/* Sélection de la station */}
//                     {selectedLine && (
//                         <View style={styles.section}>
//                             <Text style={styles.sectionTitle}>4. Station de l'incident</Text>
//                             {isLoadingStopPoints ? (
//                                 <ActivityIndicator size="small" color="#0EA5E9" />
//                             ) : stopPointsError ? (
//                                 <View>
//                                     <Text style={styles.errorText}>{stopPointsError}</Text>
//                                     <TouchableOpacity
//                                         onPress={() => setSelectedLine(selectedLine)} // Déclenche un re-fetch/re-filtrage des stations
//                                         style={styles.retryButton}
//                                     >
//                                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             ) : (
//                                 <Picker
//                                     selectedValue={selectedStopPoint ? selectedStopPoint.id_stop_point : null}
//                                     onValueChange={(itemValue) => {
//                                         setSelectedStopPoint(availableStopPoints.find(stop => stop.id_stop_point === itemValue) || null);
//                                     }}
//                                     style={styles.picker}
//                                     itemStyle={styles.pickerItem}
//                                 >
//                                     <Picker.Item label="Sélectionner une station" value={null} />
//                                     {availableStopPoints.map(stop => (
//                                         <Picker.Item key={stop.id_stop_point} label={stop.name_stop_point} value={stop.id_stop_point} />
//                                     ))}
//                                 </Picker>
//                             )}
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

// // Fonction utilitaire pour le mode de transport (inchangée)
// const getDisplayTransportMode = (apiMode: string, lineName: string): string => {
//     switch (apiMode.toLowerCase()) {
//         case 'rail':
//             if (lineName.includes('RER')) return 'RER';
//             return 'Train';
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
//         backgroundColor: '#0EA5E9',
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
//         paddingTop: Platform.OS === 'android' ? 24 : 0,
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
//         color: '#1F2937',
//     },
//     pickerItem: {
//         color: '#1F2937',
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