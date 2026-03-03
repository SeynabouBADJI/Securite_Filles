import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import SignalerModal from '../components/SignalerModal';
import IncidentService from '../services/IncidentService';
import RiskService, { ZoneRisque } from '../services/RiskService';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

interface Incident {
  id: number;
  typeIncident: string;
  latitude: number;
  longitude: number;
  date: Date;
  description: string;
}

export default function CarteScreen({ navigation }: any) {
  const { user } = useUser();
  
  // Vérification que user existe
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Chargement de l'utilisateur...</Text>
      </View>
    );
  }
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneRisque | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [zones, setZones] = useState<ZoneRisque[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('tous');
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  useEffect(() => {
    if (incidents.length > 0) {
      loadZones();
    }
  }, [incidents]);

  const loadData = async () => {
    setLoading(true);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission de localisation refusée');
    } else {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    
    await loadIncidents();
    
    setLoading(false);
  };

  const loadIncidents = async () => {
    const loadedIncidents = await IncidentService.getIncidents();
    setIncidents(loadedIncidents);
  };

  const loadZones = async () => {
    const zonesCalculees = await RiskService.calculerZonesRisque();
    setZones(zonesCalculees);
  };

  const getZoneColor = (niveau: string) => {
    switch(niveau) {
      case 'faible': return 'rgba(76, 175, 80, 0.3)';
      case 'moyen': return 'rgba(255, 193, 7, 0.3)';
      case 'eleve': return 'rgba(255, 87, 34, 0.3)';
      case 'critique': return 'rgba(244, 67, 54, 0.3)';
      default: return 'rgba(158, 158, 158, 0.3)';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch(type) {
      case 'agression': return '⚠️';
      case 'harcelement': return '🚫';
      case 'suspicious': return '👀';
      case 'accident': return '🚗';
      default: return '📍';
    }
  };

  const signalerIncident = () => {
    setModalVisible(true);
  };

  const handleIncidentSignale = () => {
    loadIncidents();
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    
    const zoneTrouvee = zones.find(zone => {
      const distance = Math.sqrt(
        Math.pow(zone.latitude - coordinate.latitude, 2) + 
        Math.pow(zone.longitude - coordinate.longitude, 2)
      ) * 111000;
      
      return distance < zone.rayon;
    });

    setSelectedZone(zoneTrouvee || null);
  };

  const filteredIncidents = filterType === 'tous' 
    ? incidents 
    : incidents.filter(i => i.typeIncident === filterType);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords.latitude || 14.7167,
          longitude: location?.coords.longitude || -17.4677,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
      >
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={{
              latitude: zone.latitude,
              longitude: zone.longitude
            }}
            radius={zone.rayon}
            fillColor={getZoneColor(zone.niveauRisque)}
            strokeColor={getZoneColor(zone.niveauRisque).replace('0.3', '0.8')}
            strokeWidth={2}
          />
        ))}

        {filteredIncidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude
            }}
            title={incident.typeIncident}
            description={incident.description}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>
                {getMarkerIcon(incident.typeIncident)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bouton légende */}
      <TouchableOpacity 
        style={styles.legendButton}
        onPress={() => setShowLegend(!showLegend)}
      >
        <Ionicons name="information-circle" size={30} color="white" />
      </TouchableOpacity>

      {/* Légende */}
      {showLegend && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Niveaux de risque</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4caf50' }]} />
            <Text style={styles.legendText}>Faible (0-1 incident)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ffc107' }]} />
            <Text style={styles.legendText}>Moyen (2-4 incidents)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ff9800' }]} />
            <Text style={styles.legendText}>Élevé (5-9 incidents)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f44336' }]} />
            <Text style={styles.legendText}>Critique (10+ incidents)</Text>
          </View>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'tous' && styles.filterChipActive]}
            onPress={() => setFilterType('tous')}
          >
            <Text style={[styles.filterChipText, filterType === 'tous' && styles.filterChipTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'agression' && styles.filterChipActive]}
            onPress={() => setFilterType('agression')}
          >
            <Text style={[styles.filterChipText, filterType === 'agression' && styles.filterChipTextActive]}>
              ⚠️ Agression
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'harcelement' && styles.filterChipActive]}
            onPress={() => setFilterType('harcelement')}
          >
            <Text style={[styles.filterChipText, filterType === 'harcelement' && styles.filterChipTextActive]}>
              🚫 Harcèlement
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'suspicious' && styles.filterChipActive]}
            onPress={() => setFilterType('suspicious')}
          >
            <Text style={[styles.filterChipText, filterType === 'suspicious' && styles.filterChipTextActive]}>
              👀 Suspect
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Info bulle */}
      {selectedZone && (
        <View style={styles.infoBubble}>
          <Text style={styles.infoTitle}>
            Zone à risque {selectedZone.niveauRisque}
          </Text>
          <Text style={styles.infoDescription}>{selectedZone.description}</Text>
          <Text style={styles.infoStats}>
            🚨 {selectedZone.incidents} incident(s) signalé(s)
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedZone(null)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* LES DEUX BOUTONS - Positionnés au-dessus du SOS */}
      
      {/* Bouton 1 : Créer une sortie (Orange avec +) - En bas à droite */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Sorties', { screen: 'CreerSortie' })}
      >
        <Ionicons name="add-circle" size={30} color="white" />
      </TouchableOpacity>

      {/* Bouton 2 : Signaler un incident (Rouge) - Au-dessus du bouton + */}
      <TouchableOpacity style={styles.alertButton} onPress={signalerIncident}>
        <Ionicons name="alert-circle" size={30} color="white" />
      </TouchableOpacity>

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <SignalerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleIncidentSignale}
        userId={user?.id || 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  markerText: {
    fontSize: 20,
  },
  legendButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#e91e63',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  legendContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    minWidth: 200,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 80,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: '#e91e63',
  },
  filterChipText: {
    color: '#666',
    fontWeight: 'bold',
  },
  filterChipTextActive: {
    color: 'white',
  },
  infoBubble: {
    position: 'absolute',
    bottom: 180, // Remonté pour laisser place aux boutons
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#e91e63',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoStats: {
    fontSize: 12,
    color: '#999',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  // Bouton pour créer une sortie (orange) - Position le plus bas
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#ff9800',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  // Bouton pour signaler (rouge) - Au-dessus du bouton orange
  alertButton: {
    position: 'absolute',
    bottom: 100, // 70px au-dessus du bouton orange
    right: 20,
    backgroundColor: '#ff1744',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  errorContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});