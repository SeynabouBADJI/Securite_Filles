import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import LiveLocationService, { LivePosition } from '../services/LiveLocationService';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function PartagePositionScreen({ navigation, route }: any) {
  const { user } = useUser();
  const { sortieId, sortieTitre } = route.params;
  
  const [isSharing, setIsSharing] = useState(false);
  const [participants, setParticipants] = useState<LivePosition[]>([]);
  const [region, setRegion] = useState({
    latitude: 14.7167,
    longitude: -17.4677,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [alerteDistance, setAlerteDistance] = useState<string | null>(null);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // S'abonner aux mises à jour de position
    LiveLocationService.addListener(handlePositionUpdate);

    return () => {
      LiveLocationService.removeListener(handlePositionUpdate);
      if (isSharing) {
        LiveLocationService.stopSharing();
      }
    };
  }, []);

//   useEffect(() => {
//   // S'abonner aux mises à jour de position
//   LiveLocationService.addListener(handlePositionUpdate);

//   // SIMULATION : Ajouter des participantes fictives après 2 secondes
//   setTimeout(() => {
//     LiveLocationService.addMockPosition(2, 'Marie', 14.7167, -17.4670);
//     LiveLocationService.addMockPosition(3, 'Claire', 14.7170, -17.4680);
//     LiveLocationService.addMockPosition(4, 'Aminata', 14.7165, -17.4675);
//   }, 2000);

//   return () => {
//     LiveLocationService.removeListener(handlePositionUpdate);
//     if (isSharing) {
//       LiveLocationService.stopSharing();
//     }
//   };
// }, []);

  const handlePositionUpdate = (positions: LivePosition[]) => {
    setParticipants(positions);
    
    // Vérifier les distances
    const alertes = LiveLocationService.checkDistance(150);
    if (alertes.length > 0) {
      setAlerteDistance(`${alertes.length} personne(s) se sont éloignées du groupe`);
    } else {
      setAlerteDistance(null);
    }
  };

  const startSharing = async () => {
    try {
      await LiveLocationService.startSharing(sortieId, user.id, user.nom);
      setIsSharing(true);
      
      // Obtenir la position initiale pour centrer la carte
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      Alert.alert('Succès', 'Partage de position activé');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer le partage');
    }
  };

  const stopSharing = () => {
    LiveLocationService.stopSharing();
    setIsSharing(false);
    Alert.alert('Succès', 'Partage de position désactivé');
  };

  const centerOnGroup = () => {
    const positions = LiveLocationService.getPositions();
    if (positions.length === 0) return;

    // Calculer le centre du groupe
    const centre = positions.reduce((acc, pos) => ({
      lat: acc.lat + pos.latitude / positions.length,
      lng: acc.lng + pos.longitude / positions.length,
    }), { lat: 0, lng: 0 });

    mapRef.current?.animateToRegion({
      latitude: centre.lat,
      longitude: centre.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 1000);
  };

  const getMarkerColor = (userId: number) => {
    if (userId === user.id) return '#4caf50'; // Vert pour soi
    const colors = ['#e91e63', '#ff9800', '#2196f3', '#9c27b0'];
    return colors[userId % colors.length];
  };

  const renderParticipant = ({ item }: { item: LivePosition }) => (
    <View style={styles.participantCard}>
      <View style={[styles.participantDot, { backgroundColor: getMarkerColor(item.userId) }]} />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          {item.userName} {item.userId === user.id && '(vous)'}
        </Text>
        <Text style={styles.participantTime}>
          Mis à jour il y a {Math.floor((Date.now() - new Date(item.timestamp).getTime()) / 1000)}s
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={false}
      >
        {participants.map((pos) => (
          <Marker
            key={pos.userId}
            coordinate={{
              latitude: pos.latitude,
              longitude: pos.longitude,
            }}
            title={pos.userName}
            description={`Dernière mise à jour: ${new Date(pos.timestamp).toLocaleTimeString()}`}
          >
            <View style={[styles.marker, { backgroundColor: getMarkerColor(pos.userId) }]}>
              <Text style={styles.markerText}>
                {pos.userName.charAt(0)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Alerte de distance */}
      {alerteDistance && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={20} color="white" />
          <Text style={styles.alertText}>{alerteDistance}</Text>
        </View>
      )}

      {/* Liste des participants */}
      <View style={styles.participantsContainer}>
        <Text style={styles.participantsTitle}>
          Participants ({participants.length})
        </Text>
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.userId.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.participantsList}
        />
      </View>

      {/* Boutons de contrôle */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.centerButton} onPress={centerOnGroup}>
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>

        {!isSharing ? (
          <TouchableOpacity style={styles.startButton} onPress={startSharing}>
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.buttonText}>Partager ma position</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopSharing}>
            <Ionicons name="stop" size={20} color="white" />
            <Text style={styles.buttonText}>Arrêter le partage</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff1744',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  alertText: {
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
  participantsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  participantsList: {
    maxHeight: 80,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 150,
  },
  participantDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  participantTime: {
    fontSize: 10,
    color: '#999',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerButton: {
    backgroundColor: '#e91e63',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 5,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#ff1744',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});