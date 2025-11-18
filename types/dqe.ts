// types/dqe.ts

/**
 * Interface principale DQE
 */
export interface DQE {
    id: number;
    reference: string;
    nom: string;
    description?: string;
    clientId: number;
    devisId?: number;
    statut: DQEStatut;
    totalRevenueHT: number;
    tauxTVA: number;
    montantTVA: number;
    totalTTC: number;
    dateValidation?: string;
    validePar?: number;
    isConverted: boolean;
    linkedProjectId?: number;
    linkedProjectNumber?: string;
    convertedAt?: string;
    convertedById?: number;
    dateCreation: string;
    dateModification: string;
    utilisateurCreation: number;
    actif: boolean;
    
    // Navigation properties
    client?: {
      id: number;
      nom: string;
      raisonSociale?: string;
    };
    validatedBy?: {
      id: number;
      prenom: string;
      nom: string;
    };
    convertedBy?: {
      id: number;
      prenom: string;
      nom: string;
    };
    lots?: DQELot[];
    
    // Propriétés calculées (frontend)
    conversionStatus?: 'convertible' | 'converted' | 'not_convertible';
    nombreLots?: number;
  }
  
  /**
   * Interface Lot DQE
   */
  export interface DQELot {
    id: number;
    dqeId: number;
    code: string;
    nom: string;
    description?: string;
    ordre: number;
    totalRevenueHT: number;
    pourcentageTotal: number;
    
    // Navigation properties
    dqe?: DQE;
    chapters?: DQEChapter[];
    
    // Propriétés calculées (frontend)
    nombreChapitres?: number;
    nombreItems?: number;
  }
  
  /**
   * Interface Chapitre DQE
   */
  export interface DQEChapter {
    id: number;
    lotId: number;
    code: string;
    nom: string;
    description?: string;
    ordre: number;
    totalRevenueHT: number;
    
    // Navigation properties
    lot?: DQELot;
    items?: DQEItem[];
    
    // Propriétés calculées (frontend)
    nombreItems?: number;
  }
  
  /**
   * Interface Poste DQE
   */
  export interface DQEItem {
    id: number;
    chapterId: number;
    code: string;
    designation: string;
    description?: string;
    ordre: number;
    unite: UniteMesure;
    quantite: number;
    prixUnitaireHT: number;
    totalRevenueHT: number;
    deboursseSec: number;
    
    // Navigation property
    chapter?: DQEChapter;
  }
  
  /**
   * Interface Template DQE
   */
  export interface DQETemplate {
    id: number;
    nom: string;
    description?: string;
    typeProjet?: string;
    jsonStructure: string;
    estPublic: boolean;
    dateCreation: string;
    utilisateurCreation: number;
    actif: boolean;
  }
  
  // ========================================
  // DTOs - CRÉATION
  // ========================================
  
  /**
   * DTO Création DQE
   */
  export interface CreateDQERequest {
    nom: string;
    description?: string;
    clientId: number;
    devisId?: number;
    tauxTVA?: number;
    lots?: CreateDQELotRequest[];
  }
  
  /**
   * DTO Création Lot
   */
  export interface CreateDQELotRequest {
    code: string;
    nom: string;
    description?: string;
    ordre: number;
    chapters?: CreateDQEChapterRequest[];
  }
  
  /**
   * DTO Création Chapitre
   */
  export interface CreateDQEChapterRequest {
    code: string;
    nom: string;
    description?: string;
    ordre: number;
    items?: CreateDQEItemRequest[];
  }
  
  /**
   * DTO Création Poste
   */
  export interface CreateDQEItemRequest {
    code: string;
    designation: string;
    description?: string;
    ordre: number;
    unite: UniteMesure;
    quantite: number;
    prixUnitaireHT: number;
    deboursseSec: number;
  }
  
  // ========================================
  // DTOs - MISE À JOUR
  // ========================================
  
  /**
   * DTO Mise à jour DQE
   */
  export interface UpdateDQERequest {
    nom: string;
    description?: string;
    clientId: number;
    devisId?: number;
    tauxTVA: number;
    statut:string;
    lots?: CreateDQELotRequest[];
  }
  
  // ========================================
  // DTOs - VALIDATION
  // ========================================
  
  /**
   * DTO Validation DQE
   */
  export interface ValidateDQERequest {
    commentaire?: string;
  }
  
  // ========================================
  // DTOs - CONVERSION DQE → PROJET
  // ========================================
  
  /**
   * DTO Conversion DQE → Projet
   */
  export interface ConvertDQEToProjectRequest {
    dqeId: number;
    nomProjet?: string;
    descriptionProjet?: string;
    typeProjetId: number;
    dateDebut: string;
    dureeTotaleJours: number;
    chefProjetId?: number;
    priorite?: string;
    statutInitial?: string;
    modeCreationEtapes?: 'automatique' | 'manuel' | 'personnalise';
    methodeCalculDurees?: 'proportionnel' | 'egal' | 'personnalise';
    dureesPersonnalisees?: DureePersonnalisee[];
    adresseChantier?: string;
    codePostalChantier?: string;
    villeChantier?: string;
  }
  
  /**
   * Interface Durée Personnalisée
   */
  export interface DureePersonnalisee {
    lotId: number;
    dureeJours: number;
  }
  
  // ========================================
  // DTOs - RÉPONSE CONVERSION
  // ========================================
  
  /**
   * Réponse Prévisualisation Conversion
   */
  export interface ConversionPreviewResponse {
    dqe: DQESummary;
    projetPrevu: ProjectPreview;
    etapesPrevues: StagePreview[];
    calculations: ConversionCalculations;
  }
  
  /**
   * Résumé DQE
   */
  export interface DQESummary {
    id: number;
    reference: string;
    nom: string;
    totalRevenueHT: number;
    lotsCount: number;
    clientNom: string;
  }
  
  /**
   * Prévisualisation Projet
   */
  export interface ProjectPreview {
    nom: string;
    numeroProjet: string;
    dateDebut: string;
    dateFinPrevue: string;
    budgetInitial: number;
    nombreEtapes: number;
  }
  
  /**
   * Prévisualisation Étape
   */
  export interface StagePreview {
    ordre: number;
    nom: string;
    code: string;
    dateDebut: string;
    dateFinPrevue: string;
    dureeJours: number;
    budgetPrevu: number;
    pourcentageBudget: number;
  }
  
  /**
   * Calculs Conversion
   */
  export interface ConversionCalculations {
    dureeTotaleJours: number;
    methodeCalcul: string;
    budgetTotal: number;
    lotsCalculations: LotCalculation[];
  }
  
  /**
   * Calcul par Lot
   */
  export interface LotCalculation {
    lotId: number;
    lotCode: string;
    lotNom: string;
    budget: number;
    pourcentageBudget: number;
    dureeCalculee: number;
    dureeMinimum: number;
    dureeFinale: number;
  }
  
  // ========================================
  // DTOs - TEMPLATE
  // ========================================
  
  /**
   * DTO Création Template depuis DQE
   */
  export interface CreateTemplateFromDQERequest {
    dqeId: number;
    nomTemplate: string;
    description?: string;
    typeProjet?: string;
    estPublic?: boolean;
  }
  
  /**
   * DTO Création DQE depuis Template
   */
  export interface CreateDQEFromTemplateRequest {
    templateId: number;
    nom: string;
    description?: string;
    clientId: number;
    devisId?: number;
  }
  
  // ========================================
  // DTOs - EXPORT
  // ========================================
  
  /**
   * DTO Export DQE
   */
  export interface ExportDQERequest {
    dqeId: number;
    format: 'excel' | 'pdf';
    options?: ExportOptions;
  }
  
  /**
   * Options Export
   */
  export interface ExportOptions {
    inclureResume?: boolean;
    inclureDetails?: boolean;
    inclureFormules?: boolean;
    inclureGraphiques?: boolean;
    orientation?: 'portrait' | 'paysage';
    langue?: 'fr' | 'en';
  }
  
  // ========================================
  // DTOs - RÉPONSE API
  // ========================================
  
  /**
   * Réponse API Générique
   */
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }
  
  /**
   * Réponse Liste Paginée
   */
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  /**
   * Réponse Statistiques DQE
   */
  export interface DQEStatistiques {
    total: number;
    converti: number;
    convertible: number;
    brouillon: number;
    valide: number;
    totalBudgetHT: number;
    budgetConverti: number;
    budgetConvertible: number;
    tauxConversion: number;
  }
  
  /**
   * Réponse Vérification Conversion
   */
  export interface CanConvertResponse {
    canConvert: boolean;
    reason: string;
    message: string;
  }
  
  /**
   * Réponse Conversion Réussie
   */
  export interface ConversionSuccessResponse {
    message: string;
    projetId: number;
    redirectUrl: string;
  }
  
  // ========================================
  // ENUMS ET CONSTANTES
  // ========================================
  
  /**
   * Statuts DQE
   */
  export type DQEStatut = 'brouillon' | 'en_cours' | 'validé' | 'refusé' | 'archivé';
  
  /**
   * Unités de Mesure
   */
  export type UniteMesure = 'm³' | 'ml' | 'm²' | 'ens' | 'forf' | 'u'|'kg';
  
  /**
   * Constantes Statuts
   */
  export const DQE_STATUTS = {
    BROUILLON: 'brouillon' as DQEStatut,
    EN_COURS: 'en_cours' as DQEStatut,
    VALIDE: 'validé' as DQEStatut,
    REFUSE: 'refusé' as DQEStatut,
    ARCHIVE: 'archivé' as DQEStatut,
  };
  
  /**
   * Constantes Unités
   */
  export const UNITES_MESURE = {
    METRE_CUBE: 'm³' as UniteMesure,
    METRE_LINEAIRE: 'ml' as UniteMesure,
    METRE_CARRE: 'm²' as UniteMesure,
    ENSEMBLE: 'ens' as UniteMesure,
    FORFAIT: 'forf' as UniteMesure,
    UNITE: 'u' as UniteMesure,
    POIDS: 'kg' as UniteMesure
  };
  
  /**
   * Labels Statuts (pour affichage)
   */
  export const DQE_STATUT_LABELS: Record<DQEStatut, string> = {
    brouillon: 'Brouillon',
    en_cours: 'En cours',
    validé: 'Validé',
    refusé: 'Refusé',
    archivé: 'Archivé',
  };
  
  /**
   * Couleurs Statuts (pour badges)
   */
  export const DQE_STATUT_COLORS: Record<DQEStatut, string> = {
    brouillon: 'gray',
    en_cours: 'blue',
    validé: 'green',
    refusé: 'red',
    archivé: 'gray',
  };
  
  /**
   * Labels Unités (pour affichage)
   */
  export const UNITE_LABELS: Record<UniteMesure, string> = {
    'm³': 'Mètre cube',
    'ml': 'Mètre linéaire',
    'm²': 'Mètre carré',
    'ens': 'Ensemble',
    'forf': 'Forfait',
    'u': 'Unité',
    'kg': 'Kilogramme',
  };
  
  // ========================================
  // FILTRES ET RECHERCHE
  // ========================================
  
  /**
   * Paramètres Recherche DQE
   */
  export interface DQESearchParams {
    search?: string;
    statut?: DQEStatut;
    isConverted?: boolean;
    clientId?: number;
    dateDebutMin?: string;
    dateDebutMax?: string;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    pageSize?: number;
    sortBy?: 'dateCreation' | 'nom' | 'totalRevenueHT' | 'reference';
    sortOrder?: 'asc' | 'desc';
  }
  
  /**
   * Paramètres Filtres DQE
   */
  export interface DQEFilters {
    statuts?: DQEStatut[];
    isConverted?: boolean;
    clients?: number[];
    budgetMin?: number;
    budgetMax?: number;
    dateCreationDebut?: string;
    dateCreationFin?: string;
  }
  
  // ========================================
  // HELPERS ET UTILITAIRES
  // ========================================
  
  /**
   * Vérifie si un DQE est convertible
   */
  export const isDQEConvertible = (dqe: DQE): boolean => {
    return dqe.statut === 'validé' && !dqe.isConverted && dqe.totalRevenueHT > 0;
  };
  
  /**
   * Vérifie si un DQE est éditable
   */
  export const isDQEEditable = (dqe: DQE): boolean => {
    return !dqe.isConverted && (dqe.statut === 'brouillon' || dqe.statut === 'en_cours');
  };
  
  /**
   * Calcule le statut de conversion d'un DQE
   */
  export const getConversionStatus = (dqe: DQE): 'convertible' | 'converted' | 'not_convertible' => {
    if (dqe.isConverted) return 'converted';
    if (isDQEConvertible(dqe)) return 'convertible';
    return 'not_convertible';
  };
  
  /**
   * Formate un montant en FCFA
   */
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };
  
  /**
   * Formate un montant en FCFA (version courte)
   */
  export const formatCurrencyShort = (amount: number): string => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M FCFA';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K FCFA';
    }
    return amount.toFixed(0) + ' FCFA';
  };
  
  /**
   * Formate une date
   */
  export const formatDate = (date: string | Date): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  };
  
  /**
   * Formate une date avec heure
   */
  export const formatDateTime = (date: string | Date): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };