import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
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
  { id: 'cleanliness', label: 'Propreté', icon: 'trash', color: 'bg-yellow-500' },
  { id: 'equipment', label: 'Équipement défectueux', icon: 'construct', color: 'bg-red-500' },
  { id: 'overcrowding', label: 'Surcharge', icon: 'people', color: 'bg-orange-500' },
  { id: 'delay', label: 'Retard', icon: 'time', color: 'bg-blue-500' },
  { id: 'safety', label: 'Sécurité', icon: 'shield-checkmark', color: 'bg-purple-500' },
  { id: 'other', label: 'Autre', icon: 'ellipsis-horizontal', color: 'bg-gray-500' },
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Signaler un problème</Text>
          <Text className="text-gray-600">Aidez-nous à améliorer votre expérience</Text>
        </View>

        {/* Type de problème */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Type de problème</Text>
          <View className="flex-row flex-wrap gap-3">
            {problemTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`flex-row items-center px-4 py-3 rounded-lg ${selectedType === type.id ? type.color : 'bg-white border border-gray-300'
                  }`}
              >
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={selectedType === type.id ? 'white' : '#6B7280'}
                />
                <Text className={`ml-2 font-medium ${selectedType === type.id ? 'text-white' : 'text-gray-700'
                  }`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ligne de transport */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Ligne de transport</Text>
          <TextInput
            value={transportLine}
            onChangeText={setTransportLine}
            placeholder="Ex: Ligne 1, RER A, Bus 95..."
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le problème en détail..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 min-h-[100px]"
          />
        </View>

        {/* Localisation */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Localisation</Text>
          <TouchableOpacity
            onPress={getLocation}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-700">
                {location ? 'Position capturée' : 'Capturer ma position'}
              </Text>
            </View>
            {location && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
          </TouchableOpacity>
        </View>

        {/* Bouton soumettre */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-primary py-4 rounded-lg mb-8"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Envoyer le signalement
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}