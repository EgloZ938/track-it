// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import api from '@/services/apiService'; // Assurez-vous que apiService est correctement configuré
// import authService from '@/services/authService';

// interface LigneTransport {
//   id_line: string;
//   name_line: string;
//   shortname_line: string;
//   transportmode: string;
//   operatorname: string;
//   colourweb_hexa: string;
//   textcolourweb_hexa: string;
// }

// interface StopPointIDFM {
//   id_stop_point: string;
//   name_stop_point: string;
//   coord_x: number;
//   coord_y: number;
// }

// interface DelayTicket {
//   _id: string;
//   userId: string;
//   transportLine: LigneTransport;
//   stopPoint: StopPointIDFM;
//   description: string;
//   location: {
//     latitude: number;
//     longitude: number;
//   };
//   distanceFromStop: number;
//   // Le statut a été entièrement retiré de l'interface
//   createdAt: string;
//   updatedAt: string;
// }

// const DelayTicketDetailScreen = () => {
//   const { id } = useLocalSearchParams(); // Récupère l'ID du ticket depuis l'URL
//   const [delayTicket, setDelayTicket] = useState<DelayTicket | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchDelayTicket = useCallback(async () => {
//     if (!id) {
//       setLoading(false);
//       Alert.alert('Erreur', 'ID du ticket manquant.');
//       router.back();
//       return;
//     }

//     const loggedIn = await authService.isAuthenticated();
//     if (!loggedIn) {
//       setLoading(false);
//       Alert.alert('Non connecté', 'Veuillez vous connecter pour voir les détails du ticket.');
//       router.replace('/login');
//       return;
//     }

//     try {
//       const response = await api.get(`/delaytickets/${id}`);
//       if (response.data) {
//         setDelayTicket(response.data);
//       } else {
//         Alert.alert('Erreur', 'Ticket de retard non trouvé.');
//         router.back();
//       }
//     } catch (error: any) {
//       console.error('Erreur lors de la récupération du ticket de retard:', error.response?.data || error.message);
//       Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les détails du ticket.');
//       router.back();
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchDelayTicket();
//   }, [fetchDelayTicket]);

//   // Les fonctions getStatusColor et getStatusLabel ont été supprimées.

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0EA5E9" />
//         <Text style={styles.loadingText}>Chargement du ticket...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!delayTicket) {
//     return (
//       <SafeAreaView style={styles.emptyContainer}>
//         <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
//         <Text style={styles.emptyText}>Impossible de charger les détails du ticket.</Text>
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Text style={styles.backButtonText}>Retour</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.mainTitle}>Détails du Retard</Text>
//         <View style={styles.placeholderIcon} />
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
//         <View style={styles.card}>
//           {/* La ligne 'Statut' a été supprimée */}

//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Type de transport :</Text>
//             <View style={styles.transportInfo}>
//               <Ionicons
//                 name={
//                   delayTicket.transportLine.transportmode === 'bus' ? 'bus' :
//                   delayTicket.transportLine.transportmode === 'metro' ? 'subway' :
//                   delayTicket.transportLine.transportmode === 'tram' ? 'car' :
//                   'train' // Default for 'rail' or others
//                 }
//                 size={20}
//                 color={delayTicket.transportLine.colourweb_hexa || '#0EA5E9'}
//               />
//               <Text style={styles.value}>{delayTicket.transportLine.transportmode.toUpperCase()}</Text>
//             </View>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Ligne :</Text>
//             <View style={styles.lineInfo}>
//               <View style={[styles.badgeLigne, { backgroundColor: delayTicket.transportLine.colourweb_hexa || '#0EA5E9' }]}>
//                 <Text style={[styles.texteBadgeLigne, { color: delayTicket.transportLine.textcolourweb_hexa || '#FFFFFF' }]}>
//                   {delayTicket.transportLine.shortname_line}
//                 </Text>
//               </View>
//               <Text style={styles.value}>{delayTicket.transportLine.name_line}</Text>
//             </View>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Station :</Text>
//             <View style={[styles.value, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }]}>
//               <Ionicons name="location" size={16} color="#0EA5E9" />
//               <Text style={{ marginLeft: 5, color: '#1E293B', fontSize: 16 }}>{delayTicket.stopPoint.name_stop_point}</Text>
//             </View>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Description du retard :</Text>
//             <Text style={styles.value}>{delayTicket.description}</Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Distance de l'arrêt :</Text>
//             <Text style={styles.value}>{delayTicket.distanceFromStop} mètres</Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Déclaré le :</Text>
//             <Text style={styles.value}>{new Date(delayTicket.createdAt).toLocaleDateString('fr-FR')} à {new Date(delayTicket.createdAt).toLocaleTimeString('fr-FR')}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Text style={styles.label}>Dernière mise à jour :</Text>
//             <Text style={styles.value}>{new Date(delayTicket.updatedAt).toLocaleDateString('fr-FR')} à {new Date(delayTicket.updatedAt).toLocaleTimeString('fr-FR')}</Text>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },

//          backgroundShapes: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         zIndex: 0,
//     },

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#64748B',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#64748B',
//     textAlign: 'center',
//     marginTop: 15,
//     marginBottom: 20,
//   },
//   backButton: {
//     backgroundColor: '#0EA5E9',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 25,
//     marginTop: 10,
//   },
//   backButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: 20,
//     backgroundColor: '#0F172A',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   backButtonHeader: {
//     padding: 5,
//   },
//   mainTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: 'white',
//     textAlign: 'center',
//     flex: 1,
//   },
//   placeholderIcon: {
//     width: 24, // Pour équilibrer l'espace du bouton retour
//   },
//   scrollViewContent: {
//     padding: 20,
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#475569',
//     flex: 1,
//   },
//   value: {
//     fontSize: 16,
//     color: '#1E293B',
//     textAlign: 'right',
//     flex: 2,
//   },
//   // statusBadge et statusText ont été supprimés des styles
//   transportInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     flex: 2,
//   },
//   lineInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     flex: 2,
//   },
//   badgeLigne: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 15,
//     marginRight: 10,
//   },
//   texteBadgeLigne: {
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });

// export default DelayTicketDetailScreen;


import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

const DelayTicketDetailScreen = () => {
  const { id } = useLocalSearchParams(); // Récupère l'ID du ticket depuis l'URL
  const [delayTicket, setDelayTicket] = useState<DelayTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDelayTicket = useCallback(async () => {
    if (!id) {
      setLoading(false);
      Alert.alert('Erreur', 'ID du ticket manquant.');
      router.back();
      return;
    }

    const loggedIn = await authService.isAuthenticated();
    if (!loggedIn) {
      setLoading(false);
      Alert.alert('Non connecté', 'Veuillez vous connecter pour voir les détails du ticket.');
      router.replace('/login');
      return;
    }

    try {
      const response = await api.get(`/delaytickets/${id}`);
      if (response.data) {
        setDelayTicket(response.data);
      } else {
        Alert.alert('Erreur', 'Ticket de retard non trouvé.');
        router.back();
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération du ticket de retard:', error.response?.data || error.message);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les détails du ticket.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDelayTicket();
  }, [fetchDelayTicket]);

  // Fonction utilitaire pour formater les dates de manière sûre
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Vérifie si la date est invalide
      return 'Date invalide';
    }
    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Chargement du ticket...</Text>
      </SafeAreaView>
    );
  }

  if (!delayTicket) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
        <Text style={styles.emptyText}>Impossible de charger les détails du ticket.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Détails du Retard</Text>
        <View style={styles.placeholderIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type de transport :</Text>
            <View style={styles.transportInfo}>
              <Ionicons
                name={
                  (delayTicket.transportLine?.transportmode === 'bus' ? 'bus' :
                  delayTicket.transportLine?.transportmode === 'metro' ? 'subway' :
                  delayTicket.transportLine?.transportmode === 'tram' ? 'car' :
                  'train') || 'train' // Default for 'rail' or others
                }
                size={20}
                color={delayTicket.transportLine?.colourweb_hexa || '#0EA5E9'}
              />
              <Text style={styles.value}>
                {(delayTicket.transportLine?.transportmode || '').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Ligne :</Text>
            <View style={styles.lineInfo}>
              <View style={[styles.badgeLigne, { backgroundColor: delayTicket.transportLine?.colourweb_hexa || '#0EA5E9' }]}>
                <Text style={[styles.texteBadgeLigne, { color: delayTicket.transportLine?.textcolourweb_hexa || '#FFFFFF' }]}>
                  {delayTicket.transportLine?.shortname_line || ''}
                </Text>
              </View>
              <Text style={styles.value}>{delayTicket.transportLine?.name_line || ''}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Station :</Text>
            <View style={[styles.value, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }]}>
              <Ionicons name="location" size={16} color="#0EA5E9" />
              <Text style={{ marginLeft: 5, color: '#1E293B', fontSize: 16 }}>
                {delayTicket.stopPoint?.name_stop_point || ''}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Description du retard :</Text>
            <Text style={styles.value}>{delayTicket.description || ''}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Distance de l'arrêt :</Text>
            <Text style={styles.value}>{String(delayTicket.distanceFromStop || 0)} mètres</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Déclaré le :</Text>
            <Text style={styles.value}>{formatDate(delayTicket.createdAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Dernière mise à jour :</Text>
            <Text style={styles.value}>{formatDate(delayTicket.updatedAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  backgroundShapes: { // Ce style n'est pas utilisé dans le JSX fourni
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
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
  backButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#0F172A',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  backButtonHeader: {
    padding: 5,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  placeholderIcon: {
    width: 24, // Pour équilibrer l'espace du bouton retour
  },
  scrollViewContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'right',
    flex: 2,
  },
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  lineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  badgeLigne: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  texteBadgeLigne: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DelayTicketDetailScreen;