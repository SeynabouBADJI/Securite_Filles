import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SortieService from '../services/SortieService';
import { Sortie } from '../types';
import { useUser } from '../context/UserContext';

export default function DecouvrirSortiesScreen({ navigation }: any) {
  const { user } = useUser();
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    chargerSorties();
  }, [user]);

  const chargerSorties = async () => {
    const toutesSorties = await SortieService.getSorties();
    // Filtrer pour exclure les sorties où l'utilisatrice participe déjà
    const sortiesDisponibles = toutesSorties.filter(s => 
      s.statut === 'prevue' && 
      !s.participants.some(p => p.idUtilisateur === user.id)
    );
    setSorties(sortiesDisponibles);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerSorties();
    setRefreshing(false);
  };

  const handleParticiper = (sortie: Sortie) => {
    Alert.alert(
      'Rejoindre la sortie',
      `Voulez-vous participer à "${sortie.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejoindre',
          onPress: async () => {
            await SortieService.participerSortie(sortie.id, user.id, user.nom);
            Alert.alert('Succès', 'Vous avez rejoint la sortie !');
            chargerSorties(); // Rafraîchir la liste
          }
        }
      ]
    );
  };

  const renderSortie = ({ item }: { item: Sortie }) => (
    <TouchableOpacity 
      style={styles.sortieCard}
      onPress={() => navigation.navigate('DetailSortie', { sortieId: item.id })}
    >
      <Text style={styles.titre}>{item.titre}</Text>
      
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          {new Date(item.date).toLocaleDateString('fr-FR')} à {item.heureDebut}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.infoText}>Rdv: {item.lieuRdv}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          Organisée par: {item.createurNom}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          {item.participants.length} participant(s)
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.participerButton}
        onPress={() => handleParticiper(item)}
      >
        <Text style={styles.participerText}>Rejoindre cette sortie</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Découvrir des sorties</Text>
      </View>

      <FlatList
        data={sorties}
        renderItem={renderSortie}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune sortie disponible</Text>
            <Text style={styles.emptySubtext}>
              Revenez plus tard ou créez votre propre sortie
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#e91e63',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  list: {
    padding: 15,
  },
  sortieCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  titre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  participerButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  participerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
});