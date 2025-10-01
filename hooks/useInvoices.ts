// hooks/useInvoices.ts

import { useState, useCallback, useEffect } from "react"
import type {
  Invoice,
  InvoiceStatus,
  InvoiceType,
} from "@/lib/invoices"
import { toast } from "@/hooks/use-toast"

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

interface InvoiceFilters {
  status?: InvoiceStatus | "all"
  type?: InvoiceType | "all"
  search?: string
  clientId?: number
  projectId?: number
  year?: number
}

interface InvoiceStats {
  total: number
  overdue: number
  totalUnpaid: number
  totalRevenue: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface UseInvoicesResult {
  // État
  invoices: Invoice[]
  invoice: Invoice | null
  stats: InvoiceStats | null
  overdueInvoices: Invoice[]
  loading: boolean
  error: string | null
  
  // Actions CRUD
  getAll: (filters?: InvoiceFilters) => Promise<void>
  getById: (id: string) => Promise<void>
  create: (data: CreateInvoiceDTO) => Promise<Invoice | null>
  createFromQuote: (quoteId: number) => Promise<Invoice | null>
  update: (id: string, data: UpdateInvoiceDTO) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
  
  // Actions spécifiques
  send: (id: string) => Promise<boolean>
  markAsPaid: (id: string, data: MarkAsPaidDTO) => Promise<boolean>
  cancel: (id: string, reason?: string) => Promise<boolean>
  sendReminder: (id: string) => Promise<boolean>
  
  // Utilitaires
  getStats: (year?: number) => Promise<void>
  getOverdue: () => Promise<void>
  downloadPDF: (id: string) => Promise<void>
  exportToExcel: (filters?: InvoiceFilters) => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}

export function useInvoices(autoLoad: boolean = false): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [stats, setStats] = useState<InvoiceStats | null>({
    total: 0,
    overdue: 0,
    totalUnpaid: 0,
    totalRevenue: 0,
  })
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<InvoiceFilters | undefined>(undefined)

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  const handleResponse = async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Une erreur est survenue" }))
      throw new Error(error.message || `Erreur HTTP: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Récupère toutes les factures
   */
  const getAll = useCallback(async (newFilters?: InvoiceFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      if (newFilters) setFilters(newFilters)
      
      const params = new URLSearchParams()
      const activeFilters = newFilters || filters
      
      if (activeFilters?.status && activeFilters.status !== "all") {
        params.append("statut", activeFilters.status)
      }
      
      if (activeFilters?.type && activeFilters.type !== "all") {
        params.append("typeFacture", activeFilters.type)
      }

      const url = `${API_BASE_URL}/factures${params.toString() ? `?${params.toString()}` : ""}`
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      })

      let data = await handleResponse<Invoice[]>(response)
      
      // Filtrage côté client
      if (activeFilters?.search) {
        const searchLower = activeFilters.search.toLowerCase()
        data = data.filter(
          (inv) =>
            inv.number.toLowerCase().includes(searchLower) ||
            inv.clientName?.toLowerCase().includes(searchLower) ||
            inv.projectTitle?.toLowerCase().includes(searchLower)
        )
      }
      
      if (activeFilters?.clientId) {
        data = data.filter((inv) => inv.clientId === activeFilters.clientId)
      }
      
      if (activeFilters?.projectId) {
        data = data.filter((inv) => inv.projectId === activeFilters.projectId)
      }
      
      setInvoices(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des factures"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Récupère une facture par ID
   */
  const getById = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        headers: getAuthHeaders(),
      })

      const data = await handleResponse<Invoice>(response)
      setInvoice(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement de la facture"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Crée une nouvelle facture
   */
  const create = useCallback(async (data: CreateInvoiceDTO): Promise<Invoice | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      const result = await handleResponse<Invoice>(response)
      setInvoices((prev) => [result, ...prev])
      
      toast({
        title: "Succès",
        description: `Facture ${result.number} créée avec succès`,
      })
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la facture"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Crée une facture depuis un devis
   */
  const createFromQuote = useCallback(async (quoteId: number): Promise<Invoice | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/from-devis/${quoteId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      const result = await handleResponse<Invoice>(response)
      setInvoices((prev) => [result, ...prev])
      
      toast({
        title: "Succès",
        description: `Facture ${result.number} créée depuis le devis`,
      })
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la facture"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Met à jour une facture
   */
  const update = useCallback(async (id: string, data: UpdateInvoiceDTO): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      await handleResponse<void>(response)
      
      // Recharger la facture mise à jour
      await getById(id)
      await getAll(filters)
      
      toast({
        title: "Succès",
        description: "Facture mise à jour avec succès",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [filters, getById, getAll])

  /**
   * Supprime une facture
   */
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      await handleResponse<void>(response)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
      
      if (invoice?.id === id) {
        setInvoice(null)
      }
      
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [invoice])

  /**
   * Envoie une facture
   */
  const send = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/envoyer`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      await handleResponse<void>(response)
      
      // Recharger les données
      await getAll(filters)
      
      toast({
        title: "Succès",
        description: "Facture envoyée avec succès",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [filters, getAll])

  /**
   * Marque une facture comme payée
   */
  const markAsPaid = useCallback(async (id: string, data: MarkAsPaidDTO): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/marquer-payee`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          montantPaye: data.amount,
          modePaiement: data.paymentMethod,
          referencePaiement: data.paymentReference,
          datePaiement: data.paidDate || new Date().toISOString(),
        }),
      })

      await handleResponse<void>(response)
      
      // Recharger les données
      await getAll(filters)
      
      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'enregistrement du paiement"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [filters, getAll])

  /**
   * Annule une facture
   */
  const cancel = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/annuler`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ motif: reason }),
      })

      await handleResponse<void>(response)
      
      // Recharger les données
      await getAll(filters)
      
      toast({
        title: "Succès",
        description: "Facture annulée avec succès",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'annulation"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [filters, getAll])

  /**
   * Envoie une relance
   */
  const sendReminder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/relance`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      await handleResponse<void>(response)
      
      // Recharger les données
      await getAll(filters)
      
      toast({
        title: "Succès",
        description: "Relance envoyée avec succès",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi de la relance"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [filters, getAll])

  /**
   * Récupère les statistiques
   */
  const getStats = useCallback(async (year?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = year ? `?annee=${year}` : ""
      const response = await fetch(`${API_BASE_URL}/factures/statistiques${params}`, {
        headers: getAuthHeaders(),
      })

      const data = await handleResponse<InvoiceStats>(response)
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des statistiques"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Récupère les factures en retard
   */
  const getOverdue = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/impayes`, {
        headers: getAuthHeaders(),
      })

      const data = await handleResponse<Invoice[]>(response)
      setOverdueInvoices(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des impayés"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Télécharge le PDF
   */
  const downloadPDF = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/pdf`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `facture-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Succès",
        description: "PDF téléchargé avec succès",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du téléchargement"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Exporte en Excel
   */
  const exportToExcel = useCallback(async (exportFilters?: InvoiceFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (exportFilters?.status && exportFilters.status !== "all") {
        params.append("statut", exportFilters.status)
      }
      
      if (exportFilters?.type && exportFilters.type !== "all") {
        params.append("typeFacture", exportFilters.type)
      }

      const response = await fetch(`${API_BASE_URL}/factures/export/excel?${params.toString()}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'export Excel")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `factures-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Succès",
        description: "Export Excel réussi",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'export"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Rafraîchit les données
   */
  const refresh = useCallback(async () => {
    await getAll(filters)
  }, [getAll, filters])

  /**
   * Efface l'erreur
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Chargement automatique
  useEffect(() => {
    if (autoLoad) {
      getAll()
    }
  }, [autoLoad, getAll])

  return {
    // État
    invoices,
    invoice,
    stats,
    overdueInvoices,
    loading,
    error,
    
    // Actions CRUD
    getAll,
    getById,
    create,
    createFromQuote,
    update,
    remove,
    
    // Actions spécifiques
    send,
    markAsPaid,
    cancel,
    sendReminder,
    
    // Utilitaires
    getStats,
    getOverdue,
    downloadPDF,
    exportToExcel,
    refresh,
    clearError,
  }
}

/**
 * Hook simplifié pour une seule facture
 */
export function useInvoice(id?: string) {
  const {
    invoice,
    loading,
    error,
    getById,
    update,
    send,
    markAsPaid,
    cancel,
    downloadPDF,
    clearError,
  } = useInvoices(false)

  useEffect(() => {
    if (id) {
      getById(id)
    }
  }, [id, getById])

  return {
    invoice,
    loading,
    error,
    update: (data: UpdateInvoiceDTO) => update(id!, data),
    send: () => send(id!),
    markAsPaid: (data: MarkAsPaidDTO) => markAsPaid(id!, data),
    cancel: (reason?: string) => cancel(id!, reason),
    downloadPDF: () => downloadPDF(id!),
    clearError,
  }
}

/**
 * Hook pour les statistiques uniquement
 */
export function useInvoiceStats(year?: number, autoLoad: boolean = true) {
  const { stats, loading, error, getStats } = useInvoices(false)

  useEffect(() => {
    if (autoLoad) {
      getStats(year)
    }
  }, [autoLoad, year, getStats])

  return {
    stats,
    loading,
    error,
    refresh: () => getStats(year),
  }
}