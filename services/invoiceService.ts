// services/invoiceService.ts

import type {
    Invoice,
    InvoiceStatus,
    InvoiceType,
  } from "@/lib/invoices"
  
  // DTOs pour l'API
  interface CreateInvoiceDTO {
    type: InvoiceType
    clientId?: number
    subcontractorId?: number
    quoteId?: number
    projectId?: number
    title: string
    projectTitle: string
    description?: string
    invoiceDate: string
    dueDate: string
    paymentTerms?: string
    clientReference?: string
    taxRate?: number
    clientName: string
    clientEmail: string
    clientPhone?: string
    clientAddress?: string
    items: Array<{
      description: string
      quantity: number
      unit: string
      unitPrice: number
    }>
    paymentSchedule?: Array<{
      description?: string
      amount: number
      dueDate: string
    }>
    notes?: string
  }
  
  interface UpdateInvoiceDTO {
    title?: string
    projectTitle?: string
    description?: string
    invoiceDate?: string
    dueDate?: string
    paymentTerms?: string
    clientReference?: string
    items?: Array<{
      description: string
      quantity: number
      unit: string
      unitPrice: number
    }>
    paymentSchedule?: Array<{
      description?: string
      amount: number
      dueDate: string
    }>
    notes?: string
  }
  
  interface MarkAsPaidDTO {
    amount: number
    paymentMethod?: string
    paymentReference?: string
    paidDate?: string
  }
  
  interface InvoiceStats {
    total: number
    overdue: number
    totalUnpaid: number
    totalRevenue: number
    byStatus?: Record<InvoiceStatus, number>
    byType?: Record<InvoiceType, number>
  }
  
  interface InvoiceFilters {
    status?: InvoiceStatus | "all"
    type?: InvoiceType | "all"
    search?: string
    clientId?: number
    projectId?: number
    year?: number
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  
  class InvoiceService {
    private getAuthHeaders(): HeadersInit {
      const token = localStorage.getItem("token")
      return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      }
    }
  
    private async handleResponse<T>(response: Response): Promise<T> {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Une erreur est survenue" }))
        throw new Error(error.message || `Erreur HTTP: ${response.status}`)
      }
      return response.json()
    }
  
    /**
     * Récupère toutes les factures avec filtres optionnels
     */
    async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
      const params = new URLSearchParams()
      
      if (filters?.status && filters.status !== "all") {
        params.append("statut", filters.status)
      }
      
      if (filters?.type && filters.type !== "all") {
        params.append("typeFacture", filters.type)
      }
  
      const url = `${API_BASE_URL}/factures${params.toString() ? `?${params.toString()}` : ""}`
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      })
  
      const data = await this.handleResponse<Invoice[]>(response)
      
      // Filtrage côté client pour search, clientId, projectId
      let filtered = data
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(
          (inv) =>
            inv.number.toLowerCase().includes(searchLower) ||
            inv.clientName?.toLowerCase().includes(searchLower) ||
            inv.projectTitle?.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters?.clientId) {
        filtered = filtered.filter((inv) => inv.clientId === filters.clientId)
      }
      
      if (filters?.projectId) {
        filtered = filtered.filter((inv) => inv.projectId === filters.projectId)
      }
      
      return filtered
    }
  
    /**
     * Récupère une facture par son ID
     */
    async getById(id: string): Promise<Invoice> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        headers: this.getAuthHeaders(),
      })
  
      return this.handleResponse<Invoice>(response)
    }
  
    /**
     * Crée une nouvelle facture
     */
    async create(data: CreateInvoiceDTO): Promise<Invoice> {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })
  
      return this.handleResponse<Invoice>(response)
    }
  
    /**
     * Crée une facture à partir d'un devis
     */
    async createFromQuote(quoteId: number): Promise<Invoice> {
      const response = await fetch(`${API_BASE_URL}/factures/from-devis/${quoteId}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })
  
      return this.handleResponse<Invoice>(response)
    }
  
    /**
     * Met à jour une facture (uniquement si statut = brouillon)
     */
    async update(id: string, data: UpdateInvoiceDTO): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })
  
      await this.handleResponse<void>(response)
    }
  
    /**
     * Envoie une facture (change le statut à envoyée)
     */
    async send(id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/envoyer`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })
  
      await this.handleResponse<void>(response)
    }
  
    /**
     * Marque une facture comme payée (partiellement ou totalement)
     */
    async markAsPaid(id: string, data: MarkAsPaidDTO): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/marquer-payee`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          montantPaye: data.amount,
          modePaiement: data.paymentMethod,
          referencePaiement: data.paymentReference,
          datePaiement: data.paidDate || new Date().toISOString(),
        }),
      })
  
      await this.handleResponse<void>(response)
    }
  
    /**
     * Annule une facture
     */
    async cancel(id: string, reason?: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/annuler`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ motif: reason }),
      })
  
      await this.handleResponse<void>(response)
    }
  
    /**
     * Supprime une facture
     */
    async delete(id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })
  
      await this.handleResponse<void>(response)
    }
  
    /**
     * Récupère les factures impayées
     */
    async getOverdue(): Promise<Invoice[]> {
      const response = await fetch(`${API_BASE_URL}/factures/impayes`, {
        headers: this.getAuthHeaders(),
      })
  
      return this.handleResponse<Invoice[]>(response)
    }
  
    /**
     * Envoie une relance pour une facture
     */
    async sendReminder(id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/relance`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })
  
      await this.handleResponse<void>(response)
    }
  
    /**
     * Télécharge le PDF d'une facture
     */
    async downloadPDF(id: string): Promise<Blob> {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/pdf`, {
        headers: this.getAuthHeaders(),
      })
  
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du PDF")
      }
  
      return response.blob()
    }
  
    /**
     * Récupère les statistiques des factures
     */
    async getStats(year?: number): Promise<InvoiceStats> {
      const params = year ? `?annee=${year}` : ""
      const response = await fetch(`${API_BASE_URL}/factures/statistiques${params}`, {
        headers: this.getAuthHeaders(),
      })
  
      return this.handleResponse<InvoiceStats>(response)
    }
  
    /**
     * Exporte les factures en Excel
     */
    async exportToExcel(filters?: InvoiceFilters): Promise<Blob> {
      const params = new URLSearchParams()
      
      if (filters?.status && filters.status !== "all") {
        params.append("statut", filters.status)
      }
      
      if (filters?.type && filters.type !== "all") {
        params.append("typeFacture", filters.type)
      }
  
      const response = await fetch(`${API_BASE_URL}/factures/export/excel?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      })
  
      if (!response.ok) {
        throw new Error("Erreur lors de l'export Excel")
      }
  
      return response.blob()
    }
  }
  
  export const invoiceService = new InvoiceService()
  
  // Exporter les types pour utilisation dans les composants
  export type {
    CreateInvoiceDTO,
    UpdateInvoiceDTO,
    MarkAsPaidDTO,
    InvoiceStats,
    InvoiceFilters,
  }