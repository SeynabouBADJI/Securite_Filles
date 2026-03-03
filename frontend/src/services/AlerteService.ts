import { Alerte, ContactSecurite } from '../types';
import LocationService from './LocationService';

class AlerteService {
  private static instance: AlerteService;

  static getInstance(): AlerteService {
    if (!AlerteService.instance) {
      AlerteService.instance = new AlerteService();
    }
    return AlerteService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    // Simuler que les permissions sont accordées
    return true;
  }

  async envoyerAlerteSOS(userId: number, contacts: ContactSecurite[]): Promise<Alerte | null> {
    try {
      const position = await LocationService.getCurrentPosition();
      if (!position) throw new Error('Pas de position');

      const adresse = await LocationService.getAddressFromCoordinates(
        position.latitude,
        position.longitude
      );

      const alerte: Alerte = {
        id: Date.now(),
        dateHeure: new Date(),
        statut: 'envoyee',
        typeAlerte: 'sos',
        position: {
          latitude: position.latitude,
          longitude: position.longitude,
          adresse: adresse,
        },
        idUtilisateur: userId,
        contactsNotifies: [],
      };

      console.log('✅ Alerte SOS créée:', alerte);
      console.log('📱 Contacts notifiés (simulé):', contacts.filter(c => c.estNotifiable));
      
      return alerte;
    } catch (error) {
      console.error('❌ Erreur envoi SOS:', error);
      return null;
    }
  }
}

const alerteService = AlerteService.getInstance();
export default alerteService;