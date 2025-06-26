import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  Alert, StyleSheet, Modal, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import authService from '@/services/authService';

// ==================== TYPES ====================
interface TypeProbleme {
  id: string;
  libelle: string;
  icone: string;
  couleur: string;
}

interface TypeTransport {
  id: string;
  libelle: string;
  icone: string;
  filtre: string;
}

interface LigneTransport {
  id_line: string;
  shortname_line: string;
  name_line: string;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
  transportmode: string;
  operatorname: string;
}

// ==================== DONNÉES STATIQUES ====================
const typesProblemes: TypeProbleme[] = [
  { id: 'Proprete', libelle: 'Propreté', icone: 'trash', couleur: '#F59E0B' },
  { id: 'Equipement', libelle: 'Équipement', icone: 'construct', couleur: '#DC2626' },
  { id: 'Surcharge', libelle: 'Surcharge', icone: 'people', couleur: '#F97316' },
  { id: 'Retard', libelle: 'Retard', icone: 'time', couleur: '#0A7EA4' },
  { id: 'Securite', libelle: 'Sécurité', icone: 'shield-checkmark', couleur: '#6B46C1' },
  { id: 'Autre', libelle: 'Autre', icone: 'ellipsis-horizontal', couleur: '#64748B' },
];

const typesTransport: TypeTransport[] = [
  { id: 'rer', libelle: 'RER', icone: 'train', filtre: 'transportmode="rail"' },
  { id: 'metro', libelle: 'Métro', icone: 'subway', filtre: 'transportmode="metro"' },
  { id: 'tram', libelle: 'Tramway', icone: 'car', filtre: 'transportmode="tram"' },
  { id: 'bus', libelle: 'Bus', icone: 'bus', filtre: 'transportmode="bus"' },
];

// ==================== COMPOSANT PRINCIPAL ====================
export default function EcranSignalement() {
  // États du formulaire
  const [typeSelectionne, setTypeSelectionne] = useState<string>('');
  const [description, setDescription] = useState('');
  const [typeTransportSelectionne, setTypeTransportSelectionne] = useState<string>('');
  const [ligneSelectionnee, setLigneSelectionnee] = useState<LigneTransport | null>(null);
  const [localisation, setLocalisation] = useState<Location.LocationObject | null>(null);
  
  // États des modales
  const [modaleTransportVisible, setModaleTransportVisible] = useState(false);
  const [modaleLigneVisible, setModaleLigneVisible] = useState(false);
  
  // États pour les données
  const [listeLignes, setListeLignes] = useState<LigneTransport[]>([]);
  const [enChargement, setEnChargement] = useState(false);

  // ==================== FONCTION DE RÉCUPÉRATION DES LIGNES CORRIGÉE ====================
  const chargerLignes = async (transportId: string) => {
    setEnChargement(true);
    console.log('🚀 Début chargement lignes pour:', transportId);
    
    try {
      const typeTransport = typesTransport.find(t => t.id === transportId);
      if (!typeTransport) {
        throw new Error(`Type de transport non trouvé: ${transportId}`);
      }

      console.log('📡 Filtre utilisé:', typeTransport.filtre);
      
      // URL corrigée avec encodage proper
      const filtre = encodeURIComponent(typeTransport.filtre);
      const url = `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/records?where=${filtre}&select=id_line,shortname_line,name_line,colourweb_hexa,textcolourweb_hexa,transportmode,operatorname&limit=100`;
      
      console.log('🌐 URL API:', url);
      
      // Timeout pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes max
      
      const reponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Statut réponse:', reponse.status);
      
      if (!reponse.ok) {
        throw new Error(`Erreur HTTP: ${reponse.status} - ${reponse.statusText}`);
      }
      
      const data = await reponse.json();
      console.log('📦 Données reçues:', data);
      
      if (!data.results || !Array.isArray(data.results)) {
        console.warn('⚠️ Structure de données inattendue:', data);
        setListeLignes([]);
        return;
      }
      
      console.log('📈 Nombre de résultats bruts:', data.results.length);
      
      // Traitement des données avec gestion d'erreurs robuste
      const lignes = data.results
        .map((item: any, index: number) => {
          try {
            // Gérer les différentes structures possibles
            let ligne = null;
            
            if (item.record?.fields) {
              ligne = item.record.fields;
            } else if (item.fields) {
              ligne = item.fields;
            } else if (item.id_line || item.shortname_line || item.name_line) {
              ligne = item;
            }
            
            if (!ligne) {
              console.warn(`⚠️ Structure non reconnue pour l'item ${index}:`, item);
              return null;
            }
            
            // Validation des champs essentiels
            if (!ligne.id_line && !ligne.shortname_line && !ligne.name_line) {
              console.warn(`⚠️ Ligne sans identifiant valide à l'index ${index}:`, ligne);
              return null;
            }
            
            // Nettoyer les couleurs (supprimer # si présent)
            if (ligne.colourweb_hexa && ligne.colourweb_hexa.startsWith('#')) {
              ligne.colourweb_hexa = ligne.colourweb_hexa.substring(1);
            }
            if (ligne.textcolourweb_hexa && ligne.textcolourweb_hexa.startsWith('#')) {
              ligne.textcolourweb_hexa = ligne.textcolourweb_hexa.substring(1);
            }
            
            return ligne;
          } catch (e) {
            console.error(`❌ Erreur traitement item ${index}:`, e);
            return null;
          }
        })
        .filter(Boolean) // Supprimer les éléments null
        .sort((a, b) => {
          // Trier par nom court puis par nom complet
          const nameA = a.shortname_line || a.name_line || '';
          const nameB = b.shortname_line || b.name_line || '';
          return nameA.localeCompare(nameB);
        });
      
      console.log('✅ Lignes traitées:', lignes.length);
      console.log('🔍 Aperçu des lignes:', lignes.slice(0, 3));
      
      setListeLignes(lignes);
      
      if (lignes.length === 0) {
        Alert.alert(
          'Information', 
          `Aucune ligne ${typeTransport.libelle} trouvée. Veuillez réessayer.`
        );
      }
      
    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      let messageErreur = 'Erreur inconnue';
      
      if (error.name === 'AbortError') {
        messageErreur = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
      } else if (error.message.includes('Network request failed')) {
        messageErreur = 'Problème de connexion réseau';
      } else if (error.message.includes('HTTP')) {
        messageErreur = `Erreur serveur: ${error.message}`;
      } else {
        messageErreur = error.message || 'Erreur lors du chargement des lignes';
      }
      
      Alert.alert(
        'Erreur de chargement', 
        messageErreur,
        [
          { text: 'Réessayer', onPress: () => chargerLignes(transportId) },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
      
      setListeLignes([]);
    } finally {
      setEnChargement(false);
      console.log('🏁 Fin chargement lignes');
    }
  };

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS CORRIGÉS ====================
  const gererSelectionTransport = async (transportId: string) => {
    console.log('🎯 Sélection transport:', transportId);
    
    try {
      setTypeTransportSelectionne(transportId);
      setLigneSelectionnee(null);
      setModaleTransportVisible(false);
      
      // Petite pause pour laisser l'UI se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Charger les lignes
      await chargerLignes(transportId);
      
      // Ouvrir la modale des lignes seulement si on a des résultats
      setModaleLigneVisible(true);
      
    } catch (error) {
      console.error('❌ Erreur sélection transport:', error);
      Alert.alert('Erreur', 'Problème lors de la sélection du transport');
    }
  };

  const gererSelectionLigne = (ligne: LigneTransport) => {
    setLigneSelectionnee(ligne);
    setModaleLigneVisible(false);
  };

  const obtenirLocalisation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Impossible d\'accéder à votre localisation');
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    setLocalisation(position);
  };

  const soumettreSignalement = async () => {
  if (!typeSelectionne || !description || !ligneSelectionnee || !localisation) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
    return;
  }

  setEnChargement(true);

  try {
    const ticketData = {

      type: typeSelectionne,


      transportLine: {
        id_line: ligneSelectionnee.id_line,
        name_line: ligneSelectionnee.name_line,
        transportmode: ligneSelectionnee.transportmode,
      },

   
      description: description,

  
      location: localisation ? {
        latitude: localisation.coords.latitude,
        longitude: localisation.coords.longitude,
       
      } : null, 

   
    };

  
    const backendUrl = 'http://192.168.1.140:3000/api/tickets'; 

    const token = await authService.getToken(); 
    if (!token) {
        throw new Error('Aucun token d\'authentification trouvé. Veuillez vous connecter.');
    }

    const reponseBackend = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify(ticketData),
    });

    if (!reponseBackend.ok) {
      const errorData = await reponseBackend.json();
      throw new Error(errorData.message || `Erreur serveur: ${reponseBackend.statusText}`);
    }

    const resultat = await reponseBackend.json();
    console.log('Ticket envoyé avec succès:', resultat);

    Alert.alert(
      'Succès',
      'Votre signalement a été envoyé avec succès !',
      [{ text: 'OK', onPress: reinitialiserFormulaire }]
    );

  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du signalement:', error);
    Alert.alert(
      'Erreur d\'envoi',
      error.message || 'Impossible d\'envoyer votre signalement. Veuillez réessayer.',
      [{ text: 'OK' }]
    );
  } finally {
    setEnChargement(false);
  }
};

  const reinitialiserFormulaire = () => {
    setTypeSelectionne('');
    setDescription('');
    setTypeTransportSelectionne('');
    setLigneSelectionnee(null);
    setLocalisation(null);
  };

  // ==================== FONCTIONS DE STYLE DYNAMIQUE ====================
  const obtenirStyleBoutonProbleme = (typeId: string) => {
    const type = typesProblemes.find(t => t.id === typeId);
    return typeSelectionne === typeId
      ? [styles.boutonProbleme, { backgroundColor: type?.couleur, borderColor: type?.couleur }]
      : styles.boutonProbleme;
  };

  const obtenirStyleTexteProbleme = (typeId: string) => {
    return typeSelectionne === typeId ? styles.texteProblemeSelectionne : styles.texteProbleme;
  };

  // ==================== COMPOSANTS DE RENDU ====================
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
                onPress={() => gererSelectionTransport(type.id)}
                style={styles.boutonTypeTransport}
              >
                <View style={styles.iconeTypeTransport}>
                  <Ionicons name={type.icone as any} size={24} color="#1E293B" />
                </View>
                <Text style={styles.texteTypeTransport}>{type.libelle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

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
              Lignes {typesTransport.find(t => t.id === typeTransportSelectionne)?.libelle}
            </Text>
            <TouchableOpacity onPress={() => setModaleLigneVisible(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {enChargement ? (
            <View style={styles.conteneurChargement}>
              <ActivityIndicator size="large" color="#0EA5E9" />
              <Text style={styles.texteChargement}>Chargement des lignes...</Text>
            </View>
          ) : (
            <ScrollView style={styles.conteneurLignes} showsVerticalScrollIndicator={false}>
              <View style={styles.grilleLignes}>
                {listeLignes.length > 0 ? (
                  listeLignes.map((ligne, index) => (
                    <TouchableOpacity
                      key={ligne.id_line || `ligne-${index}`}
                      onPress={() => gererSelectionLigne(ligne)}
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
                  ))
                ) : (
                  <Text style={styles.texteAucuneLigne}>
                    Aucune ligne disponible pour ce transport
                  </Text>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // ==================== RENDU PRINCIPAL ====================
  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.arrierePlan}>
        <View style={styles.formeDecorative1} />
        <View style={styles.formeDecorative2} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View style={styles.entete}>
            <Text style={styles.titrePrincipal}>Signaler un problème</Text>
            <Text style={styles.sousTitre}>Aidez-nous à améliorer votre voyage</Text>
          </View>

          {/* Section Type de problème */}
          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
               Type de problème <Text style={styles.obligatoire}>*</Text>
            </Text>
            <View style={styles.conteneurProblemes}>
              {typesProblemes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setTypeSelectionne(type.id)}
                  style={obtenirStyleBoutonProbleme(type.id)}
                >
                  <Ionicons
                    name={type.icone as any}
                    size={18}
                    color={typeSelectionne === type.id ? 'white' : '#64748B'}
                  />
                  <Text style={obtenirStyleTexteProbleme(type.id)}>
                    {type.libelle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section Ligne de transport */}
          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
              Ligne de transport <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setModaleTransportVisible(true)}
              style={styles.selecteurTransport}
            >
              <View style={styles.contenuSelecteur}>
                {ligneSelectionnee ? (
                  <View style={styles.conteneurLigneSelectionnee}>
                    <View style={[
                      styles.badgeLigne,
                      { backgroundColor: ligneSelectionnee.colourweb_hexa ? `#${ligneSelectionnee.colourweb_hexa}` : '#0EA5E9' }
                    ]}>
                      <Text style={[
                        styles.texteBadgeLigne,
                        { color: ligneSelectionnee.textcolourweb_hexa ? `#${ligneSelectionnee.textcolourweb_hexa}` : 'white' }
                      ]}>
                        {ligneSelectionnee.shortname_line || 'N/A'}
                      </Text>
                    </View>
                    <Text style={styles.detailsLigne} numberOfLines={1}>
                      {ligneSelectionnee.name_line || 'Nom non disponible'}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="train" size={20} color="#64748B" />
                    <Text style={styles.texteSelecteur}>Sélectionner une ligne</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Section Description */}
          <View style={styles.section}>
            <Text style={styles.titreSectionIcone}>
               Description <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez le problème en détail..."
              multiline
              numberOfLines={4}
              style={styles.champTexte}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Section Localisation */}
          <View style={styles.section}>
            <Text 
            style={styles.titreSectionIcone}> Localisation <Text style={styles.obligatoire}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={obtenirLocalisation}
              style={styles.boutonLocalisation}
            >
              <View style={styles.contenuBoutonLocalisation}>
                <Ionicons name="location" size={20} color="#64748B" />
                <Text style={styles.texteBoutonLocalisation}>
                  {localisation ? 'Position capturée ✓' : 'Capturer ma position'}
                </Text>
              </View>
              {localisation && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
            </TouchableOpacity>
          </View>

          {/* Bouton de soumission */}
          <TouchableOpacity
            onPress={soumettreSignalement}
            style={styles.boutonSoumission}
          >
            <Text style={styles.texteBoutonSoumission}>
               Envoyer le signalement
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <ModalTransport />
        <ModaleLigne />
      </View>
    </SafeAreaView>
  );
}

// ==================== STYLES OPTIMISÉS ====================
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
  conteneurProblemes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  boutonProbleme: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  texteProbleme: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#64748B',
    fontSize: 14,
  },
  texteProblemeSelectionne: {
    marginLeft: 8,
    fontWeight: '700',
    color: 'white',
    fontSize: 14,
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
  // Styles des modales
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
  conteneurChargement: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  texteChargement: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
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
});