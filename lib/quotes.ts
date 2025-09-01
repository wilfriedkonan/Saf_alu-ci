export interface Quote {
  id: string
  number: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectTitle: string
  description: string
  items: QuoteItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: QuoteStatus
  validUntil: string
  createdAt: string
  updatedAt: string
  createdBy: string
  notes?: string
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export type QuoteStatus = "brouillon" | "envoye" | "en_negociation" | "valide" | "refuse"

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  en_negociation: "En négociation",
  valide: "Validé",
  refuse: "Refusé",
}

export const quoteStatusColors: Record<QuoteStatus, string> = {
  brouillon: "bg-gray-100 text-gray-800",
  envoye: "bg-blue-100 text-blue-800",
  en_negociation: "bg-yellow-100 text-yellow-800",
  valide: "bg-green-100 text-green-800",
  refuse: "bg-red-100 text-red-800",
}

// Mock quotes data
export const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "DEV-2024-001",
    clientName: "SODECI",
    clientEmail: "contact@sodeci.ci",
    clientPhone: "+225 27 21 23 45 67",
    clientAddress: "Abidjan, Plateau",
    projectTitle: "Rénovation bureaux administratifs",
    description: "Rénovation complète des bureaux du siège social",
    items: [
      {
        id: "1",
        description: "Démolition cloisons existantes",
        quantity: 50,
        unit: "m²",
        unitPrice: 15000,
        total: 750000,
      },
      {
        id: "2",
        description: "Installation nouvelles cloisons",
        quantity: 50,
        unit: "m²",
        unitPrice: 35000,
        total: 1750000,
      },
      {
        id: "3",
        description: "Peinture intérieure",
        quantity: 200,
        unit: "m²",
        unitPrice: 8000,
        total: 1600000,
      },
    ],
    subtotal: 4100000,
    taxRate: 18,
    taxAmount: 738000,
    total: 4838000,
    status: "valide",
    validUntil: "2024-12-31",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    createdBy: "pierre.commercial@construction.fr",
    notes: "Client très satisfait, projet validé rapidement",
  },
  {
    id: "2",
    number: "DEV-2024-002",
    clientName: "Orange Côte d'Ivoire",
    clientEmail: "projets@orange.ci",
    clientPhone: "+225 27 21 30 00 00",
    clientAddress: "Abidjan, Cocody",
    projectTitle: "Extension centre de données",
    description: "Extension et sécurisation du centre de données principal",
    items: [
      {
        id: "1",
        description: "Gros œuvre extension",
        quantity: 100,
        unit: "m²",
        unitPrice: 85000,
        total: 8500000,
      },
      {
        id: "2",
        description: "Installation système climatisation",
        quantity: 1,
        unit: "forfait",
        unitPrice: 15000000,
        total: 15000000,
      },
    ],
    subtotal: 23500000,
    taxRate: 18,
    taxAmount: 4230000,
    total: 27730000,
    status: "en_negociation",
    validUntil: "2024-12-15",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-10",
    createdBy: "pierre.commercial@construction.fr",
  },
  {
    id: "3",
    number: "DEV-2024-003",
    clientName: "Banque Atlantique",
    clientEmail: "infrastructure@atlantique.ci",
    clientPhone: "+225 27 21 25 25 25",
    clientAddress: "Abidjan, Plateau",
    projectTitle: "Rénovation agence bancaire",
    description: "Modernisation complète de l'agence principale",
    items: [
      {
        id: "1",
        description: "Rénovation façade",
        quantity: 80,
        unit: "m²",
        unitPrice: 45000,
        total: 3600000,
      },
      {
        id: "2",
        description: "Aménagement intérieur",
        quantity: 150,
        unit: "m²",
        unitPrice: 55000,
        total: 8250000,
      },
    ],
    subtotal: 11850000,
    taxRate: 18,
    taxAmount: 2133000,
    total: 13983000,
    status: "envoye",
    validUntil: "2024-11-30",
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
    createdBy: "pierre.commercial@construction.fr",
  },
  {
    id: "4",
    number: "DEV-2024-004",
    clientName: "Ministère de la Construction",
    clientEmail: "projets@construction.gouv.ci",
    clientPhone: "+225 27 21 35 35 35",
    clientAddress: "Abidjan, Plateau",
    projectTitle: "Construction école primaire",
    description: "Construction d'une école primaire de 12 classes",
    items: [
      {
        id: "1",
        description: "Fondations et gros œuvre",
        quantity: 800,
        unit: "m²",
        unitPrice: 75000,
        total: 60000000,
      },
      {
        id: "2",
        description: "Toiture et charpente",
        quantity: 800,
        unit: "m²",
        unitPrice: 25000,
        total: 20000000,
      },
      {
        id: "3",
        description: "Finitions et équipements",
        quantity: 1,
        unit: "forfait",
        unitPrice: 35000000,
        total: 35000000,
      },
    ],
    subtotal: 115000000,
    taxRate: 18,
    taxAmount: 20700000,
    total: 135700000,
    status: "brouillon",
    validUntil: "2024-12-31",
    createdAt: "2024-02-20",
    updatedAt: "2024-02-22",
    createdBy: "pierre.commercial@construction.fr",
    notes: "Projet en cours de finalisation, attente validation budget",
  },
  {
    id: "5",
    number: "DEV-2024-005",
    clientName: "Groupe NSIA",
    clientEmail: "developpement@nsia.ci",
    clientPhone: "+225 27 21 40 40 40",
    clientAddress: "Abidjan, Cocody",
    projectTitle: "Immeuble de bureaux",
    description: "Construction immeuble de bureaux R+5",
    items: [
      {
        id: "1",
        description: "Terrassement et fondations",
        quantity: 1,
        unit: "forfait",
        unitPrice: 45000000,
        total: 45000000,
      },
      {
        id: "2",
        description: "Structure béton armé",
        quantity: 1,
        unit: "forfait",
        unitPrice: 180000000,
        total: 180000000,
      },
    ],
    subtotal: 225000000,
    taxRate: 18,
    taxAmount: 40500000,
    total: 265500000,
    status: "refuse",
    validUntil: "2024-10-31",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-25",
    createdBy: "pierre.commercial@construction.fr",
    notes: "Budget trop élevé pour le client, négociation échouée",
  },
]

export const getQuotes = (): Quote[] => {
  return mockQuotes
}

export const getQuoteById = (id: string): Quote | undefined => {
  return mockQuotes.find((quote) => quote.id === id)
}

export const updateQuoteStatus = (id: string, status: QuoteStatus): Quote | undefined => {
  const quote = mockQuotes.find((q) => q.id === id)
  if (quote) {
    quote.status = status
    quote.updatedAt = new Date().toISOString().split("T")[0]
    return quote
  }
  return undefined
}

export const duplicateQuote = (id: string): Quote | undefined => {
  const originalQuote = mockQuotes.find((q) => q.id === id)
  if (originalQuote) {
    const newQuote: Quote = {
      ...originalQuote,
      id: Date.now().toString(),
      number: `DEV-2024-${String(mockQuotes.length + 1).padStart(3, "0")}`,
      status: "brouillon",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      notes: `Copie de ${originalQuote.number}`,
    }
    mockQuotes.push(newQuote)
    return newQuote
  }
  return undefined
}
