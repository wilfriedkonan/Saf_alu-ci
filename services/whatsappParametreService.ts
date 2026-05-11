// ============================================
// SERVICE - WhatsApp Paramètres (API SafAlu interne)
// Utilise apiClient (JWT auth)
// ============================================

import { apiClient } from '@/lib/api-config'
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

// Réponses wrappées renvoyées par l'API
interface ComptesApiResponse {
  comptes: WhatsAppCompte[]
  resume?: {
    nombreComptes: number
    nombreConnectes: number
    services?: { service: string; nombre: number }[]
  }
}

interface MessagesApiResponse {
  messages: WhatsAppMessagePredefini[]
  nombreMessages?: number
  filtreTypeCode?: string | null
}

// ============================================
// COMPTES
// ============================================

export const WhatsAppCompteService = {
  /** Liste tous les comptes WhatsApp, filtrés optionnellement par service */
  getAll: async (service?: string): Promise<WhatsAppCompte[]> => {
    const params = service ? { service } : {}
    const response = await apiClient.get<ComptesApiResponse | WhatsAppCompte[]>('/WhatsApp/comptes', { params })
    const d = response.data
    if (Array.isArray(d)) return d
    if (d && Array.isArray((d as ComptesApiResponse).comptes)) return (d as ComptesApiResponse).comptes
    return []
  },

  /** Crée un nouveau compte WhatsApp */
  create: async (data: CreateWhatsAppCompteRequest): Promise<WhatsAppCompte> => {
    const response = await apiClient.post<WhatsAppCompte>('/WhatsApp/comptes', data)
    return response.data
  },

  /** Récupère un compte par son ID */
  getById: async (id: number): Promise<WhatsAppCompte> => {
    const response = await apiClient.get<WhatsAppCompte>(`/WhatsApp/comptes/${id}`)
    return response.data
  },

  /** Met à jour un compte */
  update: async (id: number, data: UpdateWhatsAppCompteRequest): Promise<WhatsAppCompte> => {
    const response = await apiClient.put<WhatsAppCompte>(`/WhatsApp/comptes/${id}`, data)
    return response.data
  },

  /** Supprime un compte */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/WhatsApp/comptes/${id}`)
  },

  /** Met à jour le statut de connexion d'un compte */
  updateConnexion: async (id: number, data: ConnexionWhatsAppRequest): Promise<WhatsAppCompte> => {
    const response = await apiClient.patch<WhatsAppCompte>(`/WhatsApp/comptes/${id}/connexion`, data)
    return response.data
  },
}

// ============================================
// TYPES DE MESSAGES
// ============================================

export const WhatsAppMessageTypeService = {
  /** Liste tous les types de messages */
  getAll: async (): Promise<WhatsAppMessageType[]> => {
    const response = await apiClient.get<WhatsAppMessageType[] | any>('/WhatsApp/messages-types')
    const d = response.data
    if (Array.isArray(d)) return d
    if (d && Array.isArray(d.types)) return d.types
    if (d && Array.isArray(d.data)) return d.data
    return []
  },

  /** Récupère un type par son code */
  getByCode: async (code: string): Promise<WhatsAppMessageType> => {
    const response = await apiClient.get<WhatsAppMessageType>(`/WhatsApp/messages-types/${code}`)
    return response.data
  },
}

// ============================================
// MESSAGES PRÉDÉFINIS
// ============================================

export const WhatsAppMessagePredefiniService = {
  /** Liste tous les messages prédéfinis, filtrés optionnellement par typeCode */
  getAll: async (typeCode?: string): Promise<WhatsAppMessagePredefini[]> => {
    const params = typeCode ? { typeCode } : {}
    const response = await apiClient.get<MessagesApiResponse | WhatsAppMessagePredefini[]>(
      '/WhatsApp/messages-predefinis', { params }
    )
    const d = response.data
    if (Array.isArray(d)) return d
    if (d && Array.isArray((d as MessagesApiResponse).messages)) return (d as MessagesApiResponse).messages
    return []
  },

  /** Crée un nouveau message prédéfini */
  create: async (data: CreateWhatsAppMessagePredefiniRequest): Promise<WhatsAppMessagePredefini> => {
    const response = await apiClient.post<WhatsAppMessagePredefini>('/WhatsApp/messages-predefinis', data)
    return response.data
  },

  /** Récupère un message prédéfini par son ID */
  getById: async (id: number): Promise<WhatsAppMessagePredefini> => {
    const response = await apiClient.get<WhatsAppMessagePredefini>(`/WhatsApp/messages-predefinis/${id}`)
    return response.data
  },

  /** Met à jour un message prédéfini */
  update: async (id: number, data: UpdateWhatsAppMessagePredefiniRequest): Promise<WhatsAppMessagePredefini> => {
    const response = await apiClient.put<WhatsAppMessagePredefini>(`/WhatsApp/messages-predefinis/${id}`, data)
    return response.data
  },

  /** Supprime un message prédéfini */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/WhatsApp/messages-predefinis/${id}`)
  },

  /** Récupère les messages prédéfinis par code de type */
  getByTypeCode: async (code: string): Promise<WhatsAppMessagePredefini[]> => {
    const response = await apiClient.get<MessagesApiResponse | WhatsAppMessagePredefini[]>(
      `/WhatsApp/messages-predefinis/type/${code}`
    )
    const d = response.data
    if (Array.isArray(d)) return d
    if (d && Array.isArray((d as MessagesApiResponse).messages)) return (d as MessagesApiResponse).messages
    return []
  },

  /** Prévisualise un message en substituant les variables */
  previsualiser: async (id: number, data: PrevisualiserMessageRequest): Promise<PrevisualiserMessageResponse> => {
    const response = await apiClient.post<PrevisualiserMessageResponse>(
      `/WhatsApp/messages-predefinis/${id}/previsualiser`,
      data
    )
    return response.data
  },
}
