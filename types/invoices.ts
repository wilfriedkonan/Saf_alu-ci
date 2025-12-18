// Types pour les statuts et types de factures
export type FactureStatut = "Brouillon" | "Envoyee" | "payee" | "EnRetard" | "Annulee";
export type FactureType = "Facture_Client" | "SousTraitant" | "Avoir" | "Acompte";

export interface Facture {
  id: number;
  numero: string;
  typeFacture: FactureType;
  clientId: number;
  sousTraitantId?: number;
  devisId?: number;
  projetId?: number;
  titre: string;
  description?: string;
  statut: FactureStatut;
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  montantTTC: number;
  montantPaye: number;
  montantRestant: number;
  dateCreation: string;
  dateFacture: string;
  dateEcheance: string;
  dateEnvoi?: string;
  datePaiement?: string;
  dateModification: string;
  conditionsPaiement: string;
  modePaiement?: string;
  referenceClient?: string;
  cheminPDF?: string;
  utilisateurCreation: number;
  detailDebiteur : DetailDebiteur;
  // Navigation properties
  lignes?: LigneFacture[];
  echeanciers?: Echeancier[];

  // Propriétés de compatibilité pour l'interface existante
  number: string; // alias pour numero
  status: FactureStatut; // alias pour statut
  type: FactureType; // alias pour typeFacture
  clientName?: string; // alias pour client?.nom
  clientEmail?: string; // alias pour client?.email
  clientPhone: string;
  clientAddress: String;
  projectTitle?: string; // alias pour titre
  total: number; // alias pour montantTTC
  paidAmount: number; // alias pour montantPaye
  remainingAmount: number; // alias pour montantRestant
  dueDate: string; // alias pour dateEcheance
  remindersSent?: number;
}

export interface LigneFacture {
  id: number;
  factureId: number;
  ordre: number;
  designation: string;
  description?: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  totalHT: number;
}

export interface Echeancier {
  id: number;
  factureId: number;
  ordre: number;
  description?: string;
  montantTTC: number;
  dateEcheance: string;
  statut: string; // "EnAttente" | "Paye" | "EnRetard"
  datePaiement?: string;
  modePaiement?: string;
  referencePaiement?: string;
}

export interface CreateFactureRequest {
  typeFacture: FactureType;
  clientId?: number;
  sousTraitantId?: number;
  devisId?: number;
  projetId?: number;
  titre: string;
  description?: string;
  dateFacture: string;
  dateEcheance: string;
  conditionsPaiement?: string;
  referenceClient?: string;
  lignes?: CreateLigneFactureRequest[];
  echeanciers?: CreateEcheancierRequest[];
}

export interface CreateLigneFactureRequest {
  designation: string;
  description?: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
}

export interface CreateEcheancierRequest {
  description?: string;
  montantTTC: number;
  dateEcheance: string;
}

export interface MarquerPayeRequest {
  montantPaye: number;
  modePaiement?: string;
  referencePaiement?: string;
  datePaiement: string;
}

export interface DetailDebiteur {
  id: number
  nom: string
  ncc: string
  raisonSociale: string
  email: string
  telephone: string
  adresse: string
}

// Types pour compatibilité avec l'interface existante
export type InvoiceStatus = FactureStatut;
export type InvoiceType = FactureType;

// Labels pour l'affichage
export const invoiceStatusLabels: Record<FactureStatut, string> = {
  Brouillon: "Brouillon",
  Envoyee: "Envoyée",
  payee: "Payée",
  EnRetard: "En retard",
  Annulee: "Annulée"
};

export const invoiceTypeLabels: Record<FactureType, string> = {
  Facture_Client: "Facture client",
  SousTraitant: "Facture Sous-traitant",
  Avoir: "Avoir",
  Acompte: "Acompte"
};

export const invoiceStatusColors: Record<FactureStatut, string> = {
  Brouillon: "bg-gray-100 text-gray-800",
  Envoyee: "bg-blue-100 text-blue-800",
  payee: "bg-green-100 text-green-800",
  EnRetard: "bg-red-100 text-red-800",
  Annulee: "bg-orange-100 text-orange-800"
};