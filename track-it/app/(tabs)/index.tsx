import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type ProblemType = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

const problemTypes: ProblemType[] = [
  { id: 'cleanliness', label: 'Propreté', icon: 'trash', color: '#F59E0B' },
  { id: 'equipment', label: 'Équipement défectueux', icon: 'construct', color: '#DC2626' },
  { id: 'overcrowding', label: 'Surcharge', icon: 'people', color: '#F97316' },
  { id: 'delay', label: 'Retard', icon: 'time', color: '#0A7EA4' },
  { id: 'safety', label: 'Sécurité', icon: 'shield-checkmark', color: '#6B46C1' },
  { id: 'other', label: 'Autre', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [transportLine, setTransportLine] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Impossible d\'accéder à votre localisation');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const handleSubmit = () => {
    if (!selectedType || !description || !transportLine) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    Alert.alert(
      'Succès',
      'Votre signalement a été envoyé avec succès',
      [{ text: 'OK', onPress: resetForm }]
    );
  };

  const resetForm = () => {
    setSelectedType('');
    setDescription('');
    setTransportLine('');
    setLocation(null);
  };

  const getSelectedButtonStyle = (typeId: string) => {
    const type = problemTypes.find(t => t.id === typeId);
    return selectedType === typeId
      ? { ...styles.problemButton, backgroundColor: type?.color || '#0A7EA4', borderColor: type?.color || '#0A7EA4' }
      : styles.problemButton;
  };

  const getSelectedTextStyle = (typeId: string) => {
    return selectedType === typeId ? styles.problemButtonTextSelected : styles.problemButtonText;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        {/* Diagonal gradient background */}
        <View style={styles.diagonalBackground} />
        <View style={styles.diagonalGradient} />
        
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        {/* <View style={styles.decorativeCircle2} /> */}
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Signaler un problème</Text>
            <Text style={styles.subtitle}>Aidez-nous à améliorer votre expérience</Text>
          </View>

          {/* Type de problème */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de problème</Text>
            <View style={styles.problemTypesContainer}>
              {problemTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  style={getSelectedButtonStyle(type.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={selectedType === type.id ? 'white' : '#4B5563'}
                  />
                  <Text style={getSelectedTextStyle(type.id)}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ligne de transport */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ligne de transport</Text>
            <TextInput
              value={transportLine}
              onChangeText={setTransportLine}
              placeholder="Ex: Ligne 1, RER A, Bus 95..."
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez le problème en détail..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.textInput, styles.textArea]}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Localisation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <TouchableOpacity
              onPress={getLocation}
              style={styles.locationButton}
              activeOpacity={0.7}
            >
              <View style={styles.locationButtonContent}>
                <Ionicons name="location" size={20} color="#4B5563" />
                <Text style={styles.locationButtonText}>
                  {location ? 'Position capturée' : 'Capturer ma position'}
                </Text>
              </View>
              {location && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
            </TouchableOpacity>
          </View>

          {/* Bouton soumettre */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            activeOpacity={0.8}
          >
            <View style={styles.submitButtonGradient}>
              <Text style={styles.submitButtonText}>
                Envoyer le signalement
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  backgroundContainer: {
    flex: 1,
    position: 'relative',
  },
  diagonalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#1a2332',
    transform: [{ skewY: '-3deg' }],
    marginTop: -20,
  },
  diagonalGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#8DE8FE',
    opacity: 0.7,
    transform: [{ skewY: '-2deg' }],
    marginTop: 30,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderTopLeftRadius: 100,


  },
  decorativeCircle1: {
    position: 'absolute',
    top: 60,
    right: 5,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgb(12, 12, 12)',
  },
  // decorativeCircle2: {
  //   position: 'absolute',
  //   top: 90,
  //   left: 10,
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   backgroundColor: 'rgb(255, 255, 255)',
  // },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    paddingVertical: 40,
    marginBottom: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a2332',
    marginBottom: 12,
  },
  problemTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  problemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  problemButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#4B5563',
    fontSize: 14,
  },
  problemButtonTextSelected: {
    marginLeft: 8,
    fontWeight: '700',
    color: 'white',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a2332',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    marginLeft: 8,
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 14,
    marginBottom: 40,
    shadowColor: '#0A7EA4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#0A7EA4',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});