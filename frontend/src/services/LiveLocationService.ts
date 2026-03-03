import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';

export interface LivePosition {
  userId: number;
  userName: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  sortieId?: number;
}

class LiveLocationService {
  private static instance: LiveLocationService;
  private socket: Socket | null = null;
  private watchSubscription: Location.LocationSubscription | null = null;
  private currentPosition: LivePosition | null = null;
  private listeners: ((positions: LivePosition[]) => void)[] = [];
  private positions: Map<number, LivePosition> = new Map();
  private sortieId: number | null = null;
  private userId: number | null = null;

  static getInstance(): LiveLocationService {
    if (!LiveLocationService.instance) {
      LiveLocationService.instance = new LiveLocationService();
    }
    return LiveLocationService.instance;
  }

  // Connecter au serveur (simulé pour l'instant)
  connect(userId: number, userName: string) {
    this.userId = userId;
    
    // Simuler une connexion socket
    console.log(`📡 Connexion établie pour ${userName}`);
    
    // En vrai, on utiliserait :
    // this.socket = io('https://votre-serveur.com');
    // this.socket.on('positions', (data) => {
    //   this.handleRemotePositions(data);
    // });
  }

  // Démarrer le partage de position pour une sortie
  async startSharing(sortieId: number, userId: number, userName: string) {
    this.sortieId = sortieId;
    this.userId = userId;

    // Demander la permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    // Démarrer le suivi
    this.watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // toutes les 5 secondes
        distanceInterval: 10, // ou tous les 10 mètres
      },
      (location) => {
        const position: LivePosition = {
          userId,
          userName,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(),
          sortieId,
        };
        
        this.currentPosition = position;
        this.positions.set(userId, position);
        this.notifyListeners();
        
        // Envoyer au serveur
        this.sendPosition(position);
      }
    );

    console.log(`📍 Partage de position démarré pour la sortie ${sortieId}`);
  }

  // Arrêter le partage
  stopSharing() {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    
    if (this.userId) {
      this.positions.delete(this.userId);
      this.notifyListeners();
    }
    
    this.currentPosition = null;
    this.sortieId = null;
    
    console.log('📍 Partage de position arrêté');
  }

  // Envoyer la position (simulé)
  private sendPosition(position: LivePosition) {
    // En vrai, on enverrait via socket :
    // this.socket?.emit('position', position);
    console.log(`📤 Position envoyée: ${position.latitude}, ${position.longitude}`);
  }

  // Recevoir les positions des autres (simulé)
  private handleRemotePositions(positions: LivePosition[]) {
    positions.forEach(pos => {
      if (pos.userId !== this.userId) {
        this.positions.set(pos.userId, pos);
      }
    });
    this.notifyListeners();
  }

  // Ajouter une position simulée (pour les tests)
  addMockPosition(userId: number, userName: string, latitude: number, longitude: number) {
    const position: LivePosition = {
      userId,
      userName,
      latitude,
      longitude,
      timestamp: new Date(),
      sortieId: this.sortieId || 1,
    };
    this.positions.set(userId, position);
    this.notifyListeners();
  }

  // Obtenir toutes les positions
  getPositions(): LivePosition[] {
    return Array.from(this.positions.values());
  }

  // Ajouter un écouteur
  addListener(callback: (positions: LivePosition[]) => void) {
    this.listeners.push(callback);
  }

  // Retirer un écouteur
  removeListener(callback: (positions: LivePosition[]) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notifier tous les écouteurs
  private notifyListeners() {
    const positions = this.getPositions();
    this.listeners.forEach(callback => callback(positions));
  }

  // Vérifier si quelqu'un s'est trop éloigné
  checkDistance(threshold: number = 100): { userId: number, distance: number }[] {
    const alertes: { userId: number, distance: number }[] = [];
    const positions = this.getPositions();
    
    if (positions.length < 2) return alertes;

    // Calculer le centre du groupe
    const centre = positions.reduce((acc, pos) => ({
      lat: acc.lat + pos.latitude / positions.length,
      lng: acc.lng + pos.longitude / positions.length,
    }), { lat: 0, lng: 0 });

    // Vérifier chaque participant
    positions.forEach(pos => {
      const distance = this.calculerDistance(
        centre.lat, centre.lng,
        pos.latitude, pos.longitude
      );
      
      if (distance > threshold) {
        alertes.push({ userId: pos.userId, distance });
      }
    });

    return alertes;
  }

  // Calculer la distance entre deux points
  private calculerDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Nettoyer
  disconnect() {
    this.stopSharing();
    this.socket?.disconnect();
    this.socket = null;
    this.positions.clear();
    this.listeners = [];
  }
}

export default LiveLocationService.getInstance();