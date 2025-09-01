export interface Subcontractor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  specialties: SubcontractorSpecialty[]
  status: SubcontractorStatus
  averageRating: number
  totalProjects: number
  completedProjects: number
  onTimeDelivery: number
  documents: SubcontractorDocument[]
  evaluations: SubcontractorEvaluation[]
  projectHistory: ProjectHistoryItem[]
  createdAt: string
  updatedAt: string
  notes?: string
  isActive: boolean
}

export interface SubcontractorDocument {
  id: string
  name: string
  type: DocumentType
  url: string
  expiryDate?: string
  uploadedAt: string
  isValid: boolean
}

export interface SubcontractorEvaluation {
  id: string
  projectId: string
  projectName: string
  rating: number
  comment: string
  evaluatedBy: string
  evaluatedAt: string
  criteria: EvaluationCriteria
}

export interface EvaluationCriteria {
  quality: number
  timeliness: number
  communication: number
  professionalism: number
}

export interface ProjectHistoryItem {
  id: string
  projectId: string
  projectName: string
  role: string
  startDate: string
  endDate: string
  status: ProjectStatus
  amount: number
  rating?: number
}

export type SubcontractorSpecialty =
  | "electricite"
  | "plomberie"
  | "maconnerie"
  | "peinture"
  | "carrelage"
  | "menuiserie"
  | "toiture"
  | "climatisation"
  | "securite"
  | "jardinage"

export type SubcontractorStatus = "actif" | "inactif" | "suspendu" | "en_evaluation"
export type DocumentType = "assurance" | "certification" | "licence" | "cv" | "autre"
export type ProjectStatus = "en_cours" | "termine" | "annule"

export const specialtyLabels: Record<SubcontractorSpecialty, string> = {
  electricite: "Électricité",
  plomberie: "Plomberie",
  maconnerie: "Maçonnerie",
  peinture: "Peinture",
  carrelage: "Carrelage",
  menuiserie: "Menuiserie",
  toiture: "Toiture",
  climatisation: "Climatisation",
  securite: "Sécurité",
  jardinage: "Jardinage",
}

export const statusLabels: Record<SubcontractorStatus, string> = {
  actif: "Actif",
  inactif: "Inactif",
  suspendu: "Suspendu",
  en_evaluation: "En évaluation",
}

export const statusColors: Record<SubcontractorStatus, string> = {
  actif: "bg-green-100 text-green-800",
  inactif: "bg-gray-100 text-gray-800",
  suspendu: "bg-red-100 text-red-800",
  en_evaluation: "bg-yellow-100 text-yellow-800",
}

// Mock subcontractors data
export const mockSubcontractors: Subcontractor[] = [
  {
    id: "1",
    name: "Jean-Baptiste Kouame",
    company: "Electricité Pro",
    email: "contact@electricitepro.ci",
    phone: "+225 05 12 34 56 78",
    address: "Yopougon, Abidjan",
    specialties: ["electricite", "climatisation"],
    status: "actif",
    averageRating: 4.5,
    totalProjects: 12,
    completedProjects: 11,
    onTimeDelivery: 91,
    documents: [
      {
        id: "1",
        name: "Assurance responsabilité civile",
        type: "assurance",
        url: "/docs/assurance-electricite-pro.pdf",
        expiryDate: "2024-12-31",
        uploadedAt: "2024-01-15",
        isValid: true,
      },
      {
        id: "2",
        name: "Certification électricien",
        type: "certification",
        url: "/docs/cert-electricien.pdf",
        uploadedAt: "2024-01-15",
        isValid: true,
      },
    ],
    evaluations: [
      {
        id: "1",
        projectId: "1",
        projectName: "Rénovation Villa Cocody",
        rating: 5,
        comment: "Excellent travail, très professionnel et ponctuel",
        evaluatedBy: "Marie Dubois",
        evaluatedAt: "2024-02-16",
        criteria: {
          quality: 5,
          timeliness: 5,
          communication: 4,
          professionalism: 5,
        },
      },
      {
        id: "2",
        projectId: "5",
        projectName: "Bureau Orange Cocody",
        rating: 4,
        comment: "Bon travail, léger retard sur la livraison",
        evaluatedBy: "Marie Dubois",
        evaluatedAt: "2024-01-20",
        criteria: {
          quality: 4,
          timeliness: 3,
          communication: 4,
          professionalism: 4,
        },
      },
    ],
    projectHistory: [
      {
        id: "1",
        projectId: "1",
        projectName: "Rénovation Villa Cocody",
        role: "Installation électrique",
        startDate: "2024-02-16",
        endDate: "2024-02-28",
        status: "termine",
        amount: 2500000,
        rating: 5,
      },
      {
        id: "2",
        projectId: "5",
        projectName: "Bureau Orange Cocody",
        role: "Installation électrique et climatisation",
        startDate: "2024-01-10",
        endDate: "2024-01-22",
        status: "termine",
        amount: 3200000,
        rating: 4,
      },
    ],
    createdAt: "2023-12-01",
    updatedAt: "2024-02-16",
    isActive: true,
  },
  {
    id: "2",
    name: "Amadou Traore",
    company: "Plomberie Expert",
    email: "amadou@plomberie-expert.ci",
    phone: "+225 07 23 45 67 89",
    address: "Marcory, Abidjan",
    specialties: ["plomberie"],
    status: "actif",
    averageRating: 4.2,
    totalProjects: 8,
    completedProjects: 7,
    onTimeDelivery: 87,
    documents: [
      {
        id: "1",
        name: "Assurance professionnelle",
        type: "assurance",
        url: "/docs/assurance-plomberie.pdf",
        expiryDate: "2024-11-30",
        uploadedAt: "2024-01-10",
        isValid: true,
      },
    ],
    evaluations: [
      {
        id: "1",
        projectId: "1",
        projectName: "Rénovation Villa Cocody",
        rating: 4,
        comment: "Travail correct, quelques retouches nécessaires",
        evaluatedBy: "Marie Dubois",
        evaluatedAt: "2024-03-10",
        criteria: {
          quality: 4,
          timeliness: 4,
          communication: 4,
          professionalism: 4,
        },
      },
    ],
    projectHistory: [
      {
        id: "1",
        projectId: "1",
        projectName: "Rénovation Villa Cocody",
        role: "Installation sanitaire",
        startDate: "2024-03-01",
        endDate: "2024-03-10",
        status: "termine",
        amount: 1800000,
        rating: 4,
      },
    ],
    createdAt: "2023-11-15",
    updatedAt: "2024-03-10",
    isActive: true,
  },
  {
    id: "3",
    name: "Fatou Diallo",
    company: "Peinture Moderne",
    email: "fatou@peinture-moderne.ci",
    phone: "+225 01 34 56 78 90",
    address: "Cocody, Abidjan",
    specialties: ["peinture"],
    status: "actif",
    averageRating: 4.8,
    totalProjects: 15,
    completedProjects: 15,
    onTimeDelivery: 100,
    documents: [
      {
        id: "1",
        name: "Certification peintre professionnel",
        type: "certification",
        url: "/docs/cert-peintre.pdf",
        uploadedAt: "2023-12-01",
        isValid: true,
      },
    ],
    evaluations: [
      {
        id: "1",
        projectId: "3",
        projectName: "Agence Banque Atlantique",
        rating: 5,
        comment: "Travail impeccable, finitions parfaites",
        evaluatedBy: "Marie Dubois",
        evaluatedAt: "2024-02-20",
        criteria: {
          quality: 5,
          timeliness: 5,
          communication: 5,
          professionalism: 5,
        },
      },
    ],
    projectHistory: [
      {
        id: "1",
        projectId: "3",
        projectName: "Agence Banque Atlantique",
        role: "Peinture intérieure et extérieure",
        startDate: "2024-02-10",
        endDate: "2024-02-20",
        status: "termine",
        amount: 2200000,
        rating: 5,
      },
    ],
    createdAt: "2023-10-01",
    updatedAt: "2024-02-20",
    isActive: true,
  },
  {
    id: "4",
    name: "Koffi Assi",
    company: "BTP Solutions",
    email: "koffi@btp-solutions.ci",
    phone: "+225 05 67 89 01 23",
    address: "Plateau, Abidjan",
    specialties: ["maconnerie", "toiture"],
    status: "actif",
    averageRating: 4.6,
    totalProjects: 20,
    completedProjects: 18,
    onTimeDelivery: 90,
    documents: [
      {
        id: "1",
        name: "Licence entrepreneur BTP",
        type: "licence",
        url: "/docs/licence-btp.pdf",
        expiryDate: "2025-06-30",
        uploadedAt: "2023-12-15",
        isValid: true,
      },
      {
        id: "2",
        name: "Assurance tous risques chantier",
        type: "assurance",
        url: "/docs/assurance-btp.pdf",
        expiryDate: "2024-12-31",
        uploadedAt: "2023-12-15",
        isValid: true,
      },
    ],
    evaluations: [
      {
        id: "1",
        projectId: "2",
        projectName: "Immeuble SODECI",
        rating: 5,
        comment: "Excellent travail sur les fondations, très professionnel",
        evaluatedBy: "Marie Dubois",
        evaluatedAt: "2024-03-02",
        criteria: {
          quality: 5,
          timeliness: 5,
          communication: 4,
          professionalism: 5,
        },
      },
    ],
    projectHistory: [
      {
        id: "1",
        projectId: "2",
        projectName: "Immeuble SODECI",
        role: "Terrassement et fondations",
        startDate: "2024-02-01",
        endDate: "2024-03-01",
        status: "termine",
        amount: 45000000,
        rating: 5,
      },
    ],
    createdAt: "2023-09-01",
    updatedAt: "2024-03-02",
    isActive: true,
  },
  {
    id: "5",
    name: "Aya Kone",
    company: "Carrelage Design",
    email: "aya@carrelage-design.ci",
    phone: "+225 07 89 01 23 45",
    address: "Treichville, Abidjan",
    specialties: ["carrelage"],
    status: "actif",
    averageRating: 4.3,
    totalProjects: 10,
    completedProjects: 9,
    onTimeDelivery: 90,
    documents: [],
    evaluations: [],
    projectHistory: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    isActive: true,
  },
  {
    id: "6",
    name: "Ibrahim Ouattara",
    company: "Menuiserie Moderne",
    email: "ibrahim@menuiserie-moderne.ci",
    phone: "+225 01 23 45 67 89",
    address: "Adjamé, Abidjan",
    specialties: ["menuiserie"],
    status: "en_evaluation",
    averageRating: 0,
    totalProjects: 0,
    completedProjects: 0,
    onTimeDelivery: 0,
    documents: [
      {
        id: "1",
        name: "CV et références",
        type: "cv",
        url: "/docs/cv-menuisier.pdf",
        uploadedAt: "2024-02-20",
        isValid: true,
      },
    ],
    evaluations: [],
    projectHistory: [],
    createdAt: "2024-02-20",
    updatedAt: "2024-02-20",
    notes: "Nouveau sous-traitant, en période d'évaluation",
    isActive: true,
  },
  {
    id: "7",
    name: "Salif Diabate",
    company: "Sécurité Plus",
    email: "salif@securite-plus.ci",
    phone: "+225 05 34 56 78 90",
    address: "Port-Bouët, Abidjan",
    specialties: ["securite"],
    status: "suspendu",
    averageRating: 2.5,
    totalProjects: 3,
    completedProjects: 2,
    onTimeDelivery: 66,
    documents: [],
    evaluations: [
      {
        id: "1",
        projectId: "4",
        projectName: "Villa Riviera",
        rating: 2,
        comment: "Travail insuffisant, nombreux défauts constatés",
        evaluatedBy: "Marie Dubois",
        evaluatedAt: "2024-01-30",
        criteria: {
          quality: 2,
          timeliness: 3,
          communication: 2,
          professionalism: 3,
        },
      },
    ],
    projectHistory: [
      {
        id: "1",
        projectId: "4",
        projectName: "Villa Riviera",
        role: "Installation système sécurité",
        startDate: "2024-01-15",
        endDate: "2024-01-30",
        status: "termine",
        amount: 1500000,
        rating: 2,
      },
    ],
    createdAt: "2023-12-01",
    updatedAt: "2024-01-30",
    notes: "Suspendu suite à des problèmes de qualité répétés",
    isActive: false,
  },
]

export const getSubcontractors = (): Subcontractor[] => {
  return mockSubcontractors.filter((sub) => sub.isActive)
}

export const getAllSubcontractors = (): Subcontractor[] => {
  return mockSubcontractors
}

export const getSubcontractorById = (id: string): Subcontractor | undefined => {
  return mockSubcontractors.find((sub) => sub.id === id)
}

export const getSubcontractorsBySpecialty = (specialty: SubcontractorSpecialty): Subcontractor[] => {
  return mockSubcontractors.filter((sub) => sub.specialties.includes(specialty) && sub.isActive)
}

export const getTopRatedSubcontractors = (limit = 5): Subcontractor[] => {
  return mockSubcontractors
    .filter((sub) => sub.isActive && sub.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit)
}

export const updateSubcontractorStatus = (id: string, status: SubcontractorStatus): boolean => {
  const subcontractor = mockSubcontractors.find((sub) => sub.id === id)
  if (subcontractor) {
    subcontractor.status = status
    subcontractor.updatedAt = new Date().toISOString().split("T")[0]
    if (status === "suspendu" || status === "inactif") {
      subcontractor.isActive = false
    } else {
      subcontractor.isActive = true
    }
    return true
  }
  return false
}

export const addEvaluation = (
  subcontractorId: string,
  evaluation: Omit<SubcontractorEvaluation, "id" | "evaluatedAt">,
): boolean => {
  const subcontractor = mockSubcontractors.find((sub) => sub.id === subcontractorId)
  if (subcontractor) {
    const newEvaluation: SubcontractorEvaluation = {
      ...evaluation,
      id: Date.now().toString(),
      evaluatedAt: new Date().toISOString().split("T")[0],
    }
    subcontractor.evaluations.push(newEvaluation)

    // Recalculate average rating
    const totalRating = subcontractor.evaluations.reduce((sum, eval) => sum + eval.rating, 0)
    subcontractor.averageRating = Math.round((totalRating / subcontractor.evaluations.length) * 10) / 10

    subcontractor.updatedAt = new Date().toISOString().split("T")[0]
    return true
  }
  return false
}

export const getSubcontractorStats = () => {
  const active = mockSubcontractors.filter((sub) => sub.status === "actif").length
  const total = mockSubcontractors.length
  const averageRating =
    mockSubcontractors.filter((sub) => sub.averageRating > 0).reduce((sum, sub) => sum + sub.averageRating, 0) /
    mockSubcontractors.filter((sub) => sub.averageRating > 0).length
  const topPerformers = mockSubcontractors.filter((sub) => sub.averageRating >= 4.5).length

  return { active, total, averageRating: Math.round(averageRating * 10) / 10, topPerformers }
}
