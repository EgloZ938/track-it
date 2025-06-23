import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import * as Location from 'expo-location';

// TYPES 
type TypeProbleme = {
  id: string;
  libelle: string;
  icone: string;
  couleur: string;
};


type TypeTransport = {
  id: string;
  libelle: string;
  icone: string;
  filtre: string;
};

type LigneTransport = {
  id_line: string;
  shortname_line: string;
  name_line: string;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
  transportmode: string;
  operatorname: string;
};


// Liste des types de problèmes
const typesProbleme: TypeProbleme[] = [
  { id: 'proprete', libelle: 'Propreté', icone: 'trash', couleur: '#F59E0B' },
  { id: 'equipement', libelle: 'Équipement HS', icone: 'construct', couleur: '#DC2626' },
  { id: 'surcharge', libelle: 'Surcharge', icone: 'people', couleur: '#F97316' },
  { id: 'retard', libelle: 'Retard', icone: 'time', couleur: '#0A7EA4' },
  { id: 'securite', libelle: 'Sécurité', icone: 'shield-checkmark', couleur: '#6B46C1' },
  { id: 'autre', libelle: 'Autre', icone: 'ellipsis-horizontal', couleur: '#6B7280' },
];

// Liste des types de transport
const typesTransport: TypeTransport[] = [
  { id: 'rer', libelle: 'RER', icone: 'train', filtre: 'transportmode="rail"' },
  { id: 'metro', libelle: 'Métro', icone: 'subway', filtre: 'transportmode="metro"' },
  { id: 'tram', libelle: 'Tramway', icone: 'car', filtre: 'transportmode="tram"' },
  { id: 'bus', libelle: 'Bus', icone: 'bus', filtre: 'transportmode="bus"' },
];


export default function EcranSignalement() {
  // État de la sélection du problème
  const [typeProblemeSelectionne, setTypeProblemeSelectionne] = useState<string>('');
  // État de la description
  const [description, setDescription] = useState<string>('');
  // État du type de transport sélectionné
  const [typeTransportSelectionne, setTypeTransportSelectionne] = useState<string>('');
  // État de la ligne choisie
  const [ligneSelectionnee, setLigneSelectionnee] = useState<LigneTransport | null>(null);
  // États des modals
  const [afficheModalTransport, setAfficheModalTransport] = useState(false);
  const [afficheModalLignes, setAfficheModalLignes] = useState(false);
  // État de la liste des lignes à afficher
  const [listeLignes, setListeLignes] = useState<LigneTransport[]>([]);
  // État de chargement
  const [enChargement, setEnChargement] = useState(false);
  // État de la position
  const [localisation, setLocalisation] = useState<Location.LocationObject | null>(null);

  //  FONCTION DE RÉCUPÉRATION DES LIGNES 
  const chargerLignes = async (transportId: string) => {
    setEnChargement(true);
    try {
      const filtre = typesTransport.find(t => t.id === transportId)?.filtre;
      const url = `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/records?where=${filtre}&select=id_line,shortname_line,name_line,colourweb_hexa,textcolourweb_hexa,transportmode,operatorname&limit=200`;
      const reponse = await fetch(url);
      const data = await reponse.json();

      if (data.results) {
        setListeLignes(data.results.filter((ligne: any) => ligne.shortname_line));
      }
    } catch (e: any) {
      Alert.alert('Erreur', `Impossible de charger les lignes : ${e.message}`);
    } finally {
      setEnChargement(false);
    }
  };

  //  SÉLECTION D'UN TRANSPORT 
  const choisirTransport = (transportId: string) => {
    setTypeTransportSelectionne(transportId);
    setLigneSelectionnee(null);
    setAfficheModalTransport(false);
    chargerLignes(transportId);
    setAfficheModalLignes(true);
  };

  //  SÉLECTION D'UNE LIGNE 
  const choisirLigne = (ligne: LigneTransport) => {
    setLigneSelectionnee(ligne);
    setAfficheModalLignes(false);
  };

  //  RÉCUPÉRATION DE LA LOCALISATION 
  const obtenirLocalisation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Impossible d’accéder à votre position.');
      return;
    }
    let position = await Location.getCurrentPositionAsync({});
    setLocalisation(position);
  };

  //  ENVOI DU SIGNALMENT 
  const envoyerSignalement = () => {
    if (!typeProblemeSelectionne || !description || !ligneSelectionnee) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs.');
      return;
    }

    Alert.alert('Succès', 'Signalement envoyé !', [{ text: 'OK', onPress: reinitialiserForm }]);
  };

  const reinitialiserForm = () => {
    setTypeProblemeSelectionne('');
    setDescription('');
    setTypeTransportSelectionne('');
    setLigneSelectionnee(null);
    setLocalisation(null);
  };

  //  RENDU DU MODAL DES TYPES DE TRANSPORT 
  const ModalTypesTransport = () => (
    <Modal visible={afficheModalTransport} transparent animationType="fade">
      <View style={styles.modalFond}>
        <View style={styles.modalContenu}>
          <Text style={styles.modalTitre}>Choisir le mode de transport</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.listeTypesTransport}
            showsHorizontalScrollIndicator={false}
          >
            {typesTransport.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.boutonTypeTransport}
                onPress={() => choisirTransport(type.id)}
              >
                <Ionicons name={type.icone as any} size={28} color="#1a2332" />
                <Text style={styles.texteTypeTransport}>{type.libelle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setAfficheModalTransport(false)}>
            <Ionicons name="close" size={24} color="#666" style={{ marginTop: 10 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  //  RENDU DU MODAL DES LIGNES 
  const ModalLignes = () => (
    <Modal visible={afficheModalLignes} transparent animationType="fade">
      <View style={styles.modalFond}>
        <View style={styles.modalContenuLignes}>
          <Text style={styles.modalTitre}>Lignes {typeTransportSelectionne.toUpperCase()}</Text>
          {enChargement ? (
            <ActivityIndicator color="#0A7EA4" size="large" />
          ) : (
            <ScrollView style={styles.scrollLignes}>
              {listeLignes.map((ligne) => (
                <TouchableOpacity
                  key={ligne.id_line}
                  style={[styles.boutonLigne, { backgroundColor: `#${ligne.colourweb_hexa}` }]}
                  onPress={() => choisirLigne(ligne)}
                >
                  <Text
                    style={[
                      styles.texteLigne,
                      { color: `#${ligne.textcolourweb_hexa}` }
                    ]}
                  >
                    {ligne.shortname_line} - {ligne.name_line}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity onPress={() => setAfficheModalLignes(false)}>
            <Ionicons name="close" size={24} color="#666" style={{ marginTop: 10 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  //  RENDU DE L'ÉCRAN 
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollConteneur} showsVerticalScrollIndicator={false}>

        {/* TITRE */}
        <Text style={styles.titre}>Signaler un problème</Text>
        <Text style={styles.sousTitre}>Votre avis nous aide à améliorer le service</Text>

        {/* TYPES DE PROBLÈME */}
        <Text style={styles.sectionTitre}>Type de problème</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollTypesProbleme}>
          {typesProbleme.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setTypeProblemeSelectionne(type.id)}
              style={[
                styles.boutonTypeProbleme,
                typeProblemeSelectionne === type.id && { backgroundColor: type.couleur }
              ]}
            >
              <Ionicons
                name={type.icone as any}
                size={24}
                color={typeProblemeSelectionne === type.id ? 'white' : '#4B5563'}
              />
              <Text style={[
                styles.texteBoutonProbleme,
                typeProblemeSelectionne === type.id && { color: 'white' }
              ]}>{type.libelle}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TRANSPORT */}
        <Text style={styles.sectionTitre}>Ligne de transport</Text>
        <TouchableOpacity style={styles.boutonChoisirLigne} onPress={() => setAfficheModalTransport(true)}>
          {ligneSelectionnee ? (
            <View style={styles.choixLigne}>
              <View style={[
                styles.badgeLigne,
                { backgroundColor: `#${ligneSelectionnee.colourweb_hexa}` }
              ]}>
                <Text style={{ color: `#${ligneSelectionnee.textcolourweb_hexa}` }}>{ligneSelectionnee.shortname_line}</Text>
              </View>
              <Text style={styles.nomLigne}>{ligneSelectionnee.name_line}</Text>
            </View>
          ) : (
            <Text style={styles.texteBoutonChoisir}>Choisir une ligne de transport</Text>
          )}
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {/* DESCRIPTION */}
        <Text style={styles.sectionTitre}>Description</Text>
        <TextInput
          style={styles.inputDescription}
          multiline
          numberOfLines={4}
          placeholder="Détaillez le problème ici…"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
        />

        {/* LOCALISATION */}
        <Text style={styles.sectionTitre}>Localisation</Text>
        <TouchableOpacity style={styles.boutonLocalisation} onPress={obtenirLocalisation}>
          <Ionicons name="location" size={24} color="#666" />
          <Text style={styles.texteBoutonLocalisation}>{localisation ? 'Localisation capturée' : 'Capturer ma position'}</Text>
          {localisation && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
        </TouchableOpacity>

        {/* ENVOI */}
        <TouchableOpacity style={styles.boutonEnvoyer} onPress={envoyerSignalement}>
          <Text style={styles.texteBoutonEnvoyer}>Envoyer le signalement</Text>
        </TouchableOpacity>

      </ScrollView>
      <ModalTypesTransport />
      <ModalLignes />
    </SafeAreaView>
  );
}

//  STYLES 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2332' },
  scrollConteneur: { paddingHorizontal: 16, paddingVertical: 24 },
  titre: { fontSize: 28, color: 'white', fontWeight: '800', marginBottom: 8 },
  sousTitre: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 24 },
  sectionTitre: { fontSize: 18, color: 'white', fontWeight: '600', marginBottom: 12, marginTop: 20 },

  scrollTypesProbleme: { flexDirection: 'row', paddingBottom: 8 },

  boutonTypeProbleme: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10
  },
  texteBoutonProbleme: { marginLeft: 8, color: '#4B5563', fontWeight: '600' },

  boutonChoisirLigne: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  choixLigne: { flexDirection: 'row', alignItems: 'center' },
  badgeLigne: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  nomLigne: { color: '#1a2332', fontWeight: '600' },
  texteBoutonChoisir: { color: '#4B5563', fontWeight: '500' },

  inputDescription: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    minHeight: 100,
    color: '#1a2332',
    textAlignVertical: 'top'
  },

  boutonLocalisation: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  texteBoutonLocalisation: { marginLeft: 8, color: '#4B5563', fontWeight: '500' },

  boutonEnvoyer: {
    backgroundColor: '#0A7EA4',
    paddingVertical: 18,
    borderRadius: 14,
    marginVertical: 24
  },
  texteBoutonEnvoyer: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 18 },

  modalFond: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContenu: { backgroundColor: 'white', padding: 20, borderRadius: 16, width: '90%' },
  modalTitre: { fontSize: 18, fontWeight: 'bold', color: '#1a2332', marginBottom: 12 },

  listeTypesTransport: { flexDirection: 'row', paddingVertical: 12 },
  boutonTypeTransport: { alignItems: 'center', paddingHorizontal: 12 },
  texteTypeTransport: { color: '#1a2332', fontWeight: '600', marginTop: 8 },

  modalContenuLignes: { backgroundColor: 'white', padding: 20, borderRadius: 16, width: '90%' },
  scrollLignes: { maxHeight: 400 },
  boutonLigne: { padding: 12, borderRadius: 12, marginVertical: 4 },
  texteLigne: { color: 'white', fontWeight: 'bold' },
});
