// ============================================
// INTERFACES PRINCIPALES
// ============================================

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
  soustaitantId? :number
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
}

export interface ProjectStage {
  id?: number
  projetId: number
  nom: string
  description?: string
  ordre: number
  dateDebut?: string
  dateFinPrevue?: string
  dateFinReelle?: string
  statut: StageStatus
  pourcentageAvancement: number
  budgetPrevu: number
  coutReel: number
  depense : number
  responsableId?: number
  typeResponsable: ResponsableType
  idSousTraitant?: number
  // DQE lot linking properties
  linkedDqeLotId?: number
  linkedDqeLotCode?: string
  linkedDqeLotName?: string
  linkedDqeReference?: string

  
  // Propriétés optionnelles pour l'UI (non dans le modèle C#)
  evaluation?: StageEvaluation
  // ✅ CORRECTION: Type boolean au lieu de number
  estActif?: boolean 

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
  typeProjetId?: number  // Optionnel pour éviter erreur Foreign Key
  devisId?: number
  // ✅ CORRECTION: Date peut être Date ou string (ISO format)
  dateDebut?: Date | string
  dateFinPrevue?: Date | string
  budgetInitial: number
  adresseChantier?: string
  codePostalChantier?: string
  villeChantier?: string
  chefProjetId?: number
  etapes?: CreateEtapeProjetRequest[]
  statut?:string
  
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
  dateDebut?: Date | string
  dateFinPrevue?: Date | string
  budgetPrevu: number
  coutReel?: number  // Ajouté car utilisé dans le formulaire
  statut?: StageStatus  // Ajouté car utilisé dans le formulaire
  idSousTraitant?: number 
  // DQE lot linking properties
  linkedDqeLotId?: number
  linkedDqeLotCode?: string
  linkedDqeLotName?: string
  linkedDqeReference?: string
  estActif?: boolean
}

export interface UpdateAvancementRequest {
  pourcentageAvancement: number
  note?: number
  commentaire?: string
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
      // Update project overall progress
      const totalProgress = project.etapes.reduce((sum, s) => sum + s.pourcentageAvancement, 0)
      project.pourcentageAvancement = Math.round(totalProgress / project.etapes.length)
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
// ✅ NOUVELLES FONCTIONS UTILITAIRES POUR DATES
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