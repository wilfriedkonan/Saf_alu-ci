export interface Client {
    id: string
    name: string
    company?: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
    type: "particulier" | "entreprise"
    siret?: string
    tva?: string
    notes?: string
    createdAt: string
    totalProjects: number
    totalQuotes: number
    totalInvoices: number
    totalRevenue: number
    status: "actif" | "inactif" | "prospect"
  }
  
  export const mockClients: Client[] = [
    {
      id: "1",
      name: "Jean Dupont",
      company: "Dupont Construction",
      email: "jean.dupont@example.com",
      phone: "+225 07 12 34 56 78",
      address: "15 Avenue de la République",
      city: "Abidjan",
      postalCode: "00225",
      country: "Côte d'Ivoire",
      type: "entreprise",
      siret: "123 456 789 00012",
      tva: "FR12345678901",
      notes: "Client fidèle depuis 2020",
      createdAt: "2020-03-15",
      totalProjects: 12,
      totalQuotes: 18,
      totalInvoices: 15,
      totalRevenue: 450000,
      status: "actif",
    },
    {
      id: "2",
      name: "Marie Kouassi",
      email: "marie.kouassi@example.com",
      phone: "+225 07 23 45 67 89",
      address: "28 Rue des Jardins",
      city: "Abidjan",
      postalCode: "00225",
      country: "Côte d'Ivoire",
      type: "particulier",
      notes: "Rénovation maison individuelle",
      createdAt: "2023-01-10",
      totalProjects: 2,
      totalQuotes: 3,
      totalInvoices: 2,
      totalRevenue: 85000,
      status: "actif",
    },
    {
      id: "3",
      name: "Société Immobilière du Plateau",
      company: "SIP Immobilier",
      email: "contact@sip-immobilier.ci",
      phone: "+225 07 34 56 78 90",
      address: "Boulevard Clozel",
      city: "Abidjan",
      postalCode: "00225",
      country: "Côte d'Ivoire",
      type: "entreprise",
      siret: "987 654 321 00034",
      tva: "FR98765432109",
      notes: "Promoteur immobilier - Projets de grande envergure",
      createdAt: "2021-06-20",
      totalProjects: 8,
      totalQuotes: 12,
      totalInvoices: 10,
      totalRevenue: 1200000,
      status: "actif",
    },
    {
      id: "4",
      name: "Koné Amadou",
      email: "kone.amadou@example.com",
      phone: "+225 07 45 67 89 01",
      address: "Cocody Angré",
      city: "Abidjan",
      postalCode: "00225",
      country: "Côte d'Ivoire",
      type: "particulier",
      createdAt: "2024-02-05",
      totalProjects: 0,
      totalQuotes: 2,
      totalInvoices: 0,
      totalRevenue: 0,
      status: "prospect",
    },
    {
      id: "5",
      name: "Hôtel Ivoire",
      company: "Groupe Hôtelier CI",
      email: "maintenance@hotel-ivoire.ci",
      phone: "+225 07 56 78 90 12",
      address: "Boulevard Hassan II",
      city: "Abidjan",
      postalCode: "00225",
      country: "Côte d'Ivoire",
      type: "entreprise",
      siret: "456 789 123 00056",
      tva: "FR45678912305",
      notes: "Contrat de maintenance annuel",
      createdAt: "2019-11-30",
      totalProjects: 25,
      totalQuotes: 30,
      totalInvoices: 28,
      totalRevenue: 850000,
      status: "actif",
    },
    {
      id: "6",
      name: "Yao Bernadette",
      email: "yao.bernadette@example.com",
      phone: "+225 07 67 89 01 23",
      address: "Marcory Zone 4",
      city: "Abidjan",
      postalCode: "00225",
      country: "Côte d'Ivoire",
      type: "particulier",
      createdAt: "2022-08-12",
      totalProjects: 1,
      totalQuotes: 1,
      totalInvoices: 1,
      totalRevenue: 35000,
      status: "inactif",
    },
  ]
  
  export const clients = mockClients
  