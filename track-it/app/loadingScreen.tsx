// LoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Assure-toi d'avoir React Navigation installé

export default function LoadingScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    // Simule un temps de chargement ou d'initialisation
    const timer = setTimeout(() => {
      // Navigue vers l'écran de signalement après 2 secondes
      navigation.replace('EcranSignalement'); // 'replace' empêche de revenir à l'écran de chargement
    }, 2000); // 2000 millisecondes = 2 secondes

    // Nettoyage : annule le minuteur si le composant est démonté avant la fin
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Remplace 'your_logo_image' par le chemin réel de ton logo */}
      {/* Assure-toi que ton logo est dans un dossier 'assets' par exemple */}
      <Image
        source={require('../assets/images/logo.png')} // Adapte ce chemin à l'emplacement de ton logo
        style={styles.logo}
        resizeMode="contain"
      />
      {/* <Text style={styles.slogan}>Simplifiez vos signalements.</Text> */}
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Couleur de fond sombre pour correspondre à ton thème
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200, // Ajuste la taille de ton logo
    height: 200,
    marginBottom: 30,
  },
  slogan: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  spinner: {
    marginTop: 50, // Espacement au-dessus du spinner
  },
});