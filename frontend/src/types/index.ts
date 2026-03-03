export type Role = 'utilisatrice' | 'contact_confiance' | 'admin';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: Role;
  dateInscription: Date;
}

export interface ContactSecurite {
  id: number;
  nom: string;
  telephone: string;
  relation: string;
  estNotifiable: boolean;
}

export interface Alerte {
  id: number;
  dateHeure: Date;
  statut: 'envoyee' | 'recue' | 'traitee';
  typeAlerte: 'sos' | 'incident';
  position: {
    latitude: number;
    longitude: number;
    adresse?: string;
  };
  idUtilisateur: number;
  contactsNotifies: number[];
}
// À ajouter à la fin du fichier
export interface Incident {
  id: number;
  typeIncident: 'agression' | 'harcelement' | 'suspicious' | 'accident' | 'autre';
  latitude: number;
  longitude: number;
  date: Date;
  description: string;
  idSignaleur: number;
  statut: 'signale' | 'confirme' | 'resolu';
}

// À ajouter après les autres interfaces

export interface Sortie {
  id: number;
  idCreateur: number;
  createurNom: string;
  titre: string;
  date: Date;
  heureDebut: string;
  heureFin?: string;
  lieuRdv: string;
  destination: string;
  statut: 'prevue' | 'en_cours' | 'terminee' | 'annulee';
  participants: ParticipantSortie[];
  notes?: string;
}

export interface ParticipantSortie {
  idUtilisateur: number;
  nom: string;
  statut: 'invite' | 'accepte' | 'refuse';
  aPartagePosition: boolean;
}