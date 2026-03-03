import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

// Écrans temporaires ultra simples
const TempScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Version simplifiée des tabs
function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Accueil" component={() => <TempScreen title="Accueil" />} />
      <Tab.Screen name="Sorties" component={() => <TempScreen title="Sorties" />} />
      <Tab.Screen name="Carte" component={() => <TempScreen title="Carte" />} />
      <Tab.Screen name="Profil" component={() => <TempScreen title="Profil" />} />
    </Tab.Navigator>
  );
}

// Version simplifiée de l'auth
function AuthStack({ onLogin }: any) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Connexion">
        {() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Connexion</Text>
          </View>
        )}
      </Stack.Screen>
      <Stack.Screen name="Inscription">
        {() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Inscription</Text>
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

interface NavigationProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function AppNavigator({ isAuthenticated, onLogin }: NavigationProps) {
  return (
    <NavigationContainer>
      {isAuthenticated ? <HomeTabs /> : <AuthStack onLogin={onLogin} />}
    </NavigationContainer>
  );
}