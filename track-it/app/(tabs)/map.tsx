// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// export default function MapScreen() {
//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.arrierePlan}>
//             <View style={styles.formeDecorative1} />
//             <View style={styles.formeDecorative2} />
//             <View style={styles.centerContent}>
//                 <View style={styles.card}>
//                     <Ionicons name="map" size={80} color="#9CA3AF" />
//                     <Text style={styles.title}>
//                         Carte des signalements
//                     </Text>
//                     <Text style={styles.description}>
//                         La carte interactive sera disponible prochainement
//                     </Text>
//                     <TouchableOpacity style={styles.button}>
//                         <Text style={styles.buttonText}>Activer les notifications</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#0F172A',
//     },
//     arrierePlan: {
//     flex: 1,
//     position: 'relative',
//   },
//   formeDecorative1: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
//     borderBottomLeftRadius: 50,
//     borderBottomRightRadius: 50,
//     opacity: 0.9,
//   },
//   formeDecorative2: {
//     position: 'absolute',
//     top: 80,
//     right: -50,
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   }, 
//     centerContent: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 16,
//     },
//     card: {
//         backgroundColor: 'white',
//         padding: 32,
//         borderRadius: 8,
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 1,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: '#111827',
//         marginTop: 16,
//         marginBottom: 8,
//     },
//     description: {
//         color: '#6B7280',
//         textAlign: 'center',
//         marginBottom: 24,
//         lineHeight: 20,
//     },
//     button: {
//         backgroundColor: '#0a7ea4',
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 8,
//     },
//     buttonText: {
//         color: 'white',
//         fontWeight: '500',
//     },
// });











// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import MapView, { Marker, Callout } from 'react-native-maps';
// import * as Location from 'expo-location';
// import apiService from '../../services/apiService';

// // Import des types depuis le fichier centralisé
// import { LocationObjectCoords, NavitiaDisruption, NavitiaApiResponse, Ticket } from '../types';

// // Import des hooks de navigation pour Expo Router
// import { useNavigation, useFocusEffect } from 'expo-router';


// export default function MapScreen() {
//     const navigation = useNavigation();

//     const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
//     const [disruptions, setDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [tickets, setTickets] = useState<Ticket[]>([]);
//     const [isLoadingMapData, setIsLoadingMapData] = useState(true);
//     const [errorMapData, setErrorMapData] = useState<string | null>(null);
//     const [lastFetchTime, setLastFetchTime] = useState(0); // Pour contrôler la fréquence des appels
//     const FETCH_INTERVAL = 5 * 60 * 1000; // Recharger toutes les 5 minutes (en millisecondes)


//     // Utilisation de useCallback pour stabiliser la fonction getUserLocation
//     const getUserLocation = useCallback(async () => {
//         setIsLoadingMapData(true);
//         setErrorMapData(null);
//         try {
//             const { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert(
//                     'Permission de localisation refusée',
//                     'Veuillez activer les services de localisation pour voir la carte.'
//                 );
//                 setIsLoadingMapData(false);
//                 return;
//             }

//             const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//             setCurrentLocation(location.coords);
//             console.log('Localisation actuelle:', location.coords);
//         } catch (error: any) {
//             console.error('Erreur lors de la récupération de la localisation:', error);
//             setErrorMapData('Impossible de récupérer votre position actuelle.');
//             setIsLoadingMapData(false);
//         }
//     }, []); // Aucune dépendance car cette fonction ne dépend pas des props ou de l'état du composant qui changent.


//     // Utilisation de useCallback pour stabiliser la fonction loadMapData
//     const loadMapData = useCallback(async () => {
//         if (!currentLocation) {
//             console.warn("loadMapData: Pas de localisation actuelle, impossible de charger les données de la carte.");
//             setIsLoadingMapData(false);
//             return;
//         }

//         setIsLoadingMapData(true);
//         setErrorMapData(null);
//         try {
//             console.log("Tentative de chargement des perturbations Navitia...");
//             const disruptionsResponse = await apiService.get<NavitiaApiResponse>(`/navitia/disruptions`, {
//                 params: {
//                     latitude: currentLocation.latitude,
//                     longitude: currentLocation.longitude,
//                     distance: 10000
//                 }
//             });
//             setDisruptions(disruptionsResponse.data.disruptions || []);
//             console.log('Disruptions Navitia chargées:', disruptionsResponse.data.disruptions?.length || 0);

//             console.log("Tentative de chargement des tickets utilisateurs...");
//             const ticketsResponse = await apiService.get<Ticket[]>('/tickets/all');
//             setTickets(ticketsResponse.data || []);
//             console.log('Tickets utilisateurs chargés:', ticketsResponse.data?.length || 0);

//         } catch (error: any) {
//             console.error('Erreur lors du chargement des données de la carte:', error.response?.data?.message || error.message);
//             setErrorMapData('Erreur lors du chargement des données de la carte. Vérifiez la connexion au serveur.');
//         } finally {
//             setIsLoadingMapData(false);
//         }
//     }, [currentLocation]); // UNIQUEMENT currentLocation comme dépendance. Les setters sont stables.


//     // 1. Appelle getUserLocation une seule fois au montage du composant
//     useEffect(() => {
//         getUserLocation();
//     }, [getUserLocation]); // Dépend de la fonction memoized getUserLocation


//     // 2. Appelle loadMapData UNE FOIS quand currentLocation est défini pour la première fois
//     // et à chaque fois que sa valeur change.
//     useEffect(() => {
//         if (currentLocation) {
//             loadMapData();
//         }
//     }, [currentLocation, loadMapData]); // Dépend de currentLocation et de la fonction memoized loadMapData


//     // 3. useFocusEffect pour recharger les données si on revient sur l'écran
//     // (uniquement si un certain temps s'est écoulé ou si la localisation n'était pas disponible)
//     useFocusEffect(
//         useCallback(() => {
//             const now = Date.now();
//             // Recharger si l'écran est focus ET la localisation est disponible ET l'intervalle est dépassé
//             // Ou si les tableaux de données sont vides (pour forcer un premier chargement ou un rechargement si vide)
//             if (currentLocation && !isLoadingMapData && (now - lastFetchTime > FETCH_INTERVAL || disruptions.length === 0 || tickets.length === 0)) {
//                 console.log("Rechargement des données de la carte suite au focus de l'écran, intervalle dépassé ou données vides.");
//                 loadMapData();
//                 setLastFetchTime(now); // Met à jour le temps du dernier fetch
//             }
//             // Si pas de localisation et pas en cours de chargement/erreur, tenter de la récupérer
//             else if (!currentLocation && !isLoadingMapData && !errorMapData) {
//                 getUserLocation();
//             }
//         }, [currentLocation, isLoadingMapData, errorMapData, lastFetchTime, loadMapData, getUserLocation, disruptions.length, tickets.length])
//     );


//     if (isLoadingMapData && !currentLocation) {
//         return (
//             <SafeAreaView style={styles.container}>
//                 <View style={styles.arrierePlan}>
//                     <View style={styles.formeDecorative1} />
//                     <View style={styles.formeDecorative2} />
//                     <View style={styles.centerContent}>
//                         <ActivityIndicator size="large" color="#0EA5E9" />
//                         <Text style={styles.loadingText}>Chargement de la carte et de votre position...</Text>
//                     </View>
//                 </View>
//             </SafeAreaView>
//         );
//     }

//     if (errorMapData) {
//         return (
//             <SafeAreaView style={styles.container}>
//                 <View style={styles.arrierePlan}>
//                     <View style={styles.formeDecorative1} />
//                     <View style={styles.formeDecorative2} />
//                     <View style={styles.centerContent}>
//                         <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
//                         <Text style={styles.errorText}>Erreur: {errorMapData}</Text>
//                         <TouchableOpacity onPress={getUserLocation} style={styles.button}>
//                             <Text style={styles.buttonText}>Réessayer la localisation</Text>
//                         </TouchableOpacity>
//                         {currentLocation && (
//                             <TouchableOpacity onPress={loadMapData} style={[styles.button, { marginTop: 10 }]}>
//                                 <Text style={styles.buttonText}>Recharger les données de la carte</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                 </View>
//             </SafeAreaView>
//         );
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.arrierePlan}>
//                 <View style={styles.formeDecorative1} />
//                 <View style={styles.formeDecorative2} />

//                 {currentLocation ? (
//                     <MapView
//                         style={styles.map}
//                         initialRegion={{
//                             latitude: currentLocation.latitude,
//                             longitude: currentLocation.longitude,
//                             latitudeDelta: 0.0922, // Gardez ces valeurs pour le moment, on pourra les ajuster après
//                             longitudeDelta: 0.0421,
//                         }}
//                         showsUserLocation={true}
//                     >
//                         {/* Marqueurs pour les perturbations Navitia */}
//                         {disruptions.map((disruption) => {
//                             const firstAffectedObject = disruption.affected_objects?.find(obj =>
//                                 obj.pt_object?.line?.coord || obj.pt_object?.stop_point?.coord
//                             );

//                             // CORRECTION DE L'ERREUR DE TYPAGE ICI
//                             if (!firstAffectedObject) {
//                                 // Cette perturbation n'a pas d'objet affecté avec des coordonnées valides
//                                 console.warn(`[Disruption Debug] Disruption ID ${disruption.id} n'a pas d'objet affecté avec des coordonnées valides.`, disruption.affected_objects);
//                                 return null; // Important: retourner null ici
//                             }

//                             const coord = firstAffectedObject.pt_object?.line?.coord || firstAffectedObject.pt_object?.stop_point?.coord;

//                             if (coord) {
//                                 // LOG POUR DÉBOGUER : Affiche les coordonnées de chaque perturbation
//                                 console.log(`[Disruption Marker] ID: ${disruption.id}, Coords: ${coord.lat}, ${coord.lon}`);
//                                 return (
//                                     <Marker
//                                         key={disruption.id}
//                                         coordinate={{ latitude: coord.lat, longitude: coord.lon }}
//                                         title={`Perturbation: ${disruption.severity.name}`}
//                                         description={disruption.messages[0]?.text || "Pas de description"}
//                                         pinColor="red"
//                                     >
//                                         <Callout>
//                                             <View>
//                                                 <Text style={styles.calloutTitle}>{disruption.severity.name}</Text>
//                                                 <Text style={styles.calloutText}>{disruption.messages[0]?.text}</Text>
//                                                 <Text style={styles.calloutTextSmall}>Statut: {disruption.status}</Text>
//                                             </View>
//                                         </Callout>
//                                     </Marker>
//                                 );
//                             } else {
//                                 // L'objet affecté a été trouvé mais n'a pas de coordonnées valides
//                                 console.warn(`[Disruption Debug] ID ${disruption.id} found affected object, but no valid 'coord'.`, firstAffectedObject.pt_object);
//                                 return null; // Important: retourner null ici aussi
//                             }
//                         })}

//                         {/* Marqueurs pour les tickets utilisateurs */}
//                         {tickets.map((ticket) => {
//     if (ticket.location && ticket.location.latitude != null && ticket.location.longitude != null) {
//         // LOG POUR DÉBOGUER : Affiche les coordonnées de chaque ticket
//         console.log(`[Ticket Marker] ID: ${ticket._id}, Coords: ${ticket.location.latitude}, ${ticket.location.longitude}`);
//         return (
//             <Marker
//                 key={ticket._id}
//                 coordinate={{ latitude: ticket.location.latitude, longitude: ticket.location.longitude }}
//                 title={`Signalement: ${ticket.type}`}
//                 description={ticket.description}
//                 pinColor="green"
//             >
//                 <Callout>
//                     <View>
//                         <Text style={styles.calloutTitle}>Signalement: {ticket.type}</Text>
//                         <Text style={styles.calloutText}>{ticket.description}</Text>
//                         {ticket.transportLine && (
//                             <Text style={styles.calloutTextSmall}>Ligne: {ticket.transportLine.shortname_line || ticket.transportLine.name_line}</Text>
//                         )}
//                         <Text style={styles.calloutTextSmall}>Statut: {ticket.status}</Text>
//                     </View>
//                 </Callout>
//             </Marker>
//         );
//     } else {
//         // LOG POUR DÉBOGUER si le ticket n'a pas de localisation valide
//         console.warn(`[Ticket Warn] Ticket ID: ${ticket._id} n'a pas de localisation valide ou complète.`, ticket.location);
//         return null;
//     }
// })}

//                     </MapView>
//                 ) : (
//                     <View style={styles.centerContent}>
//                         <Text style={styles.noLocationText}>Veuillez activer la localisation pour afficher la carte.</Text>
//                         <TouchableOpacity onPress={getUserLocation} style={styles.button}>
//                             <Text style={styles.buttonText}>Activer la localisation</Text>
//                         </TouchableOpacity>
//                     </View>
//                 )}
//             </View>
//         </SafeAreaView>
//     );
// }

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
//         backgroundColor: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
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
//     centerContent: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 16,
//     },
//     loadingText: {
//         marginTop: 20,
//         color: 'white',
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     errorText: {
//         marginTop: 20,
//         color: '#EF4444',
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     noLocationText: {
//         marginTop: 20,
//         color: '#64748B',
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     button: {
//         backgroundColor: '#0a7ea4',
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 8,
//         marginTop: 20,
//     },
//     buttonText: {
//         color: 'white',
//         fontWeight: '500',
//     },
//     map: {
//         flex: 1,
//         width: '100%',
//         height: '100%',
//     },
//     calloutTitle: {
//         fontWeight: 'bold',
//         fontSize: 16,
//         marginBottom: 5,
//     },
//     calloutText: {
//         fontSize: 14,
//         marginBottom: 3,
//     },
//     calloutTextSmall: {
//         fontSize: 12,
//         color: '#666',
//     },
//     reportButtonContainer: {
//         position: 'absolute',
//         bottom: 30,
//         left: 0,
//         right: 0,
//         alignItems: 'center',
//         paddingHorizontal: 20,
//     },
//     boutonSoumission: {
//         backgroundColor: '#0EA5E9',
//         borderRadius: 20,
//         paddingVertical: 18,
//         width: '100%',
//         alignItems: 'center',
//         shadowColor: '#0EA5E9',
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.3,
//         shadowRadius: 16,
//         elevation: 8,
//         flexDirection: 'row',
//         justifyContent: 'center',
//     },
//     texteBoutonSoumission: {
//         color: 'white',
//         fontSize: 18,
//         fontWeight: '700',
//         marginRight: 8,
//     },
// });












// app/map.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

import isEqual from 'lodash.isequal'; // Importez lodash.isequal

import apiService from '../../services/apiService';
import { Ticket, TypeProbleme, LigneTransport } from '../types';

// ==================== DONNÉES STATIQUES ====================
const typesProbleemes: TypeProbleme[] = [
    { id: 'Proprete', libelle: 'Propreté', icone: 'trash', couleur: '#F59E0B' },
    { id: 'Equipement', libelle: 'Équipement', icone: 'construct', couleur: '#DC2626' },
    { id: 'Surcharge', libelle: 'Surcharge', icone: 'people', couleur: '#F97316' },
    { id: 'Retard', libelle: 'Retard', icone: 'time', couleur: '#0A7EA4' },
    { id: 'Securite', libelle: 'Sécurité', icone: 'shield-checkmark', couleur: '#6B46C1' },
    { id: 'Autre', libelle: 'Autre', icone: 'ellipsis-horizontal', couleur: '#64748B' },
];

const initialRegion = {
    latitude: 48.8566, // Centre de Paris
    longitude: 2.3522, // Centre de Paris
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};


const getUniqueCoordinates = (tickets: Ticket[]) => {
    const coordsMap: { [key: string]: Ticket[] } = {};
    tickets.forEach(ticket => {
        if (ticket.location) {
            const key = `${ticket.location.latitude},${ticket.location.longitude}`;
            if (!coordsMap[key]) {
                coordsMap[key] = [];
            }
            coordsMap[key].push(ticket);
        }
    });

    const processedTickets: Ticket[] = [];
    const LATITUDE_OFFSET = 0.00005;
    const LONGITUDE_OFFSET = 0.00005;

    for (const key in coordsMap) { 
        const group = coordsMap[key];
        if (group.length > 1) {
            group.forEach((ticket, index) => {
                // Créer une copie de l'objet location pour garantir l'immutabilité si modifié
                const newLocation = { ...ticket.location! }; 
                if (index % 2 === 0) {
                    newLocation.latitude += (index / 2) * LATITUDE_OFFSET;
                } else {
                    newLocation.longitude += Math.floor(index / 2) * LONGITUDE_OFFSET;
                }
                // S'assurer que le ticket poussé est une nouvelle instance si sa location a changé
                processedTickets.push({ ...ticket, location: newLocation });
            });
        } else {
            processedTickets.push(group[0]);
        }
    }
    return processedTickets;
};
// --- FIN FONCTION UTILITAIRE ---


export default function MapScreen() {
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [error, setError] = useState<string | null>(null);

    const mapRef = useRef<MapView>(null);

    const centerMapOnUserLocation = useCallback(() => {
        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        }
    }, [currentLocation]);

    const getUserLocation = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission de localisation refusée',
                    'Veuillez activer les services de localisation pour afficher la carte et les signalements.'
                );
                setError('Permission de localisation refusée.');
                setLoading(false);
                return null;
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setCurrentLocation(location.coords);
            return location.coords;
        } catch (err: any) {
            console.error('Erreur lors de la récupération de la localisation:', err);
            setError('Impossible de récupérer votre position actuelle. ' + err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTickets = useCallback(async () => {
        console.log("Fetching tickets from backend...");
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get<Ticket[]>('/tickets');
            console.log("Tickets fetched:", response.data.length);
            const validTickets = response.data.filter(ticket =>
                ticket.location &&
                typeof ticket.location.latitude === 'number' &&
                typeof ticket.location.longitude === 'number'
            );
            
            const newProcessedTickets = getUniqueCoordinates(validTickets);
            
            // Comparer les données traitées avec l'état actuel avant de faire un set
            // Cela empêche un re-render inutile si les données n'ont pas fondamentalement changé
            if (!isEqual(tickets, newProcessedTickets)) {
                console.log("Tickets data changed, updating state.");
                setTickets(newProcessedTickets);
            } else {
                console.log("Tickets data unchanged, skipping state update.");
            }

        } catch (err: any) {
            console.error("Error fetching tickets:", err.response?.data?.message || err.message);
            setError("Erreur lors du chargement des signalements. " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [tickets]); // Dépendance ajoutée: 'tickets' pour la comparaison `isEqual`

    useEffect(() => {
        const initializeMapData = async () => {
            const coords = await getUserLocation();
            if (coords) {
                fetchTickets();
            }
        };
        initializeMapData();
    }, [getUserLocation, fetchTickets]);

    useFocusEffect(
        useCallback(() => {
            console.log("Re-fetching data on focus.");
            fetchTickets();
            // Gardons la logique de récupération de localisation ici aussi, au cas où elle n'aurait pas été obtenue initialement
            if (!currentLocation) { 
                getUserLocation();
            }
        }, [fetchTickets, getUserLocation, currentLocation]) // Dépendances mises à jour
    );

    const navigateToSignalement = useCallback(() => { // Mémoriser cette fonction aussi
        if (currentLocation) {
            router.push({
                pathname: "/signalement",
                params: { initialLocation: JSON.stringify(currentLocation) }
            });
        } else {
            Alert.alert(
                "Localisation non disponible",
                "Votre position n'a pas encore été détectée. Vous devrez saisir la localisation manuellement pour votre signalement.",
                [{ text: "OK", onPress: () => router.push("/signalement") }]
            );
        }
    }, [currentLocation]); // Dépend de currentLocation

    // <<< C'EST LA MODIFICATION LA PLUS IMPORTANTE ICI POUR LE PROBLÈME DE BOUCLE >>>
    const getTypeProblemeInfo = useCallback((typeId: string) => {
        return typesProbleemes.find(tp => tp.id.toLowerCase() === typeId.toLowerCase()) || { icone: 'alert-circle', couleur: '#64748B', libelle: 'Inconnu' };
    }, []); // typesProbleemes est une constante statique, donc pas de dépendance ici.

    if (loading && !currentLocation && tickets.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Chargement de la carte et des signalements...</Text>
            </View>
        );
    }

    if (error && !currentLocation && tickets.length === 0) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
                <Text style={styles.errorText}>Erreur: {error}</Text>
                <TouchableOpacity onPress={getUserLocation} style={styles.button}>
                    <Text style={styles.buttonText}>Réessayer la localisation</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={fetchTickets} style={[styles.button, { marginTop: 10 }]}>
                    <Text style={styles.buttonText}>Recharger les signalements</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonCustomHeader}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.customHeaderTitle}>Carte des Signalements</Text>
                <View style={{ width: 24 }} />
            </View>

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={currentLocation ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                } : initialRegion}
                showsUserLocation={true}
            >
                {tickets.map((ticket) => {
                    if (!ticket.location || typeof ticket.location.latitude !== 'number' || typeof ticket.location.longitude !== 'number') {
                        return null;
                    }

                    const problemType = getTypeProblemeInfo(ticket.type); // getTypeProblemeInfo est maintenant stable
                    const lineInfo = ticket.transportLine;

                    return (
                        <Marker
                            key={ticket._id} // Assurez-vous que _id est unique et stable !
                            coordinate={{
                                latitude: ticket.location.latitude,
                                longitude: ticket.location.longitude,
                            }}
                        >
                            <View style={[styles.customMarkerContainer, { backgroundColor: problemType.couleur }]}>
                                <Ionicons name={problemType.icone as any} size={20} color="white" />
                            </View>

                            {/* IMPORTANT: La Callout elle-même est un composant qui peut être cher à re-rendre */}
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutHeader}>
                                        <Ionicons name={problemType.icone as any} size={24} color={problemType.couleur} style={styles.calloutIcon} />
                                        <Text style={styles.calloutTitle}>{problemType.libelle}</Text>
                                    </View>

                                    {lineInfo && (
                                        <View style={[
                                            styles.calloutLineBadge,
                                            { backgroundColor: lineInfo.colourweb_hexa ? `#${lineInfo.colourweb_hexa}` : '#0EA5E9' }
                                        ]}>
                                            <Text style={[
                                                styles.calloutLineText,
                                                { color: lineInfo.textcolourweb_hexa ? `#${lineInfo.textcolourweb_hexa}` : 'white' }
                                            ]}>
                                                {lineInfo.shortname_line || lineInfo.name_line || 'Ligne inconnue'}
                                            </Text>
                                        </View>
                                    )}

                                    <Text style={styles.calloutDescription}>{ticket.description}</Text>
                                    <Text style={styles.calloutDate}>{new Date(ticket.createdAt!).toLocaleString()}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={navigateToSignalement}
                >
                    <Ionicons name="add" size={32} color="white" />
                    <Text style={styles.floatingButtonText}>Signaler</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    loadingText: {
        marginTop: 10,
        color: 'white',
        fontSize: 16,
    },
    errorText: {
        marginTop: 10,
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
        zIndex: 2,
    },
    customHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    backButtonCustomHeader: {
        padding: 5,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },
    floatingButton: {
        backgroundColor: '#0EA5E9',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    customMarkerContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutContainer: {
        width: 250,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    calloutIcon: {
        marginRight: 8,
    },
    calloutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    calloutLineBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    calloutLineText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    calloutDescription: {
        fontSize: 14,
        color: '#334155',
        marginBottom: 8,
    },
    calloutDate: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'right',
    },
});