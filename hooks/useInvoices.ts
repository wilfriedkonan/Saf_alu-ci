// hooks/useInvoices.ts

import { useState, useCallback, useEffect } from "react"
import { InvoiceService } from "@/services/invoiceService"
import type {
  Facture,
  CreateFactureRequest,
  MarquerPayeRequest,
} from "@/types/invoices"
import type {
  FactureStatut,
  FactureType,
  UpdateFactureRequest,
  FactureFilters,
  FactureStats,
} from "@/services/invoiceService"
import { toast } from "@/hooks/use-toast"

interface UseInvoicesResult {
  // État
  invoices: Facture[]
  invoice: Facture | null
  stats: FactureStats | null
  overdueInvoices: Facture[]
  loading: boolean
  error: string | null
  
  // Actions CRUD
  getAll: (filters?: FactureFilters) => Promise<void>
  getById: (id: number) => Promise<void>
  create: (data: CreateFactureRequest) => Promise<Facture | null>
  createFromQuote: (quoteId: number) => Promise<Facture | null>
  update: (id: number, data: UpdateFactureRequest) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  
  // Actions spécifiques
  send: (id: number) => Promise<boolean>
  markAsPaid: (id: number, data: MarquerPayeRequest) => Promise<boolean>
  cancel: (id: number, reason?: string) => Promise<boolean>
  sendReminder: (id: number) => Promise<boolean>
  
  // Utilitaires
  getStats: (year?: number) => Promise<void>
  getOverdue: () => Promise<void>
  downloadPDF: (id: number) => Promise<void>
  exportToExcel: (filters?: FactureFilters) => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}

export function useInvoices(autoLoad: boolean = false): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Facture[]>([])
  const [invoice, setInvoice] = useState<Facture | null>(null)
  const [stats, setStats] = useState<FactureStats | null>({
    totalFacturesGolbal: 0,
    retardPayementGolbal: 0,
     montantRestantARecouvrerGolbal: 0,
    montantTotalPayeGolbal: 0,
  })
  const [overdueInvoices, setOverdueInvoices] = useState<Facture[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FactureFilters | undefined>(undefined)

  /**
   * Récupère toutes les factures
   */
  const getAll = useCallback(async (newFilters?: FactureFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      if (newFilters) setFilters(newFilters)
      
      const activeFilters = newFilters || filters
      const data = await InvoiceService.getAllInvoices(activeFilters)
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
  const getById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await InvoiceService.getInvoiceById(id)
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
  const create = useCallback(async (data: CreateFactureRequest): Promise<Facture | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await InvoiceService.createInvoice(data)
      const result = response.data!
      setInvoices((prev) => [result, ...prev])
      
      toast({
        title: "Succès",
        description: `Facture ${result.numero} créée avec succès`,
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
  const createFromQuote = useCallback(async (quoteId: number): Promise<Facture | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await InvoiceService.createInvoiceFromQuote(quoteId)
      const result = response.data!
      setInvoices((prev) => [result, ...prev])
      
      toast({
        title: "Succès",
        description: `Facture ${result.numero} créée depuis le devis`,
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
  const update = useCallback(async (id: number, data: UpdateFactureRequest): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try { console.log('Debug UseService update:',data)
      await InvoiceService.updateInvoice(id, data)
      
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
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await InvoiceService.deleteInvoice(id)
      setInvoices((prev) => prev.filter((inv) => inv.id!== id))
      
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
  const send = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await InvoiceService.sendInvoice(id)
      
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
  const markAsPaid = useCallback(async (id: number, data: MarquerPayeRequest): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await InvoiceService.markInvoiceAsPaid(id, data)
      
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
  const cancel = useCallback(async (id: number, reason?: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await InvoiceService.cancelInvoice(id, reason)
      
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
  const sendReminder = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await InvoiceService.sendInvoiceReminder(id)
      
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
      const data = await InvoiceService.getInvoiceStats(year)
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
      const data = await InvoiceService.getOverdueInvoices()
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
  const downloadPDF = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const { blob, filename } = await InvoiceService.downloadInvoicePDF(id)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || `facture-${id}.pdf`
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
  const exportToExcel = useCallback(async (exportFilters?: FactureFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const { blob, filename } = await InvoiceService.exportInvoicesToExcel(exportFilters)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || `factures-${new Date().toISOString().split("T")[0]}.xlsx`
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

// Hook pour gérer la liste des facture
export const useListFacture = () => {

  const [facture, setFacture] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacture = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InvoiceService.getAllInvoices();
      console.log('dataFacture dans hook list facture:',data)
      setFacture(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacture();
  }, [fetchFacture]);

  const refreshFacture = useCallback(() => {
    fetchFacture();
  }, [fetchFacture]);

  return {
    facture,
    loading,
    error,
    refreshFacture
  };
};

/**
 * Hook simplifié pour une seule facture
 */
export function useInvoice(id?: number) {
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
    getById,
    error,
    update: (data: UpdateFactureRequest) => update(id!, data),
    send: () => send(id!),
    markAsPaid: (data: MarquerPayeRequest) => markAsPaid(id!, data),
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

/**
 * Hook unifié pour charger toutes les données des factures en une fois
 */
export function useInvoicesWithStats(filters?: FactureFilters, year?: number) {
  const [invoices, setInvoices] = useState<Facture[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<Facture[]>([])
  const [stats, setStats] = useState<FactureStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAllData = useCallback(async (newFilters?: FactureFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      // Charger toutes les données en parallèle
      const [invoicesData, overdueData, statsData] = await Promise.all([
        InvoiceService.getAllInvoices(newFilters || filters),
        InvoiceService.getOverdueInvoices(),
        InvoiceService.getInvoiceStats(year)
      ])

      setInvoices(invoicesData)
      setOverdueInvoices(overdueData)
      setStats(statsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des données"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, year])

  const refresh = useCallback(() => {
    loadAllData()
  }, [loadAllData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    invoices,
    overdueInvoices,
    stats,
    loading,
    error,
    loadAllData,
    refresh,
    clearError
  }
}