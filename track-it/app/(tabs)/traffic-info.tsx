// // app/traffic-info.tsx

// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, RefreshControl, Platform, StatusBar } from 'react-native';
// import { Stack } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { format, parseISO } from 'date-fns';
// import { fr } from 'date-fns/locale'; 

// import apiService from '../../services/apiService'; // Assurez-vous que le chemin est correct
// import { NavitiaDisruption, NavitiaApiResponse } from '../../frontend/src/types'; // Importez vos types existants

// export default function TrafficInfoScreen() {
//     const [disruptions, setDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);

//     const fetchTrafficInfo = useCallback(async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             // Remplacez '/navitia/disruptions' par l'endpoint réel de votre backend si différent
//             const response = await apiService.get<NavitiaApiResponse>('/navitia/disruptions');
//             // Filtrer les disruptions non nulles et celles qui sont actives ou futures
//             const activeDisruptions = response.data.disruptions
//                 ?.filter(d => 
//                     d && d.application_periods && d.application_periods.some(p => new Date(p.end) > new Date())
//                 )
//                 .sort((a, b) => {
//                     // Trier par sévérité (plus grave en premier) puis par date de début
//                     const severityOrder: { [key: string]: number } = { "severe": 1, "major": 2, "minor": 3, "information": 4 };
//                     const severityA = severityOrder[a.severity?.id || "information"] || 99;
//                     const severityB = severityOrder[b.severity?.id || "information"] || 99;

//                     if (severityA !== severityB) {
//                         return severityA - severityB;
//                     }

//                     const beginA = new Date(a.application_periods[0]?.begin || 0).getTime();
//                     const beginB = new Date(b.application_periods[0]?.begin || 0).getTime();
//                     return beginA - beginB;
//                 });
            
//             setDisruptions(activeDisruptions || []);
//             console.log('Disruptions chargées :', activeDisruptions?.length);

//         } catch (err: any) {
//             console.error('Erreur lors de la récupération des infos trafic:', err.response?.data || err.message);
//             setError('Erreur lors du chargement des informations de trafic. Veuillez réessayer plus tard.');
//         } finally {
//             setIsLoading(false);
//             setRefreshing(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchTrafficInfo();
//     }, [fetchTrafficInfo]);

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchTrafficInfo();
//     }, [fetchTrafficInfo]);

//     const renderDisruptionItem = ({ item }: { item: NavitiaDisruption }) => {
//         const primaryMessage = item.messages.find(msg => msg.channel === 'text_message' || msg.channel === 'public_transport') || item.messages[0];
//         const affectedLines = item.affected_objects
//             ?.filter(obj => obj.pt_object?.line)
//             .map(obj => obj.pt_object?.line?.short_name || obj.pt_object?.line?.name)
//             .filter(Boolean) as string[]; // Filtrer les valeurs nulles et s'assurer que c'est un tableau de strings

//         const startTime = item.application_periods[0]?.begin ? format(parseISO(item.application_periods[0].begin), 'dd/MM HH:mm', { locale: fr }) : 'N/A';
//         const endTime = item.application_periods[0]?.end ? format(parseISO(item.application_periods[0].end), 'dd/MM HH:mm', { locale: fr }) : 'N/A';

//         let iconName: keyof typeof Ionicons.glyphMap = 'information-circle-outline';
//         let iconColor = '#6B7280'; // Gris par défaut

//         if (item.severity) {
//             switch (item.severity.id) {
//                 case 'severe':
//                     iconName = 'alert-circle';
//                     iconColor = '#DC2626'; // Rouge
//                     break;
//                 case 'major':
//                     iconName = 'warning';
//                     iconColor = '#F59E0B'; // Orange
//                     break;
//                 case 'minor':
//                     iconName = 'information-circle';
//                     iconColor = '#0A7EA4'; // Bleu
//                     break;
//                 default:
//                     iconName = 'information-circle-outline';
//                     iconColor = '#6B7280'; // Gris
//             }
//         }
        
//         return (
//             <View style={styles.disruptionCard}>
//                 <View style={styles.cardHeader}>
//                     <Ionicons name={iconName} size={24} color={iconColor} style={styles.cardIcon} />
//                     <View style={styles.headerTextContainer}>
//                         <Text style={[styles.disruptionSeverity, { color: iconColor }]}>
//                             {item.severity?.name ? item.severity.name.toUpperCase() : 'INFORMATION'}
//                         </Text>
//                         {affectedLines.length > 0 && (
//                             <Text style={styles.affectedLines}>
//                                 Ligne(s) concernée(s) : {affectedLines.join(', ')}
//                             </Text>
//                         )}
//                     </View>
//                 </View>
//                 <Text style={styles.disruptionMessage}>{primaryMessage?.text || "Pas de message disponible."}</Text>
//                 <View style={styles.dateContainer}>
//                     <Text style={styles.disruptionDate}>Début: {startTime}</Text>
//                     <Text style={styles.disruptionDate}>Fin: {endTime}</Text>
//                 </View>
//             </View>
//         );
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen
//                 options={{
//                     headerShown: false, // Ou true si vous voulez une barre de titre par défaut
//                     title: 'Infos Trafic',
//                 }}
//             />
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Infos Trafic</Text>
//             </View>

//             {isLoading && (
//                 <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="large" color="#0EA5E9" />
//                     <Text style={styles.loadingText}>Chargement des informations de trafic...</Text>
//                 </View>
//             )}

//             {error && (
//                 <View style={styles.errorContainer}>
//                     <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
//                     <Text style={styles.errorText}>{error}</Text>
//                     <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
//                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {!isLoading && !error && disruptions.length === 0 && (
//                 <View style={styles.emptyContainer}>
//                     <Ionicons name="information-circle-outline" size={60} color="#9CA3AF" />
//                     <Text style={styles.emptyText}>Aucune perturbation majeure signalée actuellement.</Text>
//                 </View>
//             )}

//             {!isLoading && !error && disruptions.length > 0 && (
//                 <FlatList
//                     data={disruptions}
//                     renderItem={renderDisruptionItem}
//                     keyExtractor={item => item.id}
//                     contentContainerStyle={styles.listContent}
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={onRefresh}
//                             colors={['#0EA5E9']}
//                             tintColor={'#0EA5E9'}
//                         />
//                     }
//                 />
//             )}
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F3F4F6', // Un fond clair
//     },
//     header: {
//         backgroundColor: '#0F172A', // Couleur de votre barre d'en-tête existante
//         paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//         paddingBottom: 15,
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderBottomLeftRadius: 20,
//         borderBottomRightRadius: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 3,
//     },
//     headerTitle: {
//         color: 'white',
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     loadingText: {
//         marginTop: 10,
//         color: '#6B7280',
//         fontSize: 16,
//     },
//     errorContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     errorText: {
//         marginTop: 10,
//         color: '#EF4444',
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     retryButton: {
//         backgroundColor: '#0A7EA4',
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         borderRadius: 8,
//         marginTop: 15,
//     },
//     retryButtonText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     emptyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     emptyText: {
//         marginTop: 15,
//         color: '#9CA3AF',
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     listContent: {
//         paddingVertical: 15,
//         paddingHorizontal: 10,
//     },
//     disruptionCard: {
//         backgroundColor: 'white',
//         borderRadius: 10,
//         padding: 15,
//         marginBottom: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//         elevation: 1,
//         borderLeftWidth: 5, // Pour une touche de couleur selon la sévérité, à styliser si besoin
//         borderLeftColor: 'transparent', // sera remplacé par la couleur de sévérité si implémenté
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     cardIcon: {
//         marginRight: 10,
//     },
//     headerTextContainer: {
//         flex: 1,
//     },
//     disruptionSeverity: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#3B82F6', // Couleur par défaut, sera écrasée
//     },
//     affectedLines: {
//         fontSize: 13,
//         color: '#6B7280',
//         marginTop: 2,
//     },
//     disruptionMessage: {
//         fontSize: 15,
//         color: '#1F2937',
//         marginBottom: 10,
//     },
//     dateContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 5,
//     },
//     disruptionDate: {
//         fontSize: 12,
//         color: '#9CA3AF',
//     },
// });



// app/traffic-info.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    FlatList, 
    RefreshControl, 
    Platform, 
    StatusBar,
    TouchableOpacity // Ajouté pour le bouton Réessayer
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale'; 

// Importez vos services et types. Vérifiez bien les chemins !
// L'exemple de chemin ici suppose que `apiService.ts` est dans `services/`
// et `types.ts` est dans `frontend/src/types/` par rapport à la racine du projet.
import apiService from '../../services/apiService'; 
import { NavitiaDisruption, NavitiaApiResponse } from '../../frontend/src/types'; 


console.log("Composant TrafficInfoScreen est en cours d'importation/rendu."); // Log au chargement du module

export default function TrafficInfoScreen() {
    console.log("Exécution de la fonction TrafficInfoScreen."); // Log au début de la fonction du composant

    const [disruptions, setDisruptions] = useState<NavitiaDisruption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrafficInfo = useCallback(async () => {
        console.log("Début de fetchTrafficInfo...");
        setIsLoading(true);
        setError(null);
        try {
            console.log("Tentative d'appel API au backend: /navitia/disruptions...");
            const response = await apiService.get<NavitiaApiResponse>('/navitia/disruptions');
            console.log("Réponse API reçue du backend.");
            
            // Log des données brutes reçues AVANT filtrage
            console.log("Données brutes Navitia reçues (taille) :", response.data?.disruptions?.length);
            // Si vous voulez voir le contenu entier pour le débogage :
            // console.log("Données brutes Navitia reçues :", JSON.stringify(response.data.disruptions, null, 2));


            // Filtrer les disruptions non nulles et celles qui sont actives ou futures
            // Nous allons commenter le filtre pour le débogage afin de voir toutes les données
            // Si vous voyez des disruptions après avoir commenté, alors le problème vient du filtre.
            // const allDisruptions = response.data.disruptions || [];

            // const activeDisruptions = allDisruptions
            //     .filter(d => 
            //         d && d.application_periods && d.application_periods.some(p => new Date(p.end) > new Date())
            //     )
            //     .sort((a, b) => {
            //         // Trier par sévérité (plus grave en premier) puis par date de début
            //         const severityOrder: { [key: string]: number } = { "severe": 1, "major": 2, "minor": 3, "information": 4 };
            //         const severityA = severityOrder[a.severity?.id || "information"] || 99;
            //         const severityB = severityOrder[b.severity?.id || "information"] || 99;

            //         if (severityA !== severityB) {
            //             return severityA - severityB;
            //         }

            //         const beginA = new Date(a.application_periods[0]?.begin || 0).getTime();
            //         const beginB = new Date(b.application_periods[0]?.begin || 0).getTime();
            //         return beginA - beginB;
            //     });
            
            // setDisruptions(activeDisruptions || []);
            // console.log('Nombre de disruptions après filtrage :', activeDisruptions?.length);


            const allDisruptions = response.data.disruptions || [];

// Commentez TEMPORAIREMENT la ligne de filtre pour voir toutes les disruptions reçues
const activeDisruptions = allDisruptions
    // .filter(d => 
    //     d && d.application_periods && d.application_periods.some(p => new Date(p.end) > new Date())
    // )
    .sort((a, b) => {
        // ... votre logique de tri existante ...
        const severityOrder: { [key: string]: number } = { "severe": 1, "major": 2, "minor": 3, "information": 4 };
        const severityA = severityOrder[a.severity?.id || "information"] || 99;
        const severityB = severityOrder[b.severity?.id || "information"] || 99;

        if (severityA !== severityB) {
            return severityA - severityB;
        }

        const beginA = new Date(a.application_periods[0]?.begin || 0).getTime();
        const beginB = new Date(b.application_periods[0]?.begin || 0).getTime();
        return beginA - beginB;
    });

setDisruptions(activeDisruptions || []); // activeDisruptions contiendra maintenant toutes les 25 disruptions
console.log('Nombre de disruptions APRES TRI (mais SANS FILTRE) :', activeDisruptions?.length); // Nouveau log

        } catch (err: any) {
            // Log détaillé de l'erreur
            console.error('Erreur lors de la récupération des infos trafic (frontend):', err);
            console.error('Détails de l\'erreur (response data):', err.response?.data);
            console.error('Détails de l\'erreur (message):', err.message);
            setError('Erreur lors du chargement des informations de trafic. Veuillez réessayer plus tard.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
            console.log("Fin de fetchTrafficInfo.");
        }
    }, []);

    useEffect(() => {
        console.log("useEffect déclenché, appel de fetchTrafficInfo.");
        fetchTrafficInfo();
    }, [fetchTrafficInfo]);

    const onRefresh = useCallback(() => {
        console.log("Rafraîchissement demandé.");
        setRefreshing(true);
        fetchTrafficInfo();
    }, [fetchTrafficInfo]);

    const renderDisruptionItem = ({ item }: { item: NavitiaDisruption }) => {
        // Ajustement pour le type `channel` si c'est un tableau d'objets comme dans votre type.ts
        // Si c'est une simple chaîne, utilisez la ligne commentée en dessous
        // const primaryMessage = item.messages.find(msg => 
        //     msg.channel && msg.channel.some(c => c.name === 'text_message' || c.name === 'public_transport')
        // ) || item.messages[0];
        // Ancienne version si msg.channel est une string:
        const primaryMessage = item.messages.find(msg => msg.channel === 'text_message' || msg.channel === 'public_transport') || item.messages[0];

        const affectedLines = (item.affected_objects 
        ?.filter(obj => obj.pt_object?.line)
        .map(obj => obj.pt_object?.line?.short_name || obj.pt_object?.line?.name)
        .filter(Boolean) // Ce filtre supprime les valeurs nulles/undefined résultant du map
    ) || [];

        const startTime = item.application_periods[0]?.begin ? format(parseISO(item.application_periods[0].begin), 'dd/MM HH:mm', { locale: fr }) : 'N/A';
        const endTime = item.application_periods[0]?.end ? format(parseISO(item.application_periods[0].end), 'dd/MM HH:mm', { locale: fr }) : 'N/A';

        let iconName: keyof typeof Ionicons.glyphMap = 'information-circle-outline';
        let iconColor = '#6B7280'; // Gris par défaut

        if (item.severity) {
            switch (item.severity.id) { // Votre type utilise `id` pour la sévérité (e.g., "severe")
                case 'severe':
                    iconName = 'alert-circle';
                    iconColor = '#DC2626'; // Rouge
                    break;
                case 'major':
                    iconName = 'warning';
                    iconColor = '#F59E0B'; // Orange
                    break;
                case 'minor':
                    iconName = 'information-circle';
                    iconColor = '#0A7EA4'; // Bleu
                    break;
                default:
                    iconName = 'information-circle-outline';
                    iconColor = '#6B7280'; // Gris
            }
        }
        
        return (
            <View style={styles.disruptionCard}>
                <View style={styles.cardHeader}>
                    <Ionicons name={iconName} size={24} color={iconColor} style={styles.cardIcon} />
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.disruptionSeverity, { color: iconColor }]}>
                            {item.severity?.name ? item.severity.name.toUpperCase() : 'INFORMATION'}
                        </Text>
                        {affectedLines.length > 0 && (
                            <Text style={styles.affectedLines}>
                                Ligne(s) concernée(s) : {affectedLines.join(', ')}
                            </Text>
                        )}
                    </View>
                </View>
                <Text style={styles.disruptionMessage}>{primaryMessage?.text || "Pas de message disponible."}</Text>
                <View style={styles.dateContainer}>
                    <Text style={styles.disruptionDate}>Début: {startTime}</Text>
                    <Text style={styles.disruptionDate}>Fin: {endTime}</Text>
                </View>
            </View>
        );
    };

    return (
        // SafeAreaView gère les insets de base.
        // Nous allons utiliser le header natif d'Expo Router pour simplifier la gestion de la barre de statut.
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true, // IMPORTANT : Active le header par défaut d'Expo Router
                    title: 'Infos Trafic', // Ce titre sera affiché dans le header natif
                    // Les styles du header seront gérés dans app/(tabs)/_layout.tsx
                    headerStyle: {
                        backgroundColor: '#0F172A', // Couleur de fond du header
                    },
                    headerTintColor: 'white', // Couleur du texte (titre, boutons retour)
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 20,
                    },
                }}
            />
            {/* Suppression du header personnalisé ici pour laisser Expo Router gérer le header */}
            {/* Le style 'header' et 'headerTitle' dans StyleSheet ne sont plus nécessaires pour cet écran */}

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0EA5E9" />
                    <Text style={styles.loadingText}>Chargement des informations de trafic...</Text>
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
                    <Text style={styles.emptyText}>Aucune perturbation majeure signalée actuellement.</Text>
                </View>
            )}

            {!isLoading && !error && disruptions.length > 0 && (
                <FlatList
                    data={disruptions}
                    renderItem={renderDisruptionItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#0EA5E9']}
                            tintColor={'#0EA5E9'}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Un fond clair
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#6B7280',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#0A7EA4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 15,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 15,
        color: '#9CA3AF',
        fontSize: 16,
        textAlign: 'center',
    },
    listContent: {
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    disruptionCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: 5, 
        borderLeftColor: 'transparent', 
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardIcon: {
        marginRight: 10,
    },
    headerTextContainer: {
        flex: 1,
    },
    disruptionSeverity: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3B82F6', 
    },
    affectedLines: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    disruptionMessage: {
        fontSize: 15,
        color: '#1F2937',
        marginBottom: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    disruptionDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});







// app/traffic-info.tsx

// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//     // ... vos imports existants
// } from 'react-native';
// import { Stack } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { format, parseISO } from 'date-fns';
// import { fr } from 'date-fns/locale'; 
// import { useFocusEffect } from '@react-navigation/native'; // <-- NOUVEL IMPORT

// import apiService from '../../services/apiService'; 
// import { NavitiaDisruption, NavitiaApiResponse } from '../../frontend/src/types'; 

// export default function TrafficInfoScreen() {
//     const [disruptions, setDisruptions] = useState<NavitiaDisruption[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);

//     const fetchTrafficInfo = useCallback(async (autoRefresh = false) => { // <-- Ajout d'un paramètre
//         if (!autoRefresh) { // Si ce n'est pas un rechargement automatique, on met isLoading à true
//             setIsLoading(true);
//         }
//         setError(null);
//         try {
//             // Calculez les dates pour la requête API.
//             // On veut les perturbations d'aujourd'hui et du futur proche.
//             const now = new Date();
//             // Option 1: Perturbations actives à partir de maintenant
//             const fromDateTime = format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", { locale: fr }); // Format ISO 8601 pour le backend

//             // Option 2: Perturbations sur une période spécifique, par exemple les 7 prochains jours
//             // const futureDate = new Date();
//             // futureDate.setDate(now.getDate() + 7);
//             // const untilDateTime = format(futureDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { locale: fr });


//             const response = await apiService.get<NavitiaApiResponse>('/navitia/disruptions', {
//                 params: { // <-- Passez les paramètres ici
//                     count: 200, // Demandez plus de résultats
//                     fromDateTime: fromDateTime,
//                     // untilDateTime: untilDateTime // Décommentez si vous utilisez l'option 2
//                 }
//             });
            
//             const allDisruptions = response.data.disruptions || [];

//             // Décommentez le filtre côté client pour affiner SI votre API backend ne filtre pas assez bien
//             const activeDisruptions = allDisruptions
//                 .filter(d => 
//                     d && d.application_periods && d.application_periods.some(p => {
//                         const beginTime = new Date(p.begin).getTime();
//                         const endTime = p.end ? new Date(p.end).getTime() : Infinity; // Si pas de fin, considérée comme infinie
//                         const currentTime = new Date().getTime();
//                         return currentTime >= beginTime && currentTime <= endTime; // Perturbation active maintenant
//                     })
//                 )
//                 .sort((a, b) => {
//                     const severityOrder: { [key: string]: number } = { "severe": 1, "major": 2, "minor": 3, "information": 4 };
//                     const severityA = severityOrder[a.severity?.id || "information"] || 99;
//                     const severityB = severityOrder[b.severity?.id || "information"] || 99;

//                     if (severityA !== severityB) {
//                         return severityA - severityB;
//                     }

//                     const beginA = new Date(a.application_periods[0]?.begin || 0).getTime();
//                     const beginB = new Date(b.application_periods[0]?.begin || 0).getTime();
//                     return beginA - beginB;
//                 });
            
//             setDisruptions(activeDisruptions || []);
//             console.log('Nombre de disruptions APRES FILTRAGE ET TRI (frontend) :', activeDisruptions?.length);

//         } catch (err: any) {
//             console.error('Erreur lors de la récupération des infos trafic (frontend):', err);
//             setError('Erreur lors du chargement des informations de trafic. Veuillez réessayer plus tard.');
//         } finally {
//             setIsLoading(false);
//             setRefreshing(false);
//         }
//     }, []); // Dépendances vides car `fromDateTime` et `untilDateTime` sont calculées à l'intérieur de la fonction


//     // Ancien useEffect pour le chargement initial
//     // useEffect(() => {
//     //     console.log("useEffect déclenché, appel de fetchTrafficInfo pour le chargement initial.");
//     //     fetchTrafficInfo();
//     // }, [fetchTrafficInfo]);

//     // Nouveau : useFocusEffect pour recharger quand l'écran est mis au point (focus)
//     useFocusEffect(
//         useCallback(() => {
//             console.log("TrafficInfoScreen est mis au point, rechargement des données.");
//             // On appelle fetchTrafficInfo sans changer l'état isLoading si on est déjà en train de charger
//             // et on passe true pour autoRefresh pour ne pas afficher le spinner de chargement initial.
//             fetchTrafficInfo(true); 
//             return () => {
//                 // Optionnel: code de nettoyage quand l'écran perd le focus
//                 console.log("TrafficInfoScreen perd le focus.");
//             };
//         }, [fetchTrafficInfo])
//     );


//     const onRefresh = useCallback(() => {
//         console.log("Rafraîchissement manuel demandé.");
//         setRefreshing(true);
//         fetchTrafficInfo(); // Le rafraîchissement manuel doit afficher le spinner initial
//     }, [fetchTrafficInfo]);

//     // ... le reste de votre composant (renderDisruptionItem et le return principal)
// }