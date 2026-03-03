import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sortie, ParticipantSortie } from '../types';

class SortieService {
  private static instance: SortieService;
  private sorties: Sortie[] = [];

  static getInstance(): SortieService {
    if (!SortieService.instance) {
      SortieService.instance = new SortieService();
    }
    return SortieService.instance;
  }

  async loadSorties(): Promise<Sortie[]> {
    try {
      const saved = await AsyncStorage.getItem('sorties');
      if (saved) {
        this.sorties = JSON.parse(saved, (key, value) => {
          if (key === 'date') return new Date(value);
          return value;
        });
      }
      return this.sorties;
    } catch (error) {
      console.error('Erreur chargement sorties:', error);
      return [];
    }
  }

  async saveSortie(sortie: Omit<Sortie, 'id'>): Promise<Sortie> {
    const newSortie: Sortie = {
      ...sortie,
      id: Date.now(),
    };

    this.sorties.push(newSortie);
    await AsyncStorage.setItem('sorties', JSON.stringify(this.sorties));
    return newSortie;
  }

  async updateSortie(sortie: Sortie): Promise<void> {
    const index = this.sorties.findIndex(s => s.id === sortie.id);
    if (index !== -1) {
      this.sorties[index] = sortie;
      await AsyncStorage.setItem('sorties', JSON.stringify(this.sorties));
    }
  }

  async getSorties(): Promise<Sortie[]> {
    if (this.sorties.length === 0) {
      await this.loadSorties();
    }
    return this.sorties;
  }

  async getSortiesByUser(userId: number): Promise<Sortie[]> {
    const sorties = await this.getSorties();
    return sorties.filter(s => 
      s.idCreateur === userId || 
      s.participants.some(p => p.idUtilisateur === userId)
    );
  }

  async participerSortie(sortieId: number, userId: number, nom: string): Promise<void> {
    const sortie = this.sorties.find(s => s.id === sortieId);
    if (sortie) {
      const participant: ParticipantSortie = {
        idUtilisateur: userId,
        nom,
        statut: 'invite',
        aPartagePosition: false,
      };
      sortie.participants.push(participant);
      await this.updateSortie(sortie);
    }
  }

  async accepterInvitation(sortieId: number, userId: number): Promise<void> {
    const sortie = this.sorties.find(s => s.id === sortieId);
    if (sortie) {
      const participant = sortie.participants.find(p => p.idUtilisateur === userId);
      if (participant) {
        participant.statut = 'accepte';
        await this.updateSortie(sortie);
      }
    }
  }
}

export default SortieService.getInstance();