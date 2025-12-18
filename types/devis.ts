// types/devis.ts

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
  nom: string; // Ex: "Restauration", "Office", "Bureau"
  ordre: number;
  description?: string;
  lignes?: LigneDevis[];
  totalSectionHT: number; // CHANGÉ: Retiré le ? pour rendre obligatoire
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
  typeElement?: string; // Ex: "Fenetre coulissante", "Soufflet", "Fixe"
  designation: string;
  description?: string;
  longueur?: number; // en cm
  hauteur?: number; // en cm
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
  
  // Nouveaux champs
  chantier?: string;
  contact?: string;
  qualiteMateriel?: string;
  typeVitrage?: string;
  
  // Relations
  client?: Client;
  sections?: DevisSection[];
}

// Type unifié pour les réponses complètes (compatible avec Devis)
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
  dateCreation: string;
  dateValidite?: string;
  dateEnvoi?: string;
  dateValidation?: string;
  conditions?: string;
  notes?: string;
  
  // Nouveaux champs
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
  
  // Nouveaux champs
  chantier?: string;
  contact?: string;
  qualiteMateriel?: string;
  typeVitrage?: string;
  
  sections?: CreateDevisSectionRequest[];
}

export interface UpdateDevisRequest extends CreateDevisRequest {}

// =====================================================
// LISTE ET RECHERCHE
// =====================================================

export interface DevisListItem {
  id: number;
  numero: string;
  titre: string;
  statut: DevisStatut;
  montantTTC: number;
  dateCreation: string;
  dateValidite?: string;
  chantier?: string;
  client?: ClientInfo;
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
// TYPES D'ÉLÉMENTS (Basé sur le PDF)
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
    dateCreation: devis.dateCreation,
    dateValidite: devis.dateValidite,
    dateEnvoi: devis.dateEnvoi,
    dateValidation: devis.dateValidation,
    dateModification: devis.dateCreation, // Utiliser dateCreation comme fallback
    conditions: devis.conditions,
    notes: devis.notes,
    cheminPDF: undefined,
    utilisateurCreation: 0, // Sera ignoré en mode édition
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