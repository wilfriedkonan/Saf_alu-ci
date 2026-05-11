// ============================================
// SERVICE - WhatsApp API
// Base URL : NEXT_PUBLIC_WHATSAPP_API_URL
// Auth     : header X-Api-Key (via api-config)
// ============================================

import { whatsappClient } from '@/lib/api-config'
import type {
  CreateInstanceRequest,
  InstanceStatus,
  QrCodeResponse,
  SendTextRequest,
  SendImageRequest,
  SendDocumentRequest,
  SendAudioRequest,
  SendButtonsRequest,
  MessageApiResponse,
  WebhookPayload,
} from '@/types/whatsapp'

// ============================================
// INSTANCES
// ============================================

export const WhatsAppInstanceService = {
  /** Liste toutes les instances WhatsApp */
  getAll: async (): Promise<any[]> => {
    const response = await whatsappClient.get('/api/Instances')
    return response.data
  },

  /** Crée une nouvelle instance */
  create: async (data: CreateInstanceRequest): Promise<any> => {
    const response = await whatsappClient.post('/api/Instances', data)
    return response.data
  },

  /** Statut de connexion d'une instance */
  getStatus: async (instanceName: string): Promise<InstanceStatus> => {
    const response = await whatsappClient.get(`/api/Instances/${instanceName}/status`)
    return response.data
  },

  /** QR Code pour connecter une instance */
  getQrCode: async (instanceName: string): Promise<QrCodeResponse> => {
    const response = await whatsappClient.get<{ data?: QrCodeResponse }>(`/api/Instances/${instanceName}/qrcode`)
    return response.data?.data ?? response.data as any
  },

  /** Déconnecter une instance */
  logout: async (instanceName: string): Promise<any> => {
    const response = await whatsappClient.post(`/api/Instances/${instanceName}/logout`)
    return response.data
  },

  /** Redémarrer une instance */
  restart: async (instanceName: string): Promise<any> => {
    const response = await whatsappClient.post(`/api/Instances/${instanceName}/restart`)
    return response.data
  },

  /** Supprimer une instance */
  delete: async (instanceName: string): Promise<any> => {
    const response = await whatsappClient.delete(`/api/Instances/${instanceName}`)
    return response.data
  },
}

// ============================================
// MESSAGES
// ============================================

export const WhatsAppMessageService = {
  /** Envoyer un message texte */
  sendText: async (data: SendTextRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>('/api/Messages/text', data)
    return response.data
  },

  /** Envoyer une image */
  sendImage: async (data: SendImageRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>('/api/Messages/image', data)
    return response.data
  },

  /** Envoyer un document (PDF, Word, etc.) */
  sendDocument: async (data: SendDocumentRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>('/api/Messages/document', data)
    return response.data
  },

  /** Envoyer un message audio */
  sendAudio: async (data: SendAudioRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>('/api/Messages/audio', data)
    return response.data
  },

  /** Envoyer un message avec boutons interactifs */
  sendButtons: async (data: SendButtonsRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>('/api/Messages/buttons', data)
    return response.data
  },
}

// ============================================
// WEBHOOK
// ============================================

export const WhatsAppWebhookService = {
  /** Vérifier que le webhook est actif */
  ping: async (): Promise<any> => {
    const response = await whatsappClient.get('/api/Webhook/ping')
    return response.data
  },

  /** Envoyer un payload webhook manuellement */
  send: async (payload: WebhookPayload): Promise<any> => {
    const response = await whatsappClient.post('/api/Webhook', payload)
    return response.data
  },
}
