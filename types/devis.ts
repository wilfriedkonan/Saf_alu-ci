export interface Client {
    id: number;
    nom: string;
    prenom?: string;
    raisonSociale?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  }
  
  export interface LigneDevis {
    id: number;
    devisId: number;
    ordre: number;
    designation: string;
    description?: string;
    quantite: number;
    unite: string;
    prixUnitaireHT: number;
    totalHT: number;
  }
  
  export interface Devis {
    id: number;
    numero: string;
    clientId: number;
    titre: string;
    description?: string;
    statut: DevisStatut;
    montantHT: number;
    tauxTVA: number;
    montantTTC: number;
    dateCreation: string;
    dateValidite?: string;
    dateEnvoi?: string;
    dateValidation?: string;
    dateModification: string;
    conditions?: string;
    notes?: string;
    cheminPDF?: string;
    utilisateurCreation: number;
    utilisateurValidation?: number;
    client?: Client;
    lignes?: LigneDevis[];
  }
  
  export type DevisStatut = 
    | "Brouillon" 
    | "Envoye" 
    | "EnNegociation" 
    | "Valide" 
    | "Refuse" 
    | "Expire";
  
  export interface CreateDevisRequest {
    clientId: number;
    titre: string;
    description?: string;
    dateValidite?: string;
    conditions?: string;
    notes?: string;
    lignes?: CreateLigneDevisRequest[];
  }
  
  export interface CreateLigneDevisRequest {
    designation: string;
    description?: string;
    quantite: number;
    unite: string;
    prixUnitaireHT: number;
  }
  
  export interface UpdateDevisRequest extends CreateDevisRequest {}
  
  export interface DevisListItem {
    id: number;
    numero: string;
    titre: string;
    statut: DevisStatut;
    montantTTC: number;
    dateCreation: string;
    dateValidite?: string;
    client?: {
      id: number;
      nom: string;
    };
  }
  
  export interface ApiResponse<T> {
    data?: T;
    message?: string;
    errors?: string[];
  }
  
  export const DevisStatutLabels: Record<DevisStatut, string> = {
    Brouillon: "Brouillon",
    Envoye: "Envoyé",
    EnNegociation: "En négociation",
    Valide: "Validé",
    Refuse: "Refusé",
    Expire: "Expiré"
  };
  
  export const DevisStatutColors: Record<DevisStatut, string> = {
    Brouillon: "bg-gray-100 text-gray-800",
    Envoye: "bg-blue-100 text-blue-800",
    EnNegociation: "bg-yellow-100 text-yellow-800",
    Valide: "bg-green-100 text-green-800",
    Refuse: "bg-red-100 text-red-800",
    Expire: "bg-orange-100 text-orange-800"
  };