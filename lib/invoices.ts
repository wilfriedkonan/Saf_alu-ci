export interface Invoice {
  id: string
  number: string
  type: InvoiceType
  status: InvoiceStatus
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectTitle: string
  description: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  dueDate: string
  paidDate?: string
  paidAmount: number
  remainingAmount: number
  paymentSchedule: PaymentScheduleItem[]
  relatedQuoteId?: string
  relatedProjectId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  notes?: string
  remindersSent: number
  lastReminderDate?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface PaymentScheduleItem {
  id: string
  description: string
  amount: number
  dueDate: string
  paidDate?: string
  status: PaymentStatus
}

export type InvoiceType = "facture_devis" | "facture_sous_traitant" | "avoir"
export type InvoiceStatus = "brouillon" | "envoyee" | "payee" | "en_retard" | "annulee" | "partiellement_payee"
export type PaymentStatus = "en_attente" | "payee" | "en_retard"

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  facture_devis: "Facture Devis",
  facture_sous_traitant: "Facture Sous-traitant",
  avoir: "Avoir",
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  en_retard: "En retard",
  annulee: "Annulée",
  partiellement_payee: "Partiellement payée",
}

export const invoiceStatusColors: Record<InvoiceStatus, string> = {
  brouillon: "bg-gray-100 text-gray-800",
  envoyee: "bg-blue-100 text-blue-800",
  payee: "bg-green-100 text-green-800",
  en_retard: "bg-red-100 text-red-800",
  annulee: "bg-gray-100 text-gray-800",
  partiellement_payee: "bg-yellow-100 text-yellow-800",
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  en_attente: "En attente",
  payee: "Payée",
  en_retard: "En retard",
}

// Mock invoices data
export const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "FACT-2024-001",
    type: "facture_devis",
    status: "payee",
    clientName: "SODECI",
    clientEmail: "contact@sodeci.ci",
    clientPhone: "+225 27 21 23 45 67",
    clientAddress: "Abidjan, Plateau",
    projectTitle: "Rénovation bureaux administratifs",
    description: "Facture pour rénovation complète des bureaux du siège social",
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
    dueDate: "2024-02-20",
    paidDate: "2024-02-18",
    paidAmount: 4838000,
    remainingAmount: 0,
    paymentSchedule: [
      {
        id: "1",
        description: "Paiement unique",
        amount: 4838000,
        dueDate: "2024-02-20",
        paidDate: "2024-02-18",
        status: "payee",
      },
    ],
    relatedQuoteId: "1",
    relatedProjectId: "1",
    createdAt: "2024-01-21",
    updatedAt: "2024-02-18",
    createdBy: "marie.chef@construction.fr",
    remindersSent: 0,
  },
  {
    id: "2",
    number: "FACT-2024-002",
    type: "facture_devis",
    status: "partiellement_payee",
    clientName: "Orange Côte d'Ivoire",
    clientEmail: "projets@orange.ci",
    clientPhone: "+225 27 21 30 00 00",
    clientAddress: "Abidjan, Cocody",
    projectTitle: "Extension centre de données",
    description: "Facture pour extension et sécurisation du centre de données principal",
    items: [
      {
        id: "1",
        description: "Acompte 30% - Gros œuvre extension",
        quantity: 1,
        unit: "forfait",
        unitPrice: 8325000,
        total: 8325000,
      },
    ],
    subtotal: 8325000,
    taxRate: 18,
    taxAmount: 1498500,
    total: 9823500,
    dueDate: "2024-03-01",
    paidDate: "2024-02-28",
    paidAmount: 9823500,
    remainingAmount: 18406500,
    paymentSchedule: [
      {
        id: "1",
        description: "Acompte 30%",
        amount: 9823500,
        dueDate: "2024-03-01",
        paidDate: "2024-02-28",
        status: "payee",
      },
      {
        id: "2",
        description: "Solde 70%",
        amount: 18406500,
        dueDate: "2024-05-31",
        status: "en_attente",
      },
    ],
    relatedQuoteId: "2",
    relatedProjectId: "2",
    createdAt: "2024-02-10",
    updatedAt: "2024-02-28",
    createdBy: "pierre.commercial@construction.fr",
    remindersSent: 0,
  },
  {
    id: "3",
    number: "FACT-2024-003",
    type: "facture_devis",
    status: "en_retard",
    clientName: "Banque Atlantique",
    clientEmail: "infrastructure@atlantique.ci",
    clientPhone: "+225 27 21 25 25 25",
    clientAddress: "Abidjan, Plateau",
    projectTitle: "Rénovation agence bancaire",
    description: "Facture pour modernisation complète de l'agence principale",
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
    dueDate: "2024-02-15",
    paidAmount: 0,
    remainingAmount: 13983000,
    paymentSchedule: [
      {
        id: "1",
        description: "Paiement unique",
        amount: 13983000,
        dueDate: "2024-02-15",
        status: "en_retard",
      },
    ],
    relatedQuoteId: "3",
    createdAt: "2024-01-16",
    updatedAt: "2024-02-20",
    createdBy: "pierre.commercial@construction.fr",
    remindersSent: 2,
    lastReminderDate: "2024-02-20",
    notes: "Client en difficulté financière, négociation en cours",
  },
  {
    id: "4",
    number: "FACT-2024-004",
    type: "facture_sous_traitant",
    status: "envoyee",
    clientName: "Electricité Pro",
    clientEmail: "contact@electricitepro.ci",
    clientPhone: "+225 05 12 34 56 78",
    clientAddress: "Abidjan, Yopougon",
    projectTitle: "Installation électrique Villa Cocody",
    description: "Facture pour installation électrique complète",
    items: [
      {
        id: "1",
        description: "Installation électrique complète",
        quantity: 1,
        unit: "forfait",
        unitPrice: 2500000,
        total: 2500000,
      },
    ],
    subtotal: 2500000,
    taxRate: 18,
    taxAmount: 450000,
    total: 2950000,
    dueDate: "2024-03-15",
    paidAmount: 0,
    remainingAmount: 2950000,
    paymentSchedule: [
      {
        id: "1",
        description: "Paiement à 30 jours",
        amount: 2950000,
        dueDate: "2024-03-15",
        status: "en_attente",
      },
    ],
    relatedProjectId: "1",
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
    createdBy: "marie.chef@construction.fr",
    remindersSent: 0,
  },
  {
    id: "5",
    number: "FACT-2024-005",
    type: "facture_devis",
    status: "brouillon",
    clientName: "Ministère de la Construction",
    clientEmail: "projets@construction.gouv.ci",
    clientPhone: "+225 27 21 35 35 35",
    clientAddress: "Abidjan, Plateau",
    projectTitle: "Construction école primaire",
    description: "Facture pour construction d'une école primaire de 12 classes",
    items: [
      {
        id: "1",
        description: "Acompte 40% - Fondations et gros œuvre",
        quantity: 1,
        unit: "forfait",
        unitPrice: 54280000,
        total: 54280000,
      },
    ],
    subtotal: 54280000,
    taxRate: 18,
    taxAmount: 9770400,
    total: 64050400,
    dueDate: "2024-04-01",
    paidAmount: 0,
    remainingAmount: 64050400,
    paymentSchedule: [
      {
        id: "1",
        description: "Acompte 40%",
        amount: 64050400,
        dueDate: "2024-04-01",
        status: "en_attente",
      },
      {
        id: "2",
        description: "Paiement intermédiaire 40%",
        amount: 64050400,
        dueDate: "2024-07-01",
        status: "en_attente",
      },
      {
        id: "3",
        description: "Solde 20%",
        amount: 32025200,
        dueDate: "2024-09-01",
        status: "en_attente",
      },
    ],
    relatedQuoteId: "4",
    createdAt: "2024-02-25",
    updatedAt: "2024-02-25",
    createdBy: "pierre.commercial@construction.fr",
    remindersSent: 0,
    notes: "En attente de validation du budget par le ministère",
  },
]

export const getInvoices = (): Invoice[] => {
  return mockInvoices
}

export const getInvoiceById = (id: string): Invoice | undefined => {
  return mockInvoices.find((invoice) => invoice.id === id)
}

export const getOverdueInvoices = (): Invoice[] => {
  const today = new Date()
  return mockInvoices.filter((invoice) => {
    return (
      invoice.status === "en_retard" ||
      (invoice.status === "envoyee" && new Date(invoice.dueDate) < today) ||
      (invoice.status === "partiellement_payee" &&
        invoice.paymentSchedule.some((payment) => payment.status === "en_retard"))
    )
  })
}

export const updateInvoiceStatus = (id: string, status: InvoiceStatus): Invoice | undefined => {
  const invoice = mockInvoices.find((i) => i.id === id)
  if (invoice) {
    invoice.status = status
    invoice.updatedAt = new Date().toISOString().split("T")[0]
    if (status === "payee") {
      invoice.paidDate = new Date().toISOString().split("T")[0]
      invoice.paidAmount = invoice.total
      invoice.remainingAmount = 0
      invoice.paymentSchedule.forEach((payment) => {
        payment.status = "payee"
        payment.paidDate = new Date().toISOString().split("T")[0]
      })
    }
    return invoice
  }
  return undefined
}

export const markPaymentAsPaid = (invoiceId: string, paymentId: string): boolean => {
  const invoice = mockInvoices.find((i) => i.id === invoiceId)
  if (invoice) {
    const payment = invoice.paymentSchedule.find((p) => p.id === paymentId)
    if (payment && payment.status !== "payee") {
      payment.status = "payee"
      payment.paidDate = new Date().toISOString().split("T")[0]
      invoice.paidAmount += payment.amount
      invoice.remainingAmount -= payment.amount

      // Update invoice status
      if (invoice.remainingAmount <= 0) {
        invoice.status = "payee"
        invoice.paidDate = new Date().toISOString().split("T")[0]
      } else if (invoice.paidAmount > 0) {
        invoice.status = "partiellement_payee"
      }

      invoice.updatedAt = new Date().toISOString().split("T")[0]
      return true
    }
  }
  return false
}

export const sendReminder = (id: string): boolean => {
  const invoice = mockInvoices.find((i) => i.id === id)
  if (invoice) {
    invoice.remindersSent += 1
    invoice.lastReminderDate = new Date().toISOString().split("T")[0]
    invoice.updatedAt = new Date().toISOString().split("T")[0]
    return true
  }
  return false
}

export const getInvoiceStats = () => {
  const total = mockInvoices.length
  const overdue = getOverdueInvoices().length
  const totalUnpaid = mockInvoices
    .filter((i) => i.status !== "payee" && i.status !== "annulee")
    .reduce((sum, i) => sum + i.remainingAmount, 0)
  const totalRevenue = mockInvoices
    .filter((i) => i.status === "payee" || i.status === "partiellement_payee")
    .reduce((sum, i) => sum + i.paidAmount, 0)

  return { total, overdue, totalUnpaid, totalRevenue }
}
