import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import SortieService from '../services/SortieService';
import IncidentService from '../services/IncidentService';

export default function ProfilScreen({ navigation }: any) {
  const { user, users, switchUser } = useUser();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    sortiesCreees: 0,
    sortiesRejointes: 0,
    signalements: 0,
    niveau: 'Débutante'
  });

  // Charger les statistiques
  React.useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    const toutesSorties = await SortieService.getSorties();
    const tousIncidents = await IncidentService.getIncidents();
    
    const sortiesCreees = toutesSorties.filter(s => s.idCreateur === user.id).length;
    const sortiesRejointes = toutesSorties.filter(s => 
      s.participants.some(p => p.idUtilisateur === user.id && p.idUtilisateur !== s.idCreateur)
    ).length;
    const signalements = tousIncidents.filter(i => i.idSignaleur === user.id).length;
    
    let niveau = 'Débutante';
    const total = sortiesCreees + sortiesRejointes + signalements;
    if (total >= 20) niveau = 'Experte';
    else if (total >= 10) niveau = 'Confirmée';
    else if (total >= 5) niveau = 'Régulière';
    
    setStats({
      sortiesCreees,
      sortiesRejointes,
      signalements,
      niveau
    });
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Ici on sauvegarderait l'image
      Alert.alert('Succès', 'Photo de profil mise à jour');
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      Alert.alert('Succès', 'Photo prise avec succès');
    }
  };

  const handlePhotoPress = () => {
    Alert.alert(
      'Photo de profil',
      'Choisir une option',
      [
        { text: 'Prendre une photo', onPress: handleTakePhoto },
        { text: 'Choisir dans la galerie', onPress: handleImagePick },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const getNiveauColor = (niveau: string) => {
    switch(niveau) {
      case 'Experte': return '#ff1744';
      case 'Confirmée': return '#ff9800';
      case 'Régulière': return '#4caf50';
      default: return '#9c27b0';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec photo de profil */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePhotoPress} style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={80} color="white" />
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{user.nom}</Text>
        <Text style={styles.userEmail}>{user.email || 'Aucun email'}</Text>
        <Text style={styles.userPhone}>{user.telephone || 'Aucun téléphone'}</Text>
        
        <View style={[styles.niveauBadge, { backgroundColor: getNiveauColor(stats.niveau) }]}>
          <Text style={styles.niveauText}>{stats.niveau}</Text>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.sortiesCreees}</Text>
            <Text style={styles.statLabel}>Sorties créées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.sortiesRejointes}</Text>
            <Text style={styles.statLabel}>Sorties rejointes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.signalements}</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.badgeCard}>
            <Ionicons name="shield-checkmark" size={30} color="#4caf50" />
            <Text style={styles.badgeText}>Membre actif</Text>
          </View>
          {stats.sortiesCreees > 0 && (
            <View style={styles.badgeCard}>
              <Ionicons name="star" size={30} color="#ffd700" />
              <Text style={styles.badgeText}>Organisatrice</Text>
            </View>
          )}
          {stats.signalements > 0 && (
            <View style={styles.badgeCard}>
              <Ionicons name="warning" size={30} color="#ff9800" />
              <Text style={styles.badgeText}>Vigilante</Text>
            </View>
          )}
          {stats.sortiesRejointes > 2 && (
            <View style={styles.badgeCard}>
              <Ionicons name="people" size={30} color="#2196f3" />
              <Text style={styles.badgeText}>Sociale</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Sélecteur d'utilisateurs (pour les tests) */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowUserSelector(!showUserSelector)}
        >
          <Ionicons name="people" size={24} color="#e91e63" />
          <Text style={styles.menuText}>Changer d'utilisateur (test)</Text>
          <Ionicons 
            name={showUserSelector ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>

        {showUserSelector && (
          <View style={styles.userList}>
            {users.map(u => (
              <TouchableOpacity
                key={u.id}
                style={[styles.userItem, u.id === user.id && styles.userItemActive]}
                onPress={() => {
                  switchUser(u.id);
                  setShowUserSelector(false);
                  Alert.alert('Succès', `Vous êtes maintenant ${u.nom}`);
                }}
              >
                <Ionicons 
                  name="person-circle" 
                  size={30} 
                  color={u.id === user.id ? 'white' : '#e91e63'} 
                />
                <Text style={[styles.userItemText, u.id === user.id && styles.userItemTextActive]}>
                  {u.nom}
                </Text>
                {u.id === user.id && (
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Paramètres */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Ionicons name="settings" size={24} color="#e91e63" />
          <Text style={styles.menuText}>Paramètres</Text>
          <Ionicons 
            name={showSettings ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>

        {showSettings && (
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#ddd", true: "#e91e63" }}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Mode sombre</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#ddd", true: "#e91e63" }}
              />
            </View>
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonText}>Changer le mot de passe</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Autres options */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="heart" size={24} color="#e91e63" />
          <Text style={styles.menuText}>Mes contacts de confiance</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="calendar" size={24} color="#e91e63" />
          <Text style={styles.menuText}>Mes sorties</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="alert-circle" size={24} color="#e91e63" />
          <Text style={styles.menuText}>Mes signalements</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle" size={24} color="#e91e63" />
          <Text style={styles.menuText}>Aide et support</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle" size={24} color="#e91e63" />
          <Text style={styles.menuText}>À propos</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Bouton de déconnexion */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => Alert.alert('Déconnexion', 'Fonctionnalité à venir')}
      >
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#e91e63',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  niveauBadge: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  niveauText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  badgesSection: {
    padding: 20,
  },
  badgeCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 100,
  },
  badgeText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  userList: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  userItemActive: {
    backgroundColor: '#e91e63',
  },
  userItemText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  userItemTextActive: {
    color: 'white',
  },
  settingsList: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingButton: {
    backgroundColor: '#e91e63',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  settingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#ff1744',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});