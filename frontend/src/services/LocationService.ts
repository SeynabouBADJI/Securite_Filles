// src/services/LocationService.ts
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface Position {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  timestamp: Date;
}

class LocationService {
  private static instance: LocationService;
  private currentPosition: Position | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Besoin de votre position');
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<Position | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({});
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date(location.timestamp),
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street || ''} ${addr.city || ''}`.trim() || 'Position inconnue';
      }
      return 'Position inconnue';
    } catch (error) {
      return 'Position inconnue';
    }
  }
}

// Export direct de l'instance
const locationService = LocationService.getInstance();
export default locationService;