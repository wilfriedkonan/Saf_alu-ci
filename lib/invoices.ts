// lib/invoices.ts - Types et constantes uniquement

// ===== TYPES =====
export interface Invoice {
  id: string
  number: string
  type: InvoiceType
  status: InvoiceStatus
  clientId?: number
  subcontractorId?: number
  quoteId?: number
  projectId?: number
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
  invoiceDate?: string
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
  paymentTerms?: string
  clientReference?: string
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

// ===== LABELS ET COULEURS POUR L'UI =====
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

// Export du service pour usage si besoin
export { invoiceService } from "@/services/invoiceService"