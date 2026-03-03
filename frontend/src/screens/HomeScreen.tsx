import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
  const quickActions = [
    {
      id: 1,
      title: 'Nouvelle sortie',
      icon: 'people',
      color: '#e91e63',
      screen: 'Sorties',
      params: { screen: 'CreerSortie' }
    },
    {
      id: 2,
      title: 'Zones à risque',
      icon: 'map',
      color: '#ff9800',
      screen: 'Carte'
    },
    {
      id: 3,
      title: 'Signaler',
      icon: 'alert-circle',
      color: '#f44336',
      screen: 'Carte',
      params: { signaler: true }
    },
    {
      id: 4,
      title: 'Contacts',
      icon: 'heart',
      color: '#4caf50',
      screen: 'Contacts'
    }
  ];

  const handleQuickAction = (action: any) => {
    if (action.screen === 'Sorties' && action.params) {
      navigation.navigate('Sorties', action.params);
    } else {
      navigation.navigate(action.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* En-tête avec bienvenue */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bonjour,</Text>
            <Text style={styles.userName}>Sophie 👋</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profil')}
          >
            <Ionicons name="person-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* Message de sécurité */}
        <View style={styles.securityMessage}>
          <Ionicons name="shield-checkmark" size={24} color="#4caf50" />
          <Text style={styles.securityText}>
            Vous êtes en sécurité. N'oubliez pas que le bouton SOS est toujours accessible.
          </Text>
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleQuickAction(action)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={30} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sorties à venir */}
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Sorties à venir</Text>
          <TouchableOpacity 
            style={styles.emptyStateCard}
            onPress={() => navigation.navigate('Sorties', { screen: 'CreerSortie' })}
          >
            <Ionicons name="calendar-outline" size={40} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Aucune sortie prévue</Text>
            <Text style={styles.emptyStateSubtitle}>
              Créez une sortie ou rejoignez-en une existante
            </Text>
            <View style={styles.createButton}>
              <Text style={styles.createButtonText}>Créer une sortie</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Conseils de sécurité */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Conseils de sécurité</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={24} color="#ff9800" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Partage ta position</Text>
              <Text style={styles.tipText}>
                Active le partage de position avec tes contacts de confiance pendant tes sorties
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="warning-outline" size={24} color="#f44336" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Consulte les zones à risque</Text>
              <Text style={styles.tipText}>
                Vérifie la carte avant de sortir pour éviter les zones signalées
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e91e63',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    padding: 5,
  },
  securityMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    color: '#2e7d32',
    fontSize: 14,
  },
  quickActionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  upcomingSection: {
    padding: 20,
  },
  emptyStateCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tipsSection: {
    padding: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
  },
});