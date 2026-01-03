// types/devis.ts
// ✅ VERSION MISE À JOUR AVEC REMISES

export interface Client {
  id: number;
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

export interface ClientInfo {
  id: number;
  nom: string;
}

// =====================================================
// SECTION DE DEVIS
// =====================================================

export interface DevisSection {
  id: number;
  devisId: number;
  nom: string;
  ordre: number;
  description?: string;
  lignes?: LigneDevis[];
  totalSectionHT: number;
}

export interface DevisSectionResponse {
  id: number;
  nom: string;
  ordre: number;
  description?: string;
  lignes?: LigneDevisResponse[];
  totalSectionHT: number;
}

export interface CreateDevisSectionRequest {
  nom: string;
  ordre: number;
  description?: string;
  lignes?: CreateLigneDevisRequest[];
}

// =====================================================
// LIGNE DE DEVIS
// =====================================================

export interface LigneDevis {
  id: number;
  devisId: number;
  sectionId?: number;
  ordre: number;
  typeElement?: string;
  designation: string;
  description?: string;
  longueur?: number;
  hauteur?: number;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  totalHT: number;
}

export interface LigneDevisResponse {
  id: number;
  ordre: number;
  typeElement?: string;
  designation: string;
  description?: string;
  longueur?: number;
  hauteur?: number;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  totalHT: number;
}

export interface CreateLigneDevisRequest {
  typeElement?: string;
  designation: string;
  description?: string;
  longueur?: number;
  hauteur?: number;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
}

// =====================================================
// DEVIS PRINCIPAL
// =====================================================

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
  
  // ✅ NOUVEAUX CHAMPS DE REMISE
  remiseValeur: number;
  remisePourcentage: number;
  
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
  
  chantier?: string;
  contact?: string;
  qualiteMateriel?: string;
  typeVitrage?: string;
  
  client?: Client;
  sections?: DevisSection[];
}

export interface DevisCompletResponse {
  id: number;
  numero: string;
  clientId: number;
  titre: string;
  description?: string;
  statut: DevisStatut;
  montantHT: number;
  tauxTVA: number;
  montantTTC: number;
  
  // ✅ NOUVEAUX CHAMPS DE REMISE
  remiseValeur: number;
  remisePourcentage: number;
  
  dateCreation: string;
  dateValidite?: string;
  dateEnvoi?: string;
  dateValidation?: string;
  conditions?: string;
  notes?: string;
  
  chantier?: string;
  contact?: string;
  qualiteMateriel?: string;
  typeVitrage?: string;
  
  client?: ClientInfo;
  sections?: DevisSectionResponse[];
}

export type DevisStatut = 
  | "Brouillon" 
  | "Envoye" 
  | "EnNegociation" 
  | "Valide" 
  | "Refuse" 
  | "Expire";

// =====================================================
// REQUESTS
// =====================================================

export interface CreateDevisRequest {
  clientId: number;
  titre: string;
  description?: string;
  dateValidite?: string;
  conditions?: string;
  notes?: string;
  
  chantier?: string;
  contact?: string;
  qualiteMateriel?: string;
  typeVitrage?: string;
  
  // ✅ NOUVEAUX CHAMPS DE REMISE
  remiseValeur?: number;
  remisePourcentage?: number;
  
  sections?: CreateDevisSectionRequest[];
}

export interface UpdateDevisRequest extends CreateDevisRequest {}

// ✅ NOUVEAU: Request pour appliquer une remise
export interface AppliquerRemiseRequest {
  remiseValeur?: number;
  remisePourcentage?: number;
}

// ✅ NOUVEAU: Response de simulation de remise
export interface SimulationRemise {
  simulation: true;
  montantHTBrut: number;
  remiseValeur: number;
  remisePourcentage: number;
  montantRemiseTotal: number;
  montantHTNet: number;
  montantTTC: number;
  economie: number;
  pourcentageEconomie: number;
}

// =====================================================
// LISTE ET RECHERCHE
// =====================================================

export interface DevisListItem {
  id: number;
  numero: string;
  titre: string;
  statut: DevisStatut;
  montantTTC: number;
  
  // ✅ NOUVEAUX CHAMPS DE REMISE
  remiseValeur: number;
  remisePourcentage: number;
  
  dateCreation: string;
  dateValidite?: string;
  chantier?: string;
  client?: ClientInfo;
  utilisateurCreation: number;
}

export interface RechercheDevisRequest {
  search?: string;
  statut?: string;
  clientId?: number;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export interface RechercheDevisResult {
  devis: DevisListItem[];
  total: number;
  page: number;
  totalPages: number;
}

// =====================================================
// STATISTIQUES
// =====================================================

export interface StatistiquesDevis {
  total: number;
  brouillon: number;
  envoye: number;
  enNegociation: number;
  valide: number;
  refuse: number;
  expire: number;
  montantTotal: number;
  montantValide: number;
  
  // ✅ NOUVELLES STATISTIQUES DE REMISE
  montantRemisesTotal?: number;
  pourcentageRemiseMoyen?: number;
}

// =====================================================
// API RESPONSE
// =====================================================

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// =====================================================
// LABELS ET COULEURS
// =====================================================

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

// =====================================================
// UNITÉS DISPONIBLES
// =====================================================

export const UnitesDisponibles = [
  { value: "U", label: "Unité (U)" },
  { value: "m²", label: "Mètre carré (m²)" },
  { value: "ml", label: "Mètre linéaire (ml)" },
  { value: "m³", label: "Mètre cube (m³)" },
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "L", label: "Litre (L)" },
  { value: "lot", label: "Lot" },
  { value: "ensemble", label: "Ensemble" },
];

// =====================================================
// TYPES D'ÉLÉMENTS
// =====================================================

export const TypesElements = [
  { value: "Fenetre coulissante", label: "Fenêtre coulissante" },
  { value: "Soufflet", label: "Soufflet" },
  { value: "Fixe", label: "Fixe" },
  { value: "Fixe et imposte", label: "Fixe et imposte" },
  { value: "Chassis coulissante et allege fixe", label: "Châssis coulissant et allège fixe" },
  { value: "Porte", label: "Porte" },
  { value: "Porte-fenetre", label: "Porte-fenêtre" },
  { value: "Volet", label: "Volet" },
  { value: "Autre", label: "Autre" },
];

// =====================================================
// QUALITÉS MATÉRIEL
// =====================================================

export const QualitesMateriel = [
  { value: "ALU PREMIUM", label: "ALU PREMIUM" },
  { value: "ALU STANDARD", label: "ALU STANDARD" },
  { value: "ALU ECONOMIQUE", label: "ALU ECONOMIQUE" },
  { value: "PVC", label: "PVC" },
];

// =====================================================
// TYPES VITRAGE
// =====================================================

export const TypesVitrage = [
  { value: "VITRAGE 5-8-5 PARSOL VERT", label: "VITRAGE 5-8-5 PARSOL VERT" },
  { value: "VITRAGE 5-8-5 PARSOL BRONZE", label: "VITRAGE 5-8-5 PARSOL BRONZE" },
  { value: "VITRAGE 5-8-5 PARSOL GRIS", label: "VITRAGE 5-8-5 PARSOL GRIS" },
  { value: "VITRAGE 4-6-4 CLAIR", label: "VITRAGE 4-6-4 CLAIR" },
  { value: "VITRAGE SIMPLE 5MM", label: "VITRAGE SIMPLE 5MM" },
  { value: "VITRAGE SIMPLE 6MM", label: "VITRAGE SIMPLE 6MM" },
];

// =====================================================
// ✅ NOUVELLES FONCTIONS HELPER POUR LES REMISES
// =====================================================

/**
 * Calcule le montant HT brut (avant remises)
 */
export function calculateMontantHTBrut(devis: Devis | DevisCompletResponse): number {
  if (!devis.sections || devis.sections.length === 0) {
    return devis.montantHT;
  }
  
  return devis.sections.reduce((sum, section) => {
    return sum + (section.lignes?.reduce((lineSum, ligne) => {
      return lineSum + (ligne.quantite * ligne.prixUnitaireHT);
    }, 0) || 0);
  }, 0);
}

/**
 * Calcule le montant total de la remise
 */
export function calculateMontantRemiseTotal(
  montantHTBrut: number,
  remiseValeur: number,
  remisePourcentage: number
): number {
  const remisePourcentageAmount = montantHTBrut * (remisePourcentage / 100);
  const montantApresRemisePourcentage = montantHTBrut - remisePourcentageAmount;
  const montantHTNet = Math.max(0, montantApresRemisePourcentage - remiseValeur);
  return montantHTBrut - montantHTNet;
}

/**
 * Calcule le montant HT net (après remises)
 */
export function calculateMontantHTNet(
  montantHTBrut: number,
  remiseValeur: number,
  remisePourcentage: number
): number {
  const remisePourcentageAmount = montantHTBrut * (remisePourcentage / 100);
  const montantApresRemisePourcentage = montantHTBrut - remisePourcentageAmount;
  const montantHTNet = Math.max(0, montantApresRemisePourcentage - remiseValeur);
  return montantHTNet;
}

/**
 * Calcule le pourcentage d'économie total
 */
export function calculatePourcentageEconomie(
  montantHTBrut: number,
  montantRemiseTotal: number
): number {
  if (montantHTBrut === 0) return 0;
  return Math.round((montantRemiseTotal / montantHTBrut) * 100 * 100) / 100;
}

// =====================================================
// FONCTION HELPER POUR CALCULER LE TOTAL D'UNE SECTION
// =====================================================

export function calculateSectionTotal(section: DevisSection | DevisSectionResponse): number {
  if (!section.lignes || section.lignes.length === 0) {
    return 0;
  }
  
  return section.lignes.reduce((sum, ligne) => {
    return sum + (ligne.quantite * ligne.prixUnitaireHT);
  }, 0);
}

// =====================================================
// FONCTION HELPER POUR CONVERTIR DevisCompletResponse EN FORMAT ÉDITION
// =====================================================

export function devisCompletToEditFormat(devis: DevisCompletResponse): Devis {
  return {
    id: devis.id,
    numero: devis.numero,
    clientId: devis.clientId,
    titre: devis.titre,
    description: devis.description,
    statut: devis.statut,
    montantHT: devis.montantHT,
    tauxTVA: devis.tauxTVA,
    montantTTC: devis.montantTTC,
    remiseValeur: devis.remiseValeur || 0,  // ✅
    remisePourcentage: devis.remisePourcentage || 0,  // ✅
    dateCreation: devis.dateCreation,
    dateValidite: devis.dateValidite,
    dateEnvoi: devis.dateEnvoi,
    dateValidation: devis.dateValidation,
    dateModification: devis.dateCreation,
    conditions: devis.conditions,
    notes: devis.notes,
    cheminPDF: undefined,
    utilisateurCreation: 0,
    utilisateurValidation: undefined,
    chantier: devis.chantier,
    contact: devis.contact,
    qualiteMateriel: devis.qualiteMateriel,
    typeVitrage: devis.typeVitrage,
    client: devis.client as Client | undefined,
    sections: devis.sections?.map(section => ({
      ...section,
      devisId: devis.id,
      dateCreation: devis.dateCreation,
      totalSectionHT: section.totalSectionHT || calculateSectionTotal(section),
      lignes: section.lignes?.map(ligne => ({
        ...ligne,
        devisId: devis.id,
        sectionId: section.id
      }))
    }))
  };
}

// =====================================================
// ✅ FONCTION HELPER POUR FORMATER LES MONTANTS FCFA
// =====================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\u202F/g, ' ');
}