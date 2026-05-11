import { useState, useEffect, useCallback } from 'react'
import {
  WhatsAppCompteService,
  WhatsAppMessageTypeService,
  WhatsAppMessagePredefiniService,
} from '@/services/whatsappParametreService'

// Normalise une réponse API vers un tableau (gère les wrappers .NET)
function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.$values)) return data.$values
  if (data && Array.isArray(data.data)) return data.data
  if (data && Array.isArray(data.items)) return data.items
  return []
}
import type {
  WhatsAppCompte,
  CreateWhatsAppCompteRequest,
  UpdateWhatsAppCompteRequest,
  ConnexionWhatsAppRequest,
  WhatsAppMessageType,
  WhatsAppMessagePredefini,
  CreateWhatsAppMessagePredefiniRequest,
  UpdateWhatsAppMessagePredefiniRequest,
  PrevisualiserMessageRequest,
  PrevisualiserMessageResponse,
} from '@/types/whatsappParametres'

// ============================================
// HOOK - Comptes WhatsApp
// ============================================

export function useWhatsAppComptes(service?: string) {
  const [comptes, setComptes] = useState<WhatsAppCompte[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComptes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await WhatsAppCompteService.getAll(service)
      setComptes(toArray(data))
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur lors du chargement des comptes')
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    fetchComptes()
  }, [fetchComptes])

  const createCompte = useCallback(async (data: CreateWhatsAppCompteRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppCompteService.create(data)
      setComptes(prev => [...prev, result])
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la création du compte'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCompte = useCallback(async (id: number, data: UpdateWhatsAppCompteRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppCompteService.update(id, data)
      setComptes(prev => prev.map(c => c.id === id ? result : c))
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la mise à jour du compte'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCompte = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await WhatsAppCompteService.delete(id)
      setComptes(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la suppression du compte'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConnexion = useCallback(async (id: number, data: ConnexionWhatsAppRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppCompteService.updateConnexion(id, data)
      setComptes(prev => prev.map(c => c.id === id ? result : c))
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la mise à jour de la connexion'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    comptes,
    loading,
    error,
    fetchComptes,
    createCompte,
    updateCompte,
    deleteCompte,
    updateConnexion,
  }
}

// ============================================
// HOOK - Types de messages
// ============================================

export function useWhatsAppMessageTypes() {
  const [messageTypes, setMessageTypes] = useState<WhatsAppMessageType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessageTypes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await WhatsAppMessageTypeService.getAll()
      setMessageTypes(toArray(data))
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur lors du chargement des types de messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessageTypes()
  }, [fetchMessageTypes])

  const getByCode = useCallback(async (code: string) => {
    try {
      return await WhatsAppMessageTypeService.getByCode(code)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Type de message introuvable'
      setError(msg)
      return null
    }
  }, [])

  return {
    messageTypes,
    loading,
    error,
    fetchMessageTypes,
    getByCode,
  }
}

// ============================================
// HOOK - Messages prédéfinis
// ============================================

export function useWhatsAppMessagesPredefinis(typeCode?: string, autoFetch = true) {
  const [messages, setMessages] = useState<WhatsAppMessagePredefini[]>([])
  const [preview, setPreview] = useState<PrevisualiserMessageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = typeCode
        ? await WhatsAppMessagePredefiniService.getByTypeCode(typeCode)
        : await WhatsAppMessagePredefiniService.getAll()
      setMessages(toArray(data))
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur lors du chargement des messages prédéfinis')
    } finally {
      setLoading(false)
    }
  }, [typeCode])

  useEffect(() => {
    if (autoFetch) fetchMessages()
  }, [fetchMessages, autoFetch])

  const createMessage = useCallback(async (data: CreateWhatsAppMessagePredefiniRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppMessagePredefiniService.create(data)
      setMessages(prev => [...prev, result])
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la création du message'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMessage = useCallback(async (id: number, data: UpdateWhatsAppMessagePredefiniRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppMessagePredefiniService.update(id, data)
      setMessages(prev => prev.map(m => m.id === id ? result : m))
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la mise à jour du message'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteMessage = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await WhatsAppMessagePredefiniService.delete(id)
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la suppression du message'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const getById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      return await WhatsAppMessagePredefiniService.getById(id)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Message prédéfini introuvable'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const previsualiser = useCallback(async (id: number, data: PrevisualiserMessageRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppMessagePredefiniService.previsualiser(id, data)
      setPreview(result)
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la prévisualisation'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    messages,
    preview,
    loading,
    error,
    fetchMessages,
    getById,
    createMessage,
    updateMessage,
    deleteMessage,
    previsualiser,
  }
}
