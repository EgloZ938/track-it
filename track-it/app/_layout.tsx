import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthNavigator from '@/components/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LoadingScreen from './loadingScreen';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
  
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}



// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { AuthProvider } from '@/contexts/AuthContext';
// import AuthNavigator from '@/components/AuthNavigator'; // Ton composant AuthNavigator existant
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack'; // Garde celui-ci pour la Stack Navigator

// import LoadingScreen from './loadingScreen'; // Ton LoadingScreen

// const AppStack = createStackNavigator(); // Renomme Stack en AppStack pour éviter le conflit avec expo-router

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <AuthProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         {/* <NavigationContainer> */}
//           <AppStack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
//             <AppStack.Screen name="Loading" component={LoadingScreen} />
//             <AppStack.Screen name="AuthFlow" component={AuthNavigator} />
//           </AppStack.Navigator>
//         {/* </NavigationContainer> */}
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }