import AsyncStorage from '@react-native-async-storage/async-storage';
import { Incident } from '../types';

class IncidentService {
  private static instance: IncidentService;
  private incidents: Incident[] = [];

  static getInstance(): IncidentService {
    if (!IncidentService.instance) {
      IncidentService.instance = new IncidentService();
    }
    return IncidentService.instance;
  }

  async loadIncidents(): Promise<Incident[]> {
    try {
      const saved = await AsyncStorage.getItem('incidents');
      if (saved) {
        this.incidents = JSON.parse(saved);
      }
      return this.incidents;
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
      return [];
    }
  }

  async saveIncident(incident: Omit<Incident, 'id' | 'date' | 'statut'>): Promise<Incident> {
    const newIncident: Incident = {
      ...incident,
      id: Date.now(),
      date: new Date(),
      statut: 'signale',
    };

    this.incidents.push(newIncident);
    await AsyncStorage.setItem('incidents', JSON.stringify(this.incidents));
    return newIncident;
  }

  async getIncidents(): Promise<Incident[]> {
    if (this.incidents.length === 0) {
      await this.loadIncidents();
    }
    return this.incidents;
  }

  getIncidentsByZone(latitude: number, longitude: number, rayon: number): Incident[] {
    return this.incidents.filter(inc => {
      const distance = Math.sqrt(
        Math.pow(inc.latitude - latitude, 2) + 
        Math.pow(inc.longitude - longitude, 2)
      ) * 111000; // Conversion en mètres
      return distance < rayon;
    });
  }
}

export default IncidentService.getInstance();