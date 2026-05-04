// ============================================
// INTERFACES PRINCIPALES - VERSION HIÉRARCHIQUE
// ============================================

import { SousTraitant } from "./sous-traitants"
import { MouvementFinancier } from "./tresorerie"

export interface SousTraitantEtapeJoin {
  id: number
  etapeProjetId: number
  sousTraitantId: number
  sousTraitant?: SousTraitant
}

export interface Project {
  id: number
  numero: string
  nom: string
  description?: string
  clientId: number
  typeProjetId: number
  devisId?: number
  statut: ProjectStatus
  dateDebut?: string
  dateFinPrevue?: string
  dateFinReelle?: string
  budgetInitial: number
  budgetRevise: number
  coutReel: number
  depenseGlobale: number
  adresseChantier?: string
  codePostalChantier?: string
  villeChantier?: string
  pourcentageAvancement: number
  chefProjetId?: number
  soustaitantId?: number
  dateCreation: string
  dateModification: string
  utilisateurCreation: number
  actif: boolean
  
  // DQE linking properties
  linkedDqeId?: number
  linkedDqeReference?: string
  linkedDqeName?: string
  linkedDqeBudgetHT?: number
  isFromDqeConversion: boolean
  dqeConvertedAt?: string
  dqeConvertedById?: number
  
  // Navigation properties (optionnelles pour le frontend)
  client?: {
    id: number
    nom: string
    email?: string
    telephone?: string
    adresse?: string
  }
  typeProjet?: TypeProjet
  chefProjet?: {
    id: number
    nom: string
    prenom: string
  }
  dqeConvertedBy?: {
    id: number
    nom: string
    prenom: string
  }
  etapes?: ProjectStage[]
  depenseProjet?: MouvementFinancier[]
}

export interface ProjectStage {
  id?: number
  projetId: number
  nom: string
  description?: string
  ordre: number
  
  // 🆕 HIÉRARCHIE
  etapeParentId?: number | null
  niveau: number // 1 = Lot, 2 = Item
  typeEtape: "Lot" | "Item"
  
  // Dates
  dateDebut?: string
  dateFinPrevue?: string
  dateFinReelle?: string
  
  // Statut
  statut: StageStatus
  pourcentageAvancement: number
  
  // Budget
  budgetPrevu: number
  coutReel: number
  depense: number
  
  // 🆕 QUANTITÉS (pour Items)
  unite?: string | null
  quantitePrevue?: number | null
  quantiteRealisee?: number | null
  prixUnitairePrevu?: number | null
  
  // Responsable
  responsableId?: number
  typeResponsable: ResponsableType
/*   sousTraitantIds?: number[] | undefined
 */  
  sousTraitants?: SousTraitantEtapeJoin[] | undefined
  // Traçabilité DQE complète
  linkedDqeLotId?: number | null
  linkedDqeLotCode?: string | null
  linkedDqeLotName?: string | null
  linkedDqeItemId?: number | null // 🆕
  linkedDqeItemCode?: string | null // 🆕
  linkedDqeChapterId?: number | null // 🆕
  linkedDqeChapterCode?: string | null // 🆕
  linkedDqeReference?: string | null
  
  // 🆕 Navigation hiérarchique
  sousEtapes?: ProjectStage[]
  
  // Métadonnées
  estActif?: boolean
  dateCreation?: string
  dateModification?: string
  
  // Propriétés optionnelles pour l'UI
  evaluation?: StageEvaluation
  
  // Navigation properties
  responsable?: {
    id: number
    prenom: string
    nom: string
  }
  sousTraitant?: {
    id: number
    nom: string
    email?: string
    telephone?: string
    noteMoyenne: number
  }
  depenseProjet?: MouvementFinancier[]
}

// 🆕 Statistiques des sous-étapes
export interface StatistiquesSousEtapes {
  nombreTotal: number
  nombreNonCommencees: number
  nombreEnCours: number
  nombreTerminees: number
  avancementMoyen: number
  budgetTotal: number
  coutTotal: number
  ecartBudgetTotal: number
  ecartBudgetPourcentage: number
}

export interface StageEvaluation {
  rating: number
  comment: string
  evaluatedBy: string
  evaluatedAt: string
  photos?: string[]
}

export interface TypeProjet {
  id: number
  nom: string
  description?: string
  couleur: string
  actif: boolean
}

export interface CreateProjetRequest {
  nom: string
  description?: string
  clientId: number
  typeProjetId?: number
  devisId?: number
  dateDebut?: Date | string
  dateFinPrevue?: Date | string
  budgetInitial: number
  adresseChantier?: string
  codePostalChantier?: string
  villeChantier?: string
  chefProjetId?: number
  etapes?: CreateEtapeProjetRequest[]
  statut?: string
  
  // DQE conversion properties
  linkedDqeId?: number
  linkedDqeReference?: string
  linkedDqeName?: string
  linkedDqeBudgetHT?: number
  isFromDqeConversion?: boolean
}

export interface CreateEtapeProjetRequest {
  id?: number
  nom: string
  description?: string
  ordre?: number
  
  // 🆕 Hiérarchie
  etapeParentId?: number | null
  niveau?: number // 1 = Lot, 2 = Item
  typeEtape?: "Lot" | "Item"
  
  // Dates
  dateDebut?: Date | string
  dateFinPrevue?: Date | string
  
  // Budget
  budgetPrevu: number
  coutReel?: number
  
  // 🆕 Quantités (pour Items)
  unite?: string
  quantitePrevue?: number
  prixUnitairePrevu?: number
  
  // Statut
  statut?: StageStatus
  
  // Responsable
  /* idSousTraitant?: number */
  // 🆕 Liste des IDs sous-traitants
  sousTraitantIds?: number[] | undefined

  typeResponsable?: ResponsableType
  
  // Traçabilité DQE
  linkedDqeLotId?: number
  linkedDqeLotCode?: string
  linkedDqeLotName?: string
  linkedDqeItemId?: number // 🆕
  linkedDqeItemCode?: string // 🆕
  linkedDqeChapterId?: number // 🆕
  linkedDqeChapterCode?: string // 🆕
  linkedDqeReference?: string
  
  estActif?: boolean
}

export interface UpdateAvancementRequest {
  pourcentageAvancement: number
  note?: number
  commentaire?: string
}

// 🆕 Request pour mettre à jour une sous-étape
export interface UpdateSousEtapeRequest {
  nom?: string
  description?: string
  statut?: StageStatus
  pourcentageAvancement?: number
  quantiteRealisee?: number
  coutReel?: number
  depense?: number
  dateDebut?: Date | string
  dateFinPrevue?: Date | string
  dateFinReelle?: Date | string
  responsableId?: number
  idSousTraitant?: number
}

// ============================================
// INTERFACES ADDITIONNELLES (UI)
// ============================================

export interface ProjectDocument {
  id: string
  name: string
  type: DocumentType
  url: string
  uploadedAt: string
  uploadedBy: string
  size: number
}

export interface SubcontractorOffer {
  id: string
  stageId: string
  subcontractorName: string
  subcontractorId: string
  price: number
  estimatedDays: number
  rating: number
  status: OfferStatus
  submittedAt: string
  notes?: string
}

// ============================================
// TYPES ET ENUMS
// ============================================

export type ProjectStatus = "Planification" | "EnCours" | "Suspendu" | "Termine" | "Annule"
export type StageStatus = "NonCommence" | "EnCours" | "Termine" | "Suspendu"
export type ResponsableType = "Interne" | "SousTraitant"
export type DocumentType = "plan" | "photo" | "contrat" | "facture" | "autre"
export type OfferStatus = "en_attente" | "acceptee" | "refusee" | "en_negociation"

// 🆕 Type pour identifier le niveau hiérarchique
export type NiveauEtape = 1 | 2 // 1 = Lot, 2 = Item
export type TypeEtape = "Lot" | "Item"

// ============================================
// LABELS ET COULEURS
// ============================================

export const projectStatusLabels: Record<ProjectStatus, string> = {
  Planification: "Planification",
  EnCours: "En cours",
  Suspendu: "Suspendu",
  Termine: "Terminé",
  Annule: "Annulé",
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  Planification: "bg-blue-100 text-blue-800",
  EnCours: "bg-green-100 text-green-800",
  Suspendu: "bg-yellow-100 text-yellow-800",
  Termine: "bg-gray-100 text-gray-800",
  Annule: "bg-red-100 text-red-800",
}

export const stageStatusLabels: Record<StageStatus, string> = {
  NonCommence: "Non commencé",
  EnCours: "En cours",
  Termine: "Terminé",
  Suspendu: "Suspendu",
}

export const stageStatusColors: Record<StageStatus, string> = {
  NonCommence: "bg-gray-100 text-gray-800",
  EnCours: "bg-blue-100 text-blue-800",
  Termine: "bg-green-100 text-green-800",
  Suspendu: "bg-yellow-100 text-yellow-800",
}

// 🆕 Labels pour les types d'étapes
export const typeEtapeLabels: Record<TypeEtape, string> = {
  Lot: "Lot (Étape principale)",
  Item: "Item (Sous-étape)",
}

export const typeEtapeIcons: Record<TypeEtape, string> = {
  Lot: "📦",
  Item: "✓",
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Mock projects data - À remplacer par des appels API réels
 */
export const mockProjects: Project[] = []

/**
 * Récupère tous les projets
 */
export const getProjects = (): Project[] => {
  return mockProjects
}

/**
 * Récupère un projet par son ID
 */
export const getProjectById = (id: number): Project | undefined => {
  return mockProjects.find((project) => project.id === id)
}

/**
 * Récupère les projets par statut
 */
export const getProjectsByStatus = (statut: ProjectStatus): Project[] => {
  return mockProjects.filter((project) => project.statut === statut)
}

/**
 * 🆕 Filtre uniquement les étapes principales (Niveau 1 - Lots)
 */
export const getMainStages = (stages: ProjectStage[]): ProjectStage[] => {
  return stages.filter(stage => stage.niveau === 1)
}

/**
 * 🆕 Récupère les sous-étapes d'une étape principale
 */
export const getSubStages = (stages: ProjectStage[], parentId: number): ProjectStage[] => {
  return stages
    .filter(stage => stage.etapeParentId === parentId && stage.niveau === 2)
    .sort((a, b) => a.ordre - b.ordre)
}

/**
 * 🆕 Calcule les statistiques des sous-étapes d'une étape principale
 */
export const calculateSubStagesStats = (stages: ProjectStage[], parentId: number): StatistiquesSousEtapes | null => {
  const subStages = getSubStages(stages, parentId)
  
  if (subStages.length === 0) return null

  const total = subStages.length
  const completed = subStages.filter(s => s.statut === "Termine").length
  const inProgress = subStages.filter(s => s.statut === "EnCours").length
  const notStarted = subStages.filter(s => s.statut === "NonCommence").length
  const avgProgress = subStages.reduce((sum, s) => sum + s.pourcentageAvancement, 0) / total
  const totalBudget = subStages.reduce((sum, s) => sum + s.budgetPrevu, 0)
  const totalCost = subStages.reduce((sum, s) => sum + s.coutReel, 0)
  const variance = totalBudget - totalCost

  return {
    nombreTotal: total,
    nombreNonCommencees: notStarted,
    nombreEnCours: inProgress,
    nombreTerminees: completed,
    avancementMoyen: Math.round(avgProgress),
    budgetTotal: totalBudget,
    coutTotal: totalCost,
    ecartBudgetTotal: variance,
    ecartBudgetPourcentage: totalBudget > 0 ? (variance / totalBudget) * 100 : 0
  }
}

/**
 * 🆕 Vérifie si une étape est une étape principale (Lot)
 */
export const isMainStage = (stage: ProjectStage): boolean => {
  return stage.niveau === 1 && stage.typeEtape === "Lot"
}

/**
 * 🆕 Vérifie si une étape est une sous-étape (Item)
 */
export const isSubStage = (stage: ProjectStage): boolean => {
  return stage.niveau === 2 && stage.typeEtape === "Item"
}

/**
 * Met à jour le pourcentage d'avancement d'une étape
 */
export const updateStageProgress = (
  projetId: number,
  etapeId: number,
  pourcentageAvancement: number
): boolean => {
  const project = mockProjects.find((p) => p.id === projetId)
  if (project && project.etapes) {
    const stage = project.etapes.find((s) => s.id === etapeId)
    if (stage) {
      stage.pourcentageAvancement = pourcentageAvancement
      if (pourcentageAvancement === 100) {
        stage.statut = "Termine"
      } else if (pourcentageAvancement > 0) {
        stage.statut = "EnCours"
      }
      
      // 🆕 Update project overall progress (uniquement depuis étapes principales)
      const mainStages = getMainStages(project.etapes)
      if (mainStages.length > 0) {
        const totalProgress = mainStages.reduce((sum, s) => sum + s.pourcentageAvancement, 0)
        project.pourcentageAvancement = Math.round(totalProgress / mainStages.length)
      }
      
      project.dateModification = new Date().toISOString()
      return true
    }
  }
  return false
}

/**
 * Ajoute une évaluation à une étape
 */
export const addStageEvaluation = (
  projetId: number,
  etapeId: number,
  evaluation: Omit<StageEvaluation, "evaluatedAt">
): boolean => {
  const project = mockProjects.find((p) => p.id === projetId)
  if (project && project.etapes) {
    const stage = project.etapes.find((s) => s.id === etapeId)
    if (stage) {
      stage.evaluation = {
        ...evaluation,
        evaluatedAt: new Date().toISOString(),
      }
      return true
    }
  }
  return false
}

// ============================================
// FONCTIONS UTILITAIRES POUR DATES
// ============================================

/**
 * Convertit une Date en string ISO format pour l'API .NET
 * Exemple: 2025-01-15T10:30:00.000Z
 */
export const formatDateForAPI = (date: Date | undefined): string | undefined => {
  if (!date) return undefined
  return date.toISOString()
}

/**
 * Convertit une string ISO en Date pour l'affichage
 */
export const parseDateFromAPI = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined
  return new Date(dateString)
}

// ============================================
// 🆕 FONCTIONS UTILITAIRES POUR QUANTITÉS
// ============================================

/**
 * Calcule l'écart de quantité (réalisée - prévue)
 */
export const calculateQuantityVariance = (stage: ProjectStage): number | null => {
  if (!stage.quantiteRealisee || !stage.quantitePrevue) return null
  return stage.quantiteRealisee - stage.quantitePrevue
}

/**
 * Calcule le pourcentage d'écart de quantité
 */
export const calculateQuantityVariancePercentage = (stage: ProjectStage): number | null => {
  if (!stage.quantiteRealisee || !stage.quantitePrevue || stage.quantitePrevue === 0) return null
  const variance = stage.quantiteRealisee - stage.quantitePrevue
  return (variance / stage.quantitePrevue) * 100
}

/**
 * Calcule la quantité restante à réaliser
 */
export const calculateRemainingQuantity = (stage: ProjectStage): number | null => {
  if (!stage.quantiteRealisee || !stage.quantitePrevue) return null
  return Math.max(0, stage.quantitePrevue - stage.quantiteRealisee)
}

/**
 * Formate une quantité avec son unité
 */
export const formatQuantity = (quantity: number | null | undefined, unit: string | null | undefined): string => {
  if (!quantity || !unit) return "-"
  return `${quantity.toLocaleString("fr-FR")} ${unit}`
}

// ============================================
// 🆕 FONCTIONS UTILITAIRES POUR BUDGET
// ============================================

/**
 * Calcule l'écart budgétaire (coût réel - budget prévu)
 */
export const calculateBudgetVariance = (stage: ProjectStage): number => {
  return stage.coutReel - stage.budgetPrevu
}

/**
 * Calcule le pourcentage d'écart budgétaire
 */
export const calculateBudgetVariancePercentage = (stage: ProjectStage): number => {
  if (stage.budgetPrevu === 0) return 0
  return ((stage.coutReel - stage.budgetPrevu) / stage.budgetPrevu) * 100
}

/**
 * Vérifie si l'étape est en dépassement budgétaire
 */
export const isBudgetOverrun = (stage: ProjectStage): boolean => {
  return stage.coutReel > stage.budgetPrevu
}
 /**
   * Unités de Mesure
   */
 export type UniteMesure = 'm³' | 'ml' | 'm²' | 'ens' | 'forf' | 'u'|'kg';

 export const UNITE_LABELS: Record<UniteMesure, string> = {
  'm³': 'Mètre cube',
  'ml': 'Mètre linéaire',
  'm²': 'Mètre carré',
  'ens': 'Ensemble',
  'forf': 'Forfait',
  'u': 'Unité',
  'kg': 'Kilogramme',
};
/**
 * Formate un montant en devise locale (XOF)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount)
}