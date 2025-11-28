// types/dqe-debourse-sec.ts

/**
 * Types de dépense pour les déboursés secs
 */
export type TypeDepense = 'MainOeuvre' | 'Materiaux' | 'Materiel' | 'SousTraitance' | 'Autres';

/**
 * Interface Détail Déboursé Sec
 */
export interface DQEDetailDebourseSec {
  id: number;
  itemId: number;
  typeDepense: TypeDepense;
  typeDepenseLabel: string;
  designation: string;
  description?: string;
  ordre: number;
  unite: string;
  quantite: number;
  prixUnitaireHT: number;
  montantHT: number;
  coefficient: number;
  referenceExterne?: string;
  notes?: string;
  dateCreation: string;
  dateModification?: string;
  actif: boolean;
}

/**
 * DTO Création Détail Déboursé
 */
export interface CreateDetailDebourseSecRequest {
  typeDepense: TypeDepense;
  designation: string;
  description?: string;
  ordre: number;
  unite: string;
  quantite: number;
  prixUnitaireHT: number;
  coefficient?: number;
  referenceExterne?: string;
  notes?: string;
}

/**
 * DTO Mise à jour Détail Déboursé
 */
export interface UpdateDetailDebourseSecRequest {
  typeDepense?: TypeDepense;
  designation?: string;
  description?: string;
  ordre?: number;
  unite?: string;
  quantite?: number;
  prixUnitaireHT?: number;
  coefficient?: number;
  referenceExterne?: string;
  notes?: string;
}

/**
 * Détail par type de dépense
 */
export interface DetailParType {
  typeDepense: TypeDepense;
  typeDepenseLabel: string;
  nombreLignes: number;
  montantTotal: number;
  pourcentageTotal: number;
}

/**
 * Récapitulatif Déboursé Sec
 */
export interface RecapitulatifDebourseSecResponse {
  itemId: number;
  itemCode: string;
  itemDesignation: string;
  debourseSecTotal: number;
  detailParType: DetailParType[];
}

/**
 * Statistiques Déboursé DQE
 */
export interface DebourseStatistics {
  totalRevenueHT: number;
  totalDeboursseSec: number;
  margeGlobale: number;
  tauxMargeGlobal: number;
  nombreItems: number;
  nombreItemsAvecDebourse: number;
  repartitionParType: DetailParType[];
  top10ItemsParDebourse: TopItemDebourse[];
}

/**
 * Top Items par Déboursé
 */
export interface TopItemDebourse {
  itemId: number;
  itemCode: string;
  itemDesignation: string;
  totalRevenueHT: number;
  deboursseSec: number;
  marge: number;
  tauxMarge: number;
}

/**
 * Réponse API standard
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// ========================================
// CONSTANTES
// ========================================

/**
 * Types de dépense disponibles
 */
export const TYPES_DEPENSE: { value: TypeDepense; label: string }[] = [
  { value: 'MainOeuvre', label: "Main d'œuvre" },
  { value: 'Materiaux', label: 'Matériaux' },
  { value: 'Materiel', label: 'Matériel' },
  { value: 'SousTraitance', label: 'Sous-traitance' },
  { value: 'Autres', label: 'Autres' },
];

/**
 * Couleurs par type de dépense
 */
export const TYPE_DEPENSE_COLORS: Record<TypeDepense, string> = {
  MainOeuvre: 'blue',
  Materiaux: 'green',
  Materiel: 'orange',
  SousTraitance: 'purple',
  Autres: 'gray',
};

/**
 * Icônes par type de dépense (lucide-react)
 */
export const TYPE_DEPENSE_ICONS: Record<TypeDepense, string> = {
  MainOeuvre: 'Users',
  Materiaux: 'Package',
  Materiel: 'Wrench',
  SousTraitance: 'Handshake',
  Autres: 'MoreHorizontal',
};

/**
 * Unités communes pour déboursés secs
 */
export const UNITES_DEBOURSE = [
  'h',     // Heure
  'j',     // Jour
  'sac',   // Sac
  'm³',    // Mètre cube
  'm²',    // Mètre carré
  'ml',    // Mètre linéaire
  'kg',    // Kilogramme
  'u',     // Unité
  'forf',  // Forfait
];

// ========================================
// HELPERS
// ========================================

/**
 * Récupère le label d'un type de dépense
 */
export const getTypeDepenseLabel = (type: TypeDepense): string => {
  const found = TYPES_DEPENSE.find(t => t.value === type);
  return found?.label || type;
};

/**
 * Récupère la couleur d'un type de dépense
 */
export const getTypeDepenseColor = (type: TypeDepense): string => {
  return TYPE_DEPENSE_COLORS[type] || 'gray';
};

/**
 * Calcule le montant HT
 */
export const calculateMontantHT = (
  quantite: number,
  prixUnitaireHT: number,
  coefficient: number = 1.0
): number => {
  return quantite * prixUnitaireHT * coefficient;
};

/**
 * Formate un montant en FCFA
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' F';
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)} %`;
};

/**
 * Valide les données de création
 */
export const validateCreateRequest = (data: CreateDetailDebourseSecRequest): string[] => {
  const errors: string[] = [];

  if (!data.typeDepense) errors.push('Le type de dépense est requis');
  if (!data.designation || data.designation.trim() === '') errors.push('La désignation est requise');
  if (!data.unite || data.unite.trim() === '') errors.push('L\'unité est requise');
  if (data.quantite <= 0) errors.push('La quantité doit être supérieure à 0');
  if (data.prixUnitaireHT < 0) errors.push('Le prix unitaire doit être >= 0');
  if (data.coefficient && data.coefficient <= 0) errors.push('Le coefficient doit être > 0');

  return errors;
};

/**
 * Calcule les totaux par type
 */
export const calculateTotalsByType = (
  details: DQEDetailDebourseSec[]
): Map<TypeDepense, number> => {
  const totals = new Map<TypeDepense, number>();

  details.forEach(detail => {
    const current = totals.get(detail.typeDepense) || 0;
    totals.set(detail.typeDepense, current + detail.montantHT);
  });

  return totals;
};