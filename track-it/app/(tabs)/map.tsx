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
            const response = await apiService.get<Ticket[]>('/tickets/all');
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
            {/* <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonCustomHeader}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.customHeaderTitle}>Carte des Signalements</Text>
                <View style={{ width: 24 }} />
            </View> */}

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

            {/* <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={navigateToSignalement}
                >
                    <Ionicons name="add" size={32} color="white" />
                    <Text style={styles.floatingButtonText}>Signaler</Text>
                </TouchableOpacity>
            </View> */}
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