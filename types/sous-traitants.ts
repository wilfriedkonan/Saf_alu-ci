// ==========================================
// Types principaux pour les Sous-traitants
// ==========================================

/**
 * Représente un sous-traitant dans le système
 */
export interface SousTraitant {
  id: number;
  nom: string;
  raisonSociale: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  ncc: string | null;
  nomContact: string | null;
  noteMoyenne: number; // Décimal en C#, default: 0
  nombreEvaluations: number; // Default: 0
  certifications: string | null; // JSON stringifié
  dateCreation: string; // DateTime en ISO format
  dateModification: string; // DateTime en ISO format
  actif: boolean; // Default: true
  utilisateurCreation: number | null;
  contact: contact | null;
  // Navigation properties
  specialites?: SousTraitantSpecialite[];
  evaluations?: EvaluationSousTraitant[];
}

/**
 * Représente une spécialité/compétence
 */
export interface Specialite {
  id: number;
  nom: string;
  description: string | null;
  couleur: string; // Default: "#059669"
  actif: boolean; // Default: true
}

/**
 * Relation entre un sous-traitant et ses spécialités avec niveau d'expertise
 */
export interface SousTraitantSpecialite {
  couleur:string;
  nom: string;
  specialiteId: number;
  niveauExpertise: number; // 1-5, default: 3
  description: string;
  niveauLabel: string;
}

/**
 * Évaluation d'un sous-traitant sur un projet
 */
export interface EvaluationSousTraitant {
  id: number;
  sousTraitantId: number;
  projetId: number;
  etapeProjetId: number | null;
  note: number; // 1-5
  commentaire: string | null;
  criteres: string | null; // JSON stringifié
  dateEvaluation: string; // DateTime en ISO format
  evaluateurId: number;
}

// ==========================================
// DTOs pour les requêtes
// ==========================================

/**
 * DTO pour créer un nouveau sous-traitant
 */
export interface CreateSousTraitantRequest {
  nom: string;
  raisonSociale?: string | null;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  ncc?: string | null;
  nomContact?: string | null;
  prenomContact?: string | null;
  emailContact?: string | null;
  telephoneContact?: string | null;
  specialiteIds?: number[];
}

/**
 * DTO pour créer une évaluation
 */
export interface CreateEvaluationRequest {
  sousTraitantId: number;
  projetId: number;
  etapeProjetId?: number | null;
  note: number; // 1-5
  commentaire?: string | null;
  criteres?: Record<string, number>; // Ex: { qualite: 4, delais: 5, communication: 4 }
}

/**
 * DTO pour mettre à jour un sous-traitant
 */
export interface UpdateSousTraitantRequest extends CreateSousTraitantRequest {
  certifications?: string | null;
  specialites?: SpecialiteAvecNiveau[];
}

/**
 * Spécialité avec niveau d'expertise
 */
export interface SpecialiteAvecNiveau {
  specialiteId: number;
  niveauExpertise: number; // 1-5, default: 3
}

// ==========================================
// Types d'objets parsés (pour JSON)
// ==========================================

/**
 * Structure des certifications (parsé depuis JSON)
 */
export interface Certifications {
  [key: string]: {
    nom: string;
    dateObtention: string;
    dateExpiration?: string;
    numero?: string;
  };
}

/**
 * Structure des critères d'évaluation (parsé depuis JSON)
 */
export interface CriteresEvaluation {
  qualite?: number;
  delais?: number;
  communication?: number;
  professionnalisme?: number;
  proprete?: number;
  securite?: number;
  [key: string]: number | undefined;
}

// ==========================================
// Types pour l'interface utilisateur
// ==========================================

/**
 * Sous-traitant avec données complètes pour l'affichage
 */
export interface SousTraitantComplet extends SousTraitant {
  specialites: SousTraitantSpecialite[];
  evaluations: EvaluationSousTraitant[];
  certificationsObj?: Certifications; // Certifications parsées
  derniereEvaluation?: EvaluationSousTraitant;
  projetsEnCours?: number;
  projetsTermines?: number;
}

/**
 * Options de filtre pour les sous-traitants
 */
export interface SousTraitantFilterOptions {
  searchTerm?: string;
  specialiteIds?: number[];
  noteMinimum?: number;
  villeIds?: string[];
  actifOnly?: boolean;
  orderBy?: 'nom' | 'noteMoyenne' | 'nombreEvaluations' | 'dateCreation';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Résumé statistique d'un sous-traitant
 */
export interface SousTraitantStats {
  id: number;
  nom: string;
  noteMoyenne: number;
  nombreEvaluations: number;
  projetsTotal: number;
  projetsEnCours: number;
  projetsTermines: number;
  tauxReussite: number; // Pourcentage
  specialitesCount: number;
}
export interface contact {
  nom: string;
  emailContact: string;
  telephoneContact: string;
}

// ==========================================
// Types pour les réponses API
// ==========================================

/**
 * Réponse paginée pour la liste des sous-traitants
 */
export interface SousTraitantListResponse {
  items: SousTraitant[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Réponse API standard
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// Énumérations et constantes
// ==========================================

/**
 * Niveaux d'expertise possibles
 */
export enum NiveauExpertise {
  Debutant = 1,
  Intermediaire = 2,
  Competent = 3,
  Avance = 4,
  Expert = 5
}

/**
 * Notes d'évaluation possibles
 */
export enum NoteEvaluation {
  TresMauvais = 1,
  Mauvais = 2,
  Moyen = 3,
  Bon = 4,
  Excellent = 5
}

/**
 * Statuts d'activité
 */
export type StatutActivite = 'actif' | 'inactif' | 'suspendu';

// ==========================================
// Type Guards
// ==========================================

/**
 * Vérifie si un objet est un SousTraitant valide
 */
export function isSousTraitant(obj: any): obj is SousTraitant {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.nom === 'string' &&
    typeof obj.noteMoyenne === 'number' &&
    typeof obj.nombreEvaluations === 'number' &&
    typeof obj.actif === 'boolean'
  );
}

/**
 * Vérifie si un objet est une Specialite valide
 */
export function isSpecialite(obj: any): obj is Specialite {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.nom === 'string' &&
    typeof obj.actif === 'boolean'
  );
}