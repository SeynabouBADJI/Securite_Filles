import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

// Importer les écrans
import ConnexionScreen from './src/screens/ConnexionScreen';
import InscriptionScreen from './src/screens/InscriptionScreen';
import HomeScreen from './src/screens/HomeScreen';
import SortiesScreen from './src/screens/SortiesScreen';
import CarteScreen from './src/screens/CarteScreen';
import ProfilScreen from './src/screens/ProfilScreen';
import SOSFloatingButton from './src/components/SOSFloatingButton';
import ContactsScreen from './src/screens/ContactsScreen';
import CreerSortieScreen from './src/screens/CreerSortieScreen';
import DetailSortieScreen from './src/screens/DetailSortieScreen';
import DecouvrirSortiesScreen from './src/screens/DecouvrirSortiesScreen';
import PartagePositionScreen from './src/screens/PartagePositionScreen';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SortiesStack = createStackNavigator();

function SortiesStackScreen() {
  return (
    <SortiesStack.Navigator>
      <SortiesStack.Screen 
        name="ListeSorties" 
        component={SortiesScreen} 
        options={{ 
          title: 'Mes Sorties',
          headerStyle: { backgroundColor: '#e91e63' },
          headerTintColor: '#fff',
        }}
      />
      <SortiesStack.Screen 
        name="CreerSortie" 
        component={CreerSortieScreen} 
        options={{ 
          title: 'Créer une sortie',
          headerStyle: { backgroundColor: '#e91e63' },
          headerTintColor: '#fff',
        }}
      />
      <SortiesStack.Screen 
        name="DetailSortie" 
        component={DetailSortieScreen} 
        options={{ 
          title: 'Détail de la sortie',
          headerStyle: { backgroundColor: '#e91e63' },
          headerTintColor: '#fff',
        }}
      />
      <SortiesStack.Screen 
        name="DecouvrirSorties" 
        component={DecouvrirSortiesScreen} 
        options={{ 
          title: 'Découvrir',
          headerStyle: { backgroundColor: '#e91e63' },
          headerTintColor: '#fff',
        }}
      />
      <SortiesStack.Screen 
        name="PartagePosition" 
        component={PartagePositionScreen} 
        options={{ 
          title: 'Partage de position',
          headerStyle: { backgroundColor: '#e91e63' },
          headerTintColor: '#fff',
        }}
      />
    </SortiesStack.Navigator>
  );
}

function HomeTabs() {
  console.log('✅ Rendu de HomeTabs');
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';
            
            switch (route.name) {
              case 'Accueil':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Sorties':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case 'Carte':
                iconName = focused ? 'map' : 'map-outline';
                break;
              case 'Profil':
                iconName = focused ? 'person' : 'person-outline';
                break;
              case 'Contacts':
                iconName = focused ? 'heart' : 'heart-outline';
                break;
            }
            
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#e91e63',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#e91e63',
          },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Sorties" component={SortiesStackScreen} />
        <Tab.Screen name="Carte" component={CarteScreen} />
        <Tab.Screen name="Profil" component={ProfilScreen} />
        <Tab.Screen name="Contacts" component={ContactsScreen} />
      </Tab.Navigator>
      
      <SOSFloatingButton />
    </View>
  );
}

function AuthStack({ onLogin }: any) {
  console.log('✅ Rendu de AuthStack');
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#e91e63',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="Connexion">
        {(props) => <ConnexionScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Inscription" component={InscriptionScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [utilisateur, setUtilisateur] = useState(null);

  console.log('📱 App rendu, isAuthenticated =', isAuthenticated);

  const handleLogin = (user: any) => {
    setUtilisateur(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUtilisateur(null);
    setIsAuthenticated(false);
  };

  return (
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <HomeTabs />
          ) : (
            <AuthStack onLogin={handleLogin} />
          )}
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});