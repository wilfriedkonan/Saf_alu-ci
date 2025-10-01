// lib/invoiceUtils.ts - Utilitaires pour les factures

import type { Invoice, InvoiceStatus, InvoiceItem, PaymentScheduleItem } from "@/lib/invoices"

/**
 * Calcule le sous-total d'une facture
 */
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0)
}

/**
 * Calcule le montant de la TVA
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return (subtotal * taxRate) / 100
}

/**
 * Calcule le total TTC
 */
export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount
}

/**
 * Calcule tous les montants d'une facture
 */
export function calculateInvoiceAmounts(
  items: InvoiceItem[],
  taxRate: number
): {
  subtotal: number
  taxAmount: number
  total: number
} {
  const subtotal = calculateSubtotal(items)
  const taxAmount = calculateTaxAmount(subtotal, taxRate)
  const total = calculateTotal(subtotal, taxAmount)

  return { subtotal, taxAmount, total }
}

/**
 * Vérifie si une facture est en retard
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === "payee" || invoice.status === "annulee") {
    return false
  }

  return new Date(invoice.dueDate) < new Date()
}

/**
 * Calcule le nombre de jours de retard
 */
export function getDaysOverdue(dueDate: string): number {
  const today = new Date()
  const due = new Date(dueDate)
  
  if (due >= today) return 0
  
  const diffTime = Math.abs(today.getTime() - due.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Vérifie si le total des échéanciers correspond au total de la facture
 */
export function validatePaymentSchedule(
  paymentSchedule: PaymentScheduleItem[],
  totalAmount: number
): boolean {
  const scheduleTotal = paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0)
  return Math.abs(scheduleTotal - totalAmount) < 0.01 // Tolérance de 1 centime
}

/**
 * Génère un numéro de facture
 */
export function generateInvoiceNumber(year: number, sequenceNumber: number): string {
  return `FAC${year}${sequenceNumber.toString().padStart(4, "0")}`
}

/**
 * Détermine le statut d'une facture en fonction des paiements
 */
export function determineInvoiceStatus(
  currentStatus: InvoiceStatus,
  paidAmount: number,
  totalAmount: number,
  dueDate: string
): InvoiceStatus {
  // Si annulée, on garde ce statut
  if (currentStatus === "annulee") {
    return "annulee"
  }

  // Si totalement payée
  if (paidAmount >= totalAmount) {
    return "payee"
  }

  // Si partiellement payée
  if (paidAmount > 0 && paidAmount < totalAmount) {
    return "partiellement_payee"
  }

  // Si en retard
  if (new Date(dueDate) < new Date() && currentStatus === "envoyee") {
    return "en_retard"
  }

  // Sinon on garde le statut actuel
  return currentStatus
}

/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formate une date
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Formate une date avec l'heure
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Calcule la progression des paiements en pourcentage
 */
export function calculatePaymentProgress(paidAmount: number, totalAmount: number): number {
  if (totalAmount === 0) return 0
  return Math.min(Math.round((paidAmount / totalAmount) * 100), 100)
}

/**
 * Groupe les factures par statut
 */
export function groupInvoicesByStatus(invoices: Invoice[]): Record<InvoiceStatus, Invoice[]> {
  return invoices.reduce(
    (acc, invoice) => {
      if (!acc[invoice.status]) {
        acc[invoice.status] = []
      }
      acc[invoice.status].push(invoice)
      return acc
    },
    {} as Record<InvoiceStatus, Invoice[]>
  )
}

/**
 * Groupe les factures par mois
 */
export function groupInvoicesByMonth(invoices: Invoice[]): Record<string, Invoice[]> {
  return invoices.reduce(
    (acc, invoice) => {
      const date = new Date(invoice.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(invoice)
      return acc
    },
    {} as Record<string, Invoice[]>
  )
}

/**
 * Filtre les factures selon des critères
 */
export function filterInvoices(
  invoices: Invoice[],
  filters: {
    search?: string
    status?: InvoiceStatus | "all"
    clientId?: number
    projectId?: number
    startDate?: string
    endDate?: string
  }
): Invoice[] {
  let filtered = [...invoices]

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (inv) =>
        inv.number.toLowerCase().includes(searchLower) ||
        inv.clientName?.toLowerCase().includes(searchLower) ||
        inv.projectTitle?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((inv) => inv.status === filters.status)
  }

  if (filters.clientId) {
    filtered = filtered.filter((inv) => inv.clientId === filters.clientId)
  }

  if (filters.projectId) {
    filtered = filtered.filter((inv) => inv.projectId === filters.projectId)
  }

  if (filters.startDate) {
    filtered = filtered.filter((inv) => new Date(inv.createdAt) >= new Date(filters.startDate!))
  }

  if (filters.endDate) {
    filtered = filtered.filter((inv) => new Date(inv.createdAt) <= new Date(filters.endDate!))
  }

  return filtered
}

/**
 * Trie les factures
 */
export function sortInvoices(
  invoices: Invoice[],
  sortBy: "date" | "amount" | "dueDate" | "status" = "date",
  order: "asc" | "desc" = "desc"
): Invoice[] {
  const sorted = [...invoices].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case "amount":
        comparison = a.total - b.total
        break
      case "dueDate":
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case "status":
        comparison = a.status.localeCompare(b.status)
        break
    }

    return order === "asc" ? comparison : -comparison
  })

  return sorted
}

/**
 * Calcule le taux de recouvrement
 */
export function calculateRecoveryRate(invoices: Invoice[]): number {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)

  if (totalInvoiced === 0) return 0

  return Math.round((totalPaid / totalInvoiced) * 100)
}

/**
 * Calcule le délai moyen de paiement
 */
export function calculateAveragePaymentDelay(invoices: Invoice[]): number {
  const paidInvoices = invoices.filter((inv) => inv.status === "payee" && inv.paidDate)

  if (paidInvoices.length === 0) return 0

  const totalDelay = paidInvoices.reduce((sum, inv) => {
    if (!inv.paidDate) return sum
    const invoiceDate = new Date(inv.createdAt).getTime()
    const paidDate = new Date(inv.paidDate).getTime()
    return sum + Math.ceil((paidDate - invoiceDate) / (1000 * 60 * 60 * 24))
  }, 0)

  return Math.round(totalDelay / paidInvoices.length)
}

/**
 * Valide les données d'une facture avant création
 */
export function validateInvoiceData(data: {
  items: InvoiceItem[]
  paymentSchedule?: PaymentScheduleItem[]
  taxRate: number
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Vérifier qu'il y a au moins un élément
  if (!data.items || data.items.length === 0) {
    errors.push("La facture doit contenir au moins un élément")
  }

  // Vérifier que tous les éléments ont des montants positifs
  data.items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push(`L'élément ${index + 1} doit avoir une quantité positive`)
    }
    if (item.unitPrice < 0) {
      errors.push(`L'élément ${index + 1} ne peut pas avoir un prix négatif`)
    }
  })

  // Vérifier le taux de TVA
  if (data.taxRate < 0 || data.taxRate > 100) {
    errors.push("Le taux de TVA doit être entre 0 et 100")
  }

  // Vérifier l'échéancier si présent
  if (data.paymentSchedule && data.paymentSchedule.length > 0) {
    const amounts = calculateInvoiceAmounts(data.items, data.taxRate)
    const isValid = validatePaymentSchedule(data.paymentSchedule, amounts.total)

    if (!isValid) {
      errors.push("Le total des échéanciers doit être égal au montant total de la facture")
    }

    // Vérifier que chaque paiement a un montant positif
    data.paymentSchedule.forEach((payment, index) => {
      if (payment.amount <= 0) {
        errors.push(`Le paiement ${index + 1} doit avoir un montant positif`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Exporte les données de facture pour impression
 */
export function prepareInvoiceForPrint(invoice: Invoice) {
  return {
    ...invoice,
    subtotalFormatted: formatCurrency(invoice.subtotal),
    taxAmountFormatted: formatCurrency(invoice.taxAmount),
    totalFormatted: formatCurrency(invoice.total),
    paidAmountFormatted: formatCurrency(invoice.paidAmount),
    remainingAmountFormatted: formatCurrency(invoice.remainingAmount),
    createdAtFormatted: formatDate(invoice.createdAt),
    dueDateFormatted: formatDate(invoice.dueDate),
    items: invoice.items.map((item) => ({
      ...item,
      unitPriceFormatted: formatCurrency(item.unitPrice),
      totalFormatted: formatCurrency(item.total),
    })),
    paymentSchedule: invoice.paymentSchedule.map((payment) => ({
      ...payment,
      amountFormatted: formatCurrency(payment.amount),
      dueDateFormatted: formatDate(payment.dueDate),
    })),
  }
}