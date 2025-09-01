export interface Project {
  id: string
  number: string
  name: string
  description: string
  client: {
    name: string
    email: string
    phone: string
    address: string
  }
  status: ProjectStatus
  priority: ProjectPriority
  budget: number
  actualCost: number
  startDate: string
  endDate: string
  actualEndDate?: string
  progress: number
  team: ProjectTeam
  stages: ProjectStage[]
  documents: ProjectDocument[]
  subcontractorOffers: SubcontractorOffer[]
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface ProjectTeam {
  projectManager: string
  workers: string[]
  subcontractors: string[]
}

export interface ProjectStage {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  progress: number
  status: StageStatus
  assignedTo: string
  estimatedHours: number
  actualHours?: number
  evaluation?: StageEvaluation
}

export interface StageEvaluation {
  rating: number
  comment: string
  evaluatedBy: string
  evaluatedAt: string
  photos?: string[]
}

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

export type ProjectStatus = "planification" | "en_cours" | "en_retard" | "termine" | "suspendu"
export type ProjectPriority = "basse" | "normale" | "haute" | "urgente"
export type StageStatus = "en_attente" | "en_cours" | "termine" | "en_retard"
export type DocumentType = "plan" | "photo" | "contrat" | "facture" | "autre"
export type OfferStatus = "en_attente" | "acceptee" | "refusee" | "en_negociation"

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planification: "Planification",
  en_cours: "En cours",
  en_retard: "En retard",
  termine: "Terminé",
  suspendu: "Suspendu",
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  planification: "bg-blue-100 text-blue-800",
  en_cours: "bg-green-100 text-green-800",
  en_retard: "bg-red-100 text-red-800",
  termine: "bg-gray-100 text-gray-800",
  suspendu: "bg-yellow-100 text-yellow-800",
}

export const priorityLabels: Record<ProjectPriority, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
}

export const priorityColors: Record<ProjectPriority, string> = {
  basse: "bg-gray-100 text-gray-800",
  normale: "bg-blue-100 text-blue-800",
  haute: "bg-orange-100 text-orange-800",
  urgente: "bg-red-100 text-red-800",
}

// Mock projects data
export const mockProjects: Project[] = [
  {
    id: "1",
    number: "PRJ-2024-001",
    name: "Rénovation Villa Cocody",
    description: "Rénovation complète d'une villa de 300m² à Cocody",
    client: {
      name: "Famille Kouassi",
      email: "kouassi@email.ci",
      phone: "+225 07 12 34 56 78",
      address: "Cocody, Abidjan",
    },
    status: "en_retard",
    priority: "urgente",
    budget: 45000000,
    actualCost: 38000000,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    progress: 75,
    team: {
      projectManager: "Marie Dubois",
      workers: ["Jean Kouame", "Paul Traore", "Aya Diallo"],
      subcontractors: ["Electricité Pro", "Plomberie Expert"],
    },
    stages: [
      {
        id: "1",
        name: "Démolition",
        description: "Démolition des cloisons existantes",
        startDate: "2024-01-15",
        endDate: "2024-01-25",
        progress: 100,
        status: "termine",
        assignedTo: "Jean Kouame",
        estimatedHours: 80,
        actualHours: 75,
        evaluation: {
          rating: 5,
          comment: "Travail excellent, très propre",
          evaluatedBy: "Marie Dubois",
          evaluatedAt: "2024-01-26",
        },
      },
      {
        id: "2",
        name: "Gros œuvre",
        description: "Reconstruction des murs porteurs",
        startDate: "2024-01-26",
        endDate: "2024-02-15",
        progress: 100,
        status: "termine",
        assignedTo: "Paul Traore",
        estimatedHours: 200,
        actualHours: 220,
        evaluation: {
          rating: 4,
          comment: "Bon travail, léger dépassement de temps",
          evaluatedBy: "Marie Dubois",
          evaluatedAt: "2024-02-16",
        },
      },
      {
        id: "3",
        name: "Électricité",
        description: "Installation électrique complète",
        startDate: "2024-02-16",
        endDate: "2024-02-28",
        progress: 80,
        status: "en_retard",
        assignedTo: "Electricité Pro",
        estimatedHours: 120,
        actualHours: 95,
      },
      {
        id: "4",
        name: "Plomberie",
        description: "Installation sanitaire et plomberie",
        startDate: "2024-03-01",
        endDate: "2024-03-10",
        progress: 0,
        status: "en_attente",
        assignedTo: "Plomberie Expert",
        estimatedHours: 80,
      },
      {
        id: "5",
        name: "Finitions",
        description: "Peinture et finitions",
        startDate: "2024-03-11",
        endDate: "2024-03-15",
        progress: 0,
        status: "en_attente",
        assignedTo: "Aya Diallo",
        estimatedHours: 60,
      },
    ],
    documents: [
      {
        id: "1",
        name: "Plans architecturaux.pdf",
        type: "plan",
        url: "/documents/plans-villa-cocody.pdf",
        uploadedAt: "2024-01-10",
        uploadedBy: "Marie Dubois",
        size: 2500000,
      },
      {
        id: "2",
        name: "Contrat client.pdf",
        type: "contrat",
        url: "/documents/contrat-villa-cocody.pdf",
        uploadedAt: "2024-01-12",
        uploadedBy: "Marie Dubois",
        size: 850000,
      },
    ],
    subcontractorOffers: [
      {
        id: "1",
        stageId: "3",
        subcontractorName: "Electricité Pro",
        subcontractorId: "sub1",
        price: 2500000,
        estimatedDays: 12,
        rating: 4.5,
        status: "acceptee",
        submittedAt: "2024-02-10",
      },
      {
        id: "2",
        stageId: "3",
        subcontractorName: "Elec Services",
        subcontractorId: "sub2",
        price: 2800000,
        estimatedDays: 10,
        rating: 4.2,
        status: "refusee",
        submittedAt: "2024-02-12",
      },
    ],
    createdAt: "2024-01-10",
    updatedAt: "2024-02-20",
    notes: "Projet prioritaire, client VIP",
  },
  {
    id: "2",
    number: "PRJ-2024-002",
    name: "Construction Immeuble Plateau",
    description: "Construction d'un immeuble de bureaux R+5",
    client: {
      name: "SODECI",
      email: "projets@sodeci.ci",
      phone: "+225 27 21 23 45 67",
      address: "Plateau, Abidjan",
    },
    status: "en_cours",
    priority: "haute",
    budget: 250000000,
    actualCost: 180000000,
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    progress: 45,
    team: {
      projectManager: "Marie Dubois",
      workers: ["Jean Kouame", "Paul Traore", "Aya Diallo", "Koffi Assi"],
      subcontractors: ["BTP Solutions", "Ascenseurs Otis"],
    },
    stages: [
      {
        id: "1",
        name: "Terrassement",
        description: "Préparation du terrain et fondations",
        startDate: "2024-02-01",
        endDate: "2024-03-01",
        progress: 100,
        status: "termine",
        assignedTo: "BTP Solutions",
        estimatedHours: 300,
        actualHours: 285,
        evaluation: {
          rating: 5,
          comment: "Excellent travail, respect des délais",
          evaluatedBy: "Marie Dubois",
          evaluatedAt: "2024-03-02",
        },
      },
      {
        id: "2",
        name: "Structure béton",
        description: "Coulage de la structure en béton armé",
        startDate: "2024-03-02",
        endDate: "2024-05-31",
        progress: 60,
        status: "en_cours",
        assignedTo: "BTP Solutions",
        estimatedHours: 800,
        actualHours: 480,
      },
    ],
    documents: [],
    subcontractorOffers: [],
    createdAt: "2024-01-25",
    updatedAt: "2024-02-25",
  },
  {
    id: "3",
    number: "PRJ-2024-003",
    name: "Extension Maison Marcory",
    description: "Extension d'une maison familiale",
    client: {
      name: "Famille Bamba",
      email: "bamba@email.ci",
      phone: "+225 05 67 89 01 23",
      address: "Marcory, Abidjan",
    },
    status: "suspendu",
    priority: "normale",
    budget: 15000000,
    actualCost: 8000000,
    startDate: "2024-01-20",
    endDate: "2024-04-20",
    progress: 30,
    team: {
      projectManager: "Marie Dubois",
      workers: ["Jean Kouame"],
      subcontractors: [],
    },
    stages: [
      {
        id: "1",
        name: "Préparation",
        description: "Préparation du chantier",
        startDate: "2024-01-20",
        endDate: "2024-02-01",
        progress: 100,
        status: "termine",
        assignedTo: "Jean Kouame",
        estimatedHours: 40,
        actualHours: 38,
      },
    ],
    documents: [],
    subcontractorOffers: [],
    createdAt: "2024-01-15",
    updatedAt: "2024-02-15",
    notes: "Projet suspendu en attente de matériaux",
  },
]

export const getProjects = (): Project[] => {
  return mockProjects
}

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find((project) => project.id === id)
}

export const getOverdueProjects = (): Project[] => {
  return mockProjects.filter((project) => project.status === "en_retard")
}

export const updateStageProgress = (projectId: string, stageId: string, progress: number): boolean => {
  const project = mockProjects.find((p) => p.id === projectId)
  if (project) {
    const stage = project.stages.find((s) => s.id === stageId)
    if (stage) {
      stage.progress = progress
      if (progress === 100) {
        stage.status = "termine"
      } else if (progress > 0) {
        stage.status = "en_cours"
      }
      // Update project overall progress
      const totalProgress = project.stages.reduce((sum, s) => sum + s.progress, 0)
      project.progress = Math.round(totalProgress / project.stages.length)
      project.updatedAt = new Date().toISOString().split("T")[0]
      return true
    }
  }
  return false
}

export const addStageEvaluation = (
  projectId: string,
  stageId: string,
  evaluation: Omit<StageEvaluation, "evaluatedAt">,
): boolean => {
  const project = mockProjects.find((p) => p.id === projectId)
  if (project) {
    const stage = project.stages.find((s) => s.id === stageId)
    if (stage) {
      stage.evaluation = {
        ...evaluation,
        evaluatedAt: new Date().toISOString().split("T")[0],
      }
      return true
    }
  }
  return false
}
