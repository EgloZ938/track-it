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
  { id: 'delay', label: 'Retard', icon: 'time', color: '#3B82F6' },
  { id: 'safety', label: 'Sécurité', icon: 'shield-checkmark', color: '#8B5CF6' },
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

    // TODO: Envoyer le signalement au backend
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
      ? { ...styles.problemButton, backgroundColor: type?.color || '#0a7ea4' }
      : styles.problemButton;
  };

  const getSelectedTextStyle = (typeId: string) => {
    return selectedType === typeId ? styles.problemButtonTextSelected : styles.problemButtonText;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
              >
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={selectedType === type.id ? 'white' : '#6B7280'}
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
          >
            <View style={styles.locationButtonContent}>
              <Ionicons name="location" size={20} color="#6B7280" />
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
        >
          <Text style={styles.submitButtonText}>
            Envoyer le signalement
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  problemTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  problemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
  },
  problemButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#374151',
  },
  problemButtonTextSelected: {
    marginLeft: 8,
    fontWeight: '500',
    color: 'white',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#374151',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});