import IncidentService from './IncidentService';

export interface ZoneRisque {
  id: string;
  latitude: number;
  longitude: number;
  rayon: number;
  niveauRisque: 'faible' | 'moyen' | 'eleve' | 'critique';
  score: number;
  incidents: number;
  description: string;
}

class RiskService {
  private static instance: RiskService;
  private zones: ZoneRisque[] = [];
  private readonly RAYON_ZONE = 500; // 500 mètres
  private readonly SEUILS = {
    faible: 0,
    moyen: 2,
    eleve: 5,
    critique: 10
  };

  static getInstance(): RiskService {
    if (!RiskService.instance) {
      RiskService.instance = new RiskService();
    }
    return RiskService.instance;
  }

  async calculerZonesRisque(): Promise<ZoneRisque[]> {
    const incidents = await IncidentService.getIncidents();
    
    // Grouper les incidents par proximité
    const groupes = this.grouperIncidents(incidents);
    
    // Calculer le risque pour chaque groupe
    this.zones = groupes.map((groupe, index) => {
      const score = groupe.incidents.length;
      const niveau = this.determinerNiveauRisque(score);
      
      return {
        id: `zone-${Date.now()}-${index}`,
        latitude: groupe.centre.lat,
        longitude: groupe.centre.lng,
        rayon: this.RAYON_ZONE,
        niveauRisque: niveau,
        score,
        incidents: groupe.incidents.length,
        description: this.genererDescription(niveau, groupe.incidents.length)
      };
    });

    return this.zones;
  }

  private grouperIncidents(incidents: any[]): any[] {
    const groupes: any[] = [];
    const incidentsNonGroupes = [...incidents];

    while (incidentsNonGroupes.length > 0) {
      const incident = incidentsNonGroupes.shift();
      const groupe = {
        centre: {
          lat: incident.latitude,
          lng: incident.longitude
        },
        incidents: [incident]
      };

      // Chercher les incidents proches
      for (let i = incidentsNonGroupes.length - 1; i >= 0; i--) {
        const autre = incidentsNonGroupes[i];
        const distance = this.calculerDistance(
          incident.latitude, incident.longitude,
          autre.latitude, autre.longitude
        );

        if (distance <= this.RAYON_ZONE) {
          groupe.incidents.push(autre);
          // Mettre à jour le centre (moyenne)
          groupe.centre.lat = (groupe.centre.lat + autre.latitude) / 2;
          groupe.centre.lng = (groupe.centre.lng + autre.longitude) / 2;
          incidentsNonGroupes.splice(i, 1);
        }
      }

      groupes.push(groupe);
    }

    return groupes;
  }

  private calculerDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Rayon de la Terre en mètres
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

  private determinerNiveauRisque(score: number): 'faible' | 'moyen' | 'eleve' | 'critique' {
    if (score >= this.SEUILS.critique) return 'critique';
    if (score >= this.SEUILS.eleve) return 'eleve';
    if (score >= this.SEUILS.moyen) return 'moyen';
    return 'faible';
  }

  private genererDescription(niveau: string, nbIncidents: number): string {
    switch(niveau) {
      case 'critique':
        return `⚠️ Zone TRÈS DANGEREUSE - ${nbIncidents} incidents signalés. Évitez cette zone !`;
      case 'eleve':
        return `⚠️ Zone dangereuse - ${nbIncidents} incidents signalés. Soyez vigilante !`;
      case 'moyen':
        return `⚠️ Zone à risque modéré - ${nbIncidents} incidents signalés. Prudence recommandée.`;
      default:
        return `✅ Zone relativement sûre - ${nbIncidents} incidents signalés.`;
    }
  }

  getZones(): ZoneRisque[] {
    return this.zones;
  }
}

export default RiskService.getInstance();