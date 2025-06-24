import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RetardEtudiants() {
  return (
    <SafeAreaView style={styles.container}>
         <View style={styles.arrierePlan}>
         <View style={styles.formeDecorative1} />
         <View style={styles.formeDecorative2} />
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style ={styles.title}>Création d'un ticket de retard étudiant</Text>
    </View>
    </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

 container: {
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

  title: {
    
  }

})