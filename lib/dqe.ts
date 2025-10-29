export interface DQELot {
    id: string
    numero: string
    designation: string
    montantHT: number
    chapitres: DQEChapitre[]
  }
  
  export interface DQEChapitre {
    id: string
    numero: string
    designation: string
    montantHT: number
    postes: DQEPoste[]
  }
  
  export interface DQEPoste {
    id: string
    numero: string
    designation: string
    unite: string
    quantite: number
    prixUnitaire: number
    montantHT: number
  }
  
  export interface DQE {
    id: string
    reference: string
    nomProjet: string
    client: string
    statut: "brouillon" | "en_cours" | "validé"
    budgetTotalHT: number
    nombreLots: number
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
      nomProjet: "Centre Médical Abobo",
      client: "SAMU Côte d'Ivoire",
      statut: "validé",
      budgetTotalHT: 24350000,
      nombreLots: 5,
      dateCreation: new Date("2024-01-15"),
      dateValidation: new Date("2024-01-20"),
      validePar: "Jean Kouassi",
      conversionState: "converted",
      projetReference: "PROJ-2024-046",
      projetStatut: "En cours",
      projetAvancement: 45,
      lots: [
        {
          id: "lot1",
          numero: "LOT 1",
          designation: "TERRASSEMENTS",
          montantHT: 850000,
          chapitres: [
            {
              id: "chap1.1",
              numero: "CHAPITRE 1.1",
              designation: "Déblais",
              montantHT: 600000,
              postes: [
                {
                  id: "poste1.1.1",
                  numero: "1.1.1",
                  designation: "Déblai manuel",
                  unite: "m³",
                  quantite: 150,
                  prixUnitaire: 2500,
                  montantHT: 375000,
                },
                {
                  id: "poste1.1.2",
                  numero: "1.1.2",
                  designation: "Évacuation terres",
                  unite: "m³",
                  quantite: 150,
                  prixUnitaire: 1500,
                  montantHT: 225000,
                },
              ],
            },
            {
              id: "chap1.2",
              numero: "CHAPITRE 1.2",
              designation: "Remblais",
              montantHT: 250000,
              postes: [
                {
                  id: "poste1.2.1",
                  numero: "1.2.1",
                  designation: "Remblai compacté",
                  unite: "m³",
                  quantite: 100,
                  prixUnitaire: 2500,
                  montantHT: 250000,
                },
              ],
            },
          ],
        },
        {
          id: "lot2",
          numero: "LOT 2",
          designation: "GROS ŒUVRE",
          montantHT: 12500000,
          chapitres: [
            {
              id: "chap2.1",
              numero: "CHAPITRE 2.1",
              designation: "Fondations",
              montantHT: 4500000,
              postes: [
                {
                  id: "poste2.1.1",
                  numero: "2.1.1",
                  designation: "Semelles filantes béton armé",
                  unite: "m³",
                  quantite: 45,
                  prixUnitaire: 85000,
                  montantHT: 3825000,
                },
                {
                  id: "poste2.1.2",
                  numero: "2.1.2",
                  designation: "Longrines béton armé",
                  unite: "ml",
                  quantite: 135,
                  prixUnitaire: 5000,
                  montantHT: 675000,
                },
              ],
            },
            {
              id: "chap2.2",
              numero: "CHAPITRE 2.2",
              designation: "Élévation",
              montantHT: 8000000,
              postes: [
                {
                  id: "poste2.2.1",
                  numero: "2.2.1",
                  designation: "Poteaux béton armé",
                  unite: "ml",
                  quantite: 120,
                  prixUnitaire: 35000,
                  montantHT: 4200000,
                },
                {
                  id: "poste2.2.2",
                  numero: "2.2.2",
                  designation: "Poutres béton armé",
                  unite: "ml",
                  quantite: 95,
                  prixUnitaire: 40000,
                  montantHT: 3800000,
                },
              ],
            },
          ],
        },
        {
          id: "lot3",
          numero: "LOT 3",
          designation: "MAÇONNERIE",
          montantHT: 4200000,
          chapitres: [
            {
              id: "chap3.1",
              numero: "CHAPITRE 3.1",
              designation: "Murs extérieurs",
              montantHT: 2800000,
              postes: [
                {
                  id: "poste3.1.1",
                  numero: "3.1.1",
                  designation: "Mur parpaing 15cm",
                  unite: "m²",
                  quantite: 280,
                  prixUnitaire: 10000,
                  montantHT: 2800000,
                },
              ],
            },
            {
              id: "chap3.2",
              numero: "CHAPITRE 3.2",
              designation: "Cloisons intérieures",
              montantHT: 1400000,
              postes: [
                {
                  id: "poste3.2.1",
                  numero: "3.2.1",
                  designation: "Cloison parpaing 10cm",
                  unite: "m²",
                  quantite: 175,
                  prixUnitaire: 8000,
                  montantHT: 1400000,
                },
              ],
            },
          ],
        },
        {
          id: "lot4",
          numero: "LOT 4",
          designation: "CHARPENTE ET COUVERTURE",
          montantHT: 3500000,
          chapitres: [
            {
              id: "chap4.1",
              numero: "CHAPITRE 4.1",
              designation: "Charpente métallique",
              montantHT: 2000000,
              postes: [
                {
                  id: "poste4.1.1",
                  numero: "4.1.1",
                  designation: "Fermes métalliques",
                  unite: "kg",
                  quantite: 2500,
                  prixUnitaire: 800,
                  montantHT: 2000000,
                },
              ],
            },
            {
              id: "chap4.2",
              numero: "CHAPITRE 4.2",
              designation: "Couverture",
              montantHT: 1500000,
              postes: [
                {
                  id: "poste4.2.1",
                  numero: "4.2.1",
                  designation: "Tôles bac acier",
                  unite: "m²",
                  quantite: 250,
                  prixUnitaire: 6000,
                  montantHT: 1500000,
                },
              ],
            },
          ],
        },
        {
          id: "lot5",
          numero: "LOT 5",
          designation: "REVÊTEMENTS ET FINITIONS",
          montantHT: 3300000,
          chapitres: [
            {
              id: "chap5.1",
              numero: "CHAPITRE 5.1",
              designation: "Enduits",
              montantHT: 1800000,
              postes: [
                {
                  id: "poste5.1.1",
                  numero: "5.1.1",
                  designation: "Enduit ciment lissé",
                  unite: "m²",
                  quantite: 450,
                  prixUnitaire: 4000,
                  montantHT: 1800000,
                },
              ],
            },
            {
              id: "chap5.2",
              numero: "CHAPITRE 5.2",
              designation: "Peinture",
              montantHT: 1500000,
              postes: [
                {
                  id: "poste5.2.1",
                  numero: "5.2.1",
                  designation: "Peinture acrylique 2 couches",
                  unite: "m²",
                  quantite: 500,
                  prixUnitaire: 3000,
                  montantHT: 1500000,
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
      nomProjet: "Réhabilitation Bâtiment Administratif",
      client: "MINEDD",
      statut: "validé",
      budgetTotalHT: 12800000,
      nombreLots: 5,
      dateCreation: new Date("2024-01-20"),
      dateValidation: new Date("2024-01-25"),
      validePar: "Marie Diallo",
      conversionState: "convertible",
      lots: [],
    },
    {
      id: "3",
      reference: "DQE-2024-025",
      nomProjet: "Extension Station d'Épuration",
      client: "ONEP",
      statut: "validé",
      budgetTotalHT: 18900000,
      nombreLots: 6,
      dateCreation: new Date("2024-01-25"),
      dateValidation: new Date("2024-01-30"),
      validePar: "Amadou Traoré",
      conversionState: "convertible",
      lots: [],
    },
    {
      id: "4",
      reference: "DQE-2024-026",
      nomProjet: "Construction École Primaire",
      client: "Mairie d'Abobo",
      statut: "brouillon",
      budgetTotalHT: 8500000,
      nombreLots: 4,
      dateCreation: new Date("2024-02-01"),
      conversionState: "not_convertible",
      lots: [],
    },
    {
      id: "5",
      reference: "DQE-2024-027",
      nomProjet: "Aménagement Espace Vert Public",
      client: "District d'Abidjan",
      statut: "en_cours",
      budgetTotalHT: 5200000,
      nombreLots: 3,
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
  