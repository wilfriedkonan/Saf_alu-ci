export interface DQELot {
  code: string
  nom: string
  description?: string
  ordre: number
  totalRevenueHT: number
  pourcentageTotal: number
  chapitres: DQEChapitre[]
}

export interface DQEChapitre {
  code: string
  nom: string
  description?: string
  ordre: number
  totalRevenueHT: number
  postes: DQEPoste[]
}

export interface DQEPoste {
  code: string
  designation: string
  description?: string
  unite: string
  quantite: number
  prixUnitaireHT: number
  totalRevenueHT: number
  ordre: number
}

export interface DQE {
  id: string
  reference: string
  nom: string
  description?: string
  clientId: string
  clientName: string
  devisId?: string
  statut: "brouillon" | "en_cours" | "validé"
  tauxTVA: number
  totalRevenueHT: number
  montantTVA: number
  totalTTC: number
  dateCreation: Date
  dateValidation?: Date
  validePar?: string
  conversionState: "converted" | "convertible" | "not_convertible"
  projetReference?: string
  projetStatut?: string
  projetAvancement?: number
  lots: DQELot[]
}

export const mockDQEs: DQE[] = [
  {
    id: "1",
    reference: "DQE-2024-023",
    nom: "Centre Médical Abobo",
    description: "Construction d'un centre médical moderne à Abobo",
    clientId: "1",
    clientName: "SAMU Côte d'Ivoire",
    statut: "validé",
    tauxTVA: 18,
    totalRevenueHT: 24350000,
    montantTVA: 4383000,
    totalTTC: 28733000,
    dateCreation: new Date("2024-01-15"),
    dateValidation: new Date("2024-01-20"),
    validePar: "Jean Kouassi",
    conversionState: "converted",
    projetReference: "PROJ-2024-046",
    projetStatut: "En cours",
    projetAvancement: 45,
    lots: [
      {
        code: "LOT 1",
        nom: "TERRASSEMENTS",
        description: "Travaux de terrassement et préparation du terrain",
        ordre: 1,
        totalRevenueHT: 850000,
        pourcentageTotal: 3.49,
        chapitres: [
          {
            code: "1.1",
            nom: "Déblais",
            description: "Travaux de déblaiement",
            ordre: 1,
            totalRevenueHT: 600000,
            postes: [
              {
                code: "1.1.1",
                designation: "Déblai manuel",
                description: "Déblai manuel du terrain",
                unite: "m³",
                quantite: 150,
                prixUnitaireHT: 2500,
                totalRevenueHT: 375000,
                ordre: 1,
              },
              {
                code: "1.1.2",
                designation: "Évacuation terres",
                description: "Évacuation des terres excavées",
                unite: "m³",
                quantite: 150,
                prixUnitaireHT: 1500,
                totalRevenueHT: 225000,
                ordre: 2,
              },
            ],
          },
          {
            code: "1.2",
            nom: "Remblais",
            description: "Travaux de remblaiement",
            ordre: 2,
            totalRevenueHT: 250000,
            postes: [
              {
                code: "1.2.1",
                designation: "Remblai compacté",
                description: "Remblai compacté par couches",
                unite: "m³",
                quantite: 100,
                prixUnitaireHT: 2500,
                totalRevenueHT: 250000,
                ordre: 1,
              },
            ],
          },
        ],
      },
      {
        code: "LOT 2",
        nom: "GROS ŒUVRE",
        description: "Travaux de gros œuvre en béton armé",
        ordre: 2,
        totalRevenueHT: 12500000,
        pourcentageTotal: 51.33,
        chapitres: [
          {
            code: "2.1",
            nom: "Fondations",
            description: "Fondations en béton armé",
            ordre: 1,
            totalRevenueHT: 4500000,
            postes: [
              {
                code: "2.1.1",
                designation: "Semelles filantes béton armé",
                description: "Semelles filantes en béton armé dosé à 350kg/m³",
                unite: "m³",
                quantite: 45,
                prixUnitaireHT: 85000,
                totalRevenueHT: 3825000,
                ordre: 1,
              },
              {
                code: "2.1.2",
                designation: "Longrines béton armé",
                description: "Longrines de liaison en béton armé",
                unite: "ml",
                quantite: 135,
                prixUnitaireHT: 5000,
                totalRevenueHT: 675000,
                ordre: 2,
              },
            ],
          },
          {
            code: "2.2",
            nom: "Élévation",
            description: "Élévation des structures verticales",
            ordre: 2,
            totalRevenueHT: 8000000,
            postes: [
              {
                code: "2.2.1",
                designation: "Poteaux béton armé",
                description: "Poteaux en béton armé 25x25cm",
                unite: "ml",
                quantite: 120,
                prixUnitaireHT: 35000,
                totalRevenueHT: 4200000,
                ordre: 1,
              },
              {
                code: "2.2.2",
                designation: "Poutres béton armé",
                description: "Poutres en béton armé 25x30cm",
                unite: "ml",
                quantite: 95,
                prixUnitaireHT: 40000,
                totalRevenueHT: 3800000,
                ordre: 2,
              },
            ],
          },
        ],
      },
      {
        code: "LOT 3",
        nom: "MAÇONNERIE",
        description: "Travaux de maçonnerie",
        ordre: 3,
        totalRevenueHT: 4200000,
        pourcentageTotal: 17.24,
        chapitres: [
          {
            code: "3.1",
            nom: "Murs extérieurs",
            description: "Murs de façade",
            ordre: 1,
            totalRevenueHT: 2800000,
            postes: [
              {
                code: "3.1.1",
                designation: "Mur parpaing 15cm",
                description: "Mur en parpaing creux de 15cm",
                unite: "m²",
                quantite: 280,
                prixUnitaireHT: 10000,
                totalRevenueHT: 2800000,
                ordre: 1,
              },
            ],
          },
          {
            code: "3.2",
            nom: "Cloisons intérieures",
            description: "Cloisons de distribution",
            ordre: 2,
            totalRevenueHT: 1400000,
            postes: [
              {
                code: "3.2.1",
                designation: "Cloison parpaing 10cm",
                description: "Cloison en parpaing creux de 10cm",
                unite: "m²",
                quantite: 175,
                prixUnitaireHT: 8000,
                totalRevenueHT: 1400000,
                ordre: 1,
              },
            ],
          },
        ],
      },
      {
        code: "LOT 4",
        nom: "CHARPENTE ET COUVERTURE",
        description: "Charpente métallique et couverture",
        ordre: 4,
        totalRevenueHT: 3500000,
        pourcentageTotal: 14.37,
        chapitres: [
          {
            code: "4.1",
            nom: "Charpente métallique",
            description: "Structure métallique de toiture",
            ordre: 1,
            totalRevenueHT: 2000000,
            postes: [
              {
                code: "4.1.1",
                designation: "Fermes métalliques",
                description: "Fermes métalliques en profilés IPE",
                unite: "kg",
                quantite: 2500,
                prixUnitaireHT: 800,
                totalRevenueHT: 2000000,
                ordre: 1,
              },
            ],
          },
          {
            code: "4.2",
            nom: "Couverture",
            description: "Couverture en tôles",
            ordre: 2,
            totalRevenueHT: 1500000,
            postes: [
              {
                code: "4.2.1",
                designation: "Tôles bac acier",
                description: "Tôles bac acier nervuré",
                unite: "m²",
                quantite: 250,
                prixUnitaireHT: 6000,
                totalRevenueHT: 1500000,
                ordre: 1,
              },
            ],
          },
        ],
      },
      {
        code: "LOT 5",
        nom: "REVÊTEMENTS ET FINITIONS",
        description: "Travaux de finition",
        ordre: 5,
        totalRevenueHT: 3300000,
        pourcentageTotal: 13.55,
        chapitres: [
          {
            code: "5.1",
            nom: "Enduits",
            description: "Enduits de façade et intérieurs",
            ordre: 1,
            totalRevenueHT: 1800000,
            postes: [
              {
                code: "5.1.1",
                designation: "Enduit ciment lissé",
                description: "Enduit ciment lissé taloché",
                unite: "m²",
                quantite: 450,
                prixUnitaireHT: 4000,
                totalRevenueHT: 1800000,
                ordre: 1,
              },
            ],
          },
          {
            code: "5.2",
            nom: "Peinture",
            description: "Peinture intérieure et extérieure",
            ordre: 2,
            totalRevenueHT: 1500000,
            postes: [
              {
                code: "5.2.1",
                designation: "Peinture acrylique 2 couches",
                description: "Peinture acrylique mate 2 couches",
                unite: "m²",
                quantite: 500,
                prixUnitaireHT: 3000,
                totalRevenueHT: 1500000,
                ordre: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    reference: "DQE-2024-024",
    nom: "Réhabilitation Bâtiment Administratif",
    description: "Réhabilitation complète d'un bâtiment administratif",
    clientId: "2",
    clientName: "MINEDD",
    statut: "validé",
    tauxTVA: 18,
    totalRevenueHT: 12800000,
    montantTVA: 2304000,
    totalTTC: 15104000,
    dateCreation: new Date("2024-01-20"),
    dateValidation: new Date("2024-01-25"),
    validePar: "Marie Diallo",
    conversionState: "convertible",
    lots: [],
  },
  {
    id: "3",
    reference: "DQE-2024-025",
    nom: "Extension Station d'Épuration",
    description: "Extension et modernisation de la station d'épuration",
    clientId: "3",
    clientName: "ONEP",
    statut: "validé",
    tauxTVA: 18,
    totalRevenueHT: 18900000,
    montantTVA: 3402000,
    totalTTC: 22302000,
    dateCreation: new Date("2024-01-25"),
    dateValidation: new Date("2024-01-30"),
    validePar: "Amadou Traoré",
    conversionState: "convertible",
    lots: [],
  },
  {
    id: "4",
    reference: "DQE-2024-026",
    nom: "Construction École Primaire",
    description: "Construction d'une école primaire de 6 classes",
    clientId: "4",
    clientName: "Mairie d'Abobo",
    statut: "brouillon",
    tauxTVA: 18,
    totalRevenueHT: 8500000,
    montantTVA: 1530000,
    totalTTC: 10030000,
    dateCreation: new Date("2024-02-01"),
    conversionState: "not_convertible",
    lots: [],
  },
  {
    id: "5",
    reference: "DQE-2024-027",
    nom: "Aménagement Espace Vert Public",
    description: "Aménagement paysager d'un espace vert public",
    clientId: "5",
    clientName: "District d'Abidjan",
    statut: "en_cours",
    tauxTVA: 18,
    totalRevenueHT: 5200000,
    montantTVA: 936000,
    totalTTC: 6136000,
    dateCreation: new Date("2024-02-05"),
    conversionState: "not_convertible",
    lots: [],
  },
]

export function getStatutLabel(statut: DQE["statut"]): string {
  const labels = {
    brouillon: "Brouillon",
    en_cours: "En cours",
    validé: "Validé",
  }
  return labels[statut]
}

export function getStatutColor(statut: DQE["statut"]): string {
  const colors = {
    brouillon: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    en_cours: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    validé: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }
  return colors[statut]
}

export function getConversionStateLabel(state: DQE["conversionState"]): string {
  const labels = {
    converted: "Converti",
    convertible: "Convertible",
    not_convertible: "Non convertible",
  }
  return labels[state]
}

export function getConversionStateColor(state: DQE["conversionState"]): string {
  const colors = {
    converted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    convertible: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    not_convertible: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  }
  return colors[state]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
