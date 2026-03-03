import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SortieService from '../services/SortieService';
import { Sortie } from '../types';

export default function DetailSortieScreen({ navigation, route }: any) {
  const { sortieId } = route.params;
  const [sortie, setSortie] = useState<Sortie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerSortie();
  }, []);

  const chargerSortie = async () => {
    const toutesSorties = await SortieService.getSorties();
    const sortieTrouvee = toutesSorties.find(s => s.id === sortieId);
    setSortie(sortieTrouvee || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!sortie) {
    return (
      <View style={styles.center}>
        <Text>Sortie non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titre}>{sortie.titre}</Text>
        <View style={[styles.statutBadge, { backgroundColor: '#4caf50' }]}>
          <Text style={styles.statutText}>{sortie.statut}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Date: {new Date(sortie.date).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.infoText}>Heure: {sortie.heureDebut}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>Rendez-vous: {sortie.lieuRdv}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={20} color="#666" />
          <Text style={styles.infoText}>Destination: {sortie.destination}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        {sortie.participants.map((p, index) => (
          <View key={index} style={styles.participantRow}>
            <Ionicons name="person-circle-outline" size={24} color="#e91e63" />
            <Text style={styles.participantNom}>{p.nom}</Text>
            {p.idUtilisateur === sortie.idCreateur && (
              <View style={styles.organisatriceBadge}>
                <Text style={styles.organisatriceText}>Organisatrice</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Bouton de partage de position */}
      <View style={styles.shareSection}>
        <Text style={styles.sectionTitle}>Partage de position</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => navigation.navigate('PartagePosition', {
            sortieId: sortie.id,
            sortieTitre: sortie.titre
          })}
        >
          <Ionicons name="location" size={24} color="white" />
          <Text style={styles.shareButtonText}>Voir les participantes en direct</Text>
        </TouchableOpacity>
      </View>

      {sortie.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{sortie.notes}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.retourButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.retourText}>Retour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantNom: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  organisatriceBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  organisatriceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notes: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  retourButton: {
    backgroundColor: '#e91e63',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  retourText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Nouveaux styles ajoutés
  shareSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shareButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});