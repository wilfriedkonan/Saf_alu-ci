export interface Client {
  id: number
  typeClient: string  
  nom: string
  designation?: string
  raisonSociale: string
  email: string
  telephone: string
  adresse: string  
  ville: string
  ncc: string
  dateCreation: string
  dateModification: string
  actif: boolean  
  utilisateurCreation: number | null  
  status: "actif" | "inactif" | "Prospect" | null  
  statistique: Statistique  
}

export interface Statistique {  
  totalDevis: number
  totalFactures: number
  totalProjets: number
  totalRevenue: number
}

export interface CreateClientRequest {
  typeClient: string  
  nom: string
  designation?: string
  raisonSociale: string
  email: string
  telephone: string
  adresse: string  
  ville: string
  ncc: string
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: string[];
}