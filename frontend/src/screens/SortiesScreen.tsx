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

export default function SortiesScreen({ navigation }: any) {
  const { user } = useUser();
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'toutes' | 'prevues' | 'terminees'>('toutes');

  useEffect(() => {
    loadSorties();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadSorties();
    });

    return unsubscribe;
  }, [navigation, user]);

  const loadSorties = async () => {
    const toutesSorties = await SortieService.getSorties();
    const mesSorties = toutesSorties.filter(s => 
      s.idCreateur === user.id || 
      s.participants.some(p => p.idUtilisateur === user.id)
    );
    setSorties(mesSorties);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSorties();
    setRefreshing(false);
  };

  const getFilteredSorties = () => {
    const maintenant = new Date();
    switch(filter) {
      case 'prevues':
        return sorties.filter(s => new Date(s.date) >= maintenant && s.statut === 'prevue');
      case 'terminees':
        return sorties.filter(s => new Date(s.date) < maintenant || s.statut === 'terminee');
      default:
        return sorties;
    }
  };

  const getStatutBadge = (sortie: Sortie) => {
    const dateSortie = new Date(sortie.date);
    const maintenant = new Date();
    
    if (sortie.statut === 'annulee') {
      return { text: 'Annulée', color: '#f44336' };
    }
    if (sortie.statut === 'terminee') {
      return { text: 'Terminée', color: '#9e9e9e' };
    }
    if (dateSortie < maintenant) {
      return { text: 'En retard', color: '#ff9800' };
    }
    return { text: 'Prévue', color: '#4caf50' };
  };

  const getParticipantStatus = (sortie: Sortie) => {
    const total = sortie.participants.length;
    const acceptes = sortie.participants.filter(p => p.statut === 'accepte').length;
    return `${acceptes}/${total} participantes`;
  };

  const handleParticiper = (sortie: Sortie) => {
    Alert.alert(
      'Participer',
      'Voulez-vous rejoindre cette sortie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejoindre',
          onPress: async () => {
            await SortieService.participerSortie(sortie.id, user.id, user.nom);
            loadSorties();
            Alert.alert('Succès', 'Vous avez rejoint la sortie !');
          }
        }
      ]
    );
  };

  const handleAnnuler = (sortie: Sortie) => {
    Alert.alert(
      'Annuler la participation',
      'Voulez-vous annuler votre participation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Succès', 'Participation annulée');
          }
        }
      ]
    );
  };

  const renderSortie = ({ item }: { item: Sortie }) => {
    const estCreateur = item.idCreateur === user.id;
    const participe = item.participants.some(p => p.idUtilisateur === user.id);
    const statut = getStatutBadge(item);

    return (
      <TouchableOpacity 
        style={styles.sortieCard}
        onPress={() => navigation.navigate('DetailSortie', { sortieId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titreContainer}>
            <Text style={styles.titre}>{item.titre}</Text>
            {estCreateur && (
              <View style={styles.createurBadge}>
                <Ionicons name="star" size={12} color="white" />
                <Text style={styles.createurText}>Organisatrice</Text>
              </View>
            )}
          </View>
          <View style={[styles.statutBadge, { backgroundColor: statut.color }]}>
            <Text style={styles.statutText}>{statut.text}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
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
            <Ionicons name="navigate-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Destination: {item.destination}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{getParticipantStatus(item)}</Text>
          </View>
        </View>

        {!estCreateur && !participe && item.statut === 'prevue' && (
          <TouchableOpacity 
            style={styles.participerButton}
            onPress={() => handleParticiper(item)}
          >
            <Text style={styles.participerText}>Participer</Text>
          </TouchableOpacity>
        )}

        {participe && !estCreateur && (
          <TouchableOpacity 
            style={styles.annulerButton}
            onPress={() => handleAnnuler(item)}
          >
            <Text style={styles.annulerText}>Annuler ma participation</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const filteredSorties = getFilteredSorties();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Sorties</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('DecouvrirSorties')}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreerSortie', {
              userId: user.id,
              userNom: user.nom
            })}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'toutes' && styles.filterActive]}
          onPress={() => setFilter('toutes')}
        >
          <Text style={[styles.filterText, filter === 'toutes' && styles.filterTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'prevues' && styles.filterActive]}
          onPress={() => setFilter('prevues')}
        >
          <Text style={[styles.filterText, filter === 'prevues' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'terminees' && styles.filterActive]}
          onPress={() => setFilter('terminees')}
        >
          <Text style={[styles.filterText, filter === 'terminees' && styles.filterTextActive]}>
            Terminées
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSorties}
        renderItem={renderSortie}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune sortie</Text>
            <Text style={styles.emptySubtext}>
              Créez une sortie ou rejoignez-en une existante
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e91e63',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  filterActive: {
    backgroundColor: '#e91e63',
  },
  filterText: {
    color: '#666',
    fontWeight: 'bold',
  },
  filterTextActive: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titreContainer: {
    flex: 1,
  },
  titre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  createurBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd700',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  createurText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  statutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statutText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  participerButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  participerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  annulerButton: {
    backgroundColor: '#ff1744',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  annulerText: {
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