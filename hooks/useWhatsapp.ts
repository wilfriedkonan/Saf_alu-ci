import { useState, useCallback } from 'react'
import {
  WhatsAppInstanceService,
  WhatsAppMessageService,
  WhatsAppWebhookService,
} from '@/services/whatsappService'
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
// HOOK - Instances
// ============================================

export function useWhatsappInstances() {
  const [instances, setInstances] = useState<any[]>([])
  const [status, setStatus] = useState<InstanceStatus | null>(null)
  const [qrCode, setQrCode] = useState<QrCodeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInstances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await WhatsAppInstanceService.getAll()
      setInstances(data)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur lors du chargement des instances')
    } finally {
      setLoading(false)
    }
  }, [])

  const createInstance = useCallback(async (data: CreateInstanceRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppInstanceService.create(data)
      await fetchInstances()
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Erreur lors de la création de l'instance"
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [fetchInstances])

  const fetchStatus = useCallback(async (instanceName: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await WhatsAppInstanceService.getStatus(instanceName)
      setStatus(data)
      return data
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur lors du chargement du statut')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchQrCode = useCallback(async (instanceName: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await WhatsAppInstanceService.getQrCode(instanceName)
      setQrCode(data)
      return data
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur lors du chargement du QR code')
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async (instanceName: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppInstanceService.logout(instanceName)
      await fetchInstances()
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors de la déconnexion'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [fetchInstances])

  const restart = useCallback(async (instanceName: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppInstanceService.restart(instanceName)
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur lors du redémarrage'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteInstance = useCallback(async (instanceName: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppInstanceService.delete(instanceName)
      await fetchInstances()
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Erreur lors de la suppression de l'instance"
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [fetchInstances])

  return {
    instances,
    status,
    qrCode,
    loading,
    error,
    fetchInstances,
    createInstance,
    fetchStatus,
    fetchQrCode,
    logout,
    restart,
    deleteInstance,
  }
}

// ============================================
// HOOK - Messages
// ============================================

export function useWhatsappMessages() {
  const [lastResponse, setLastResponse] = useState<MessageApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (fn: () => Promise<MessageApiResponse>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      setLastResponse(result)
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? "Erreur d'envoi"
      setError(msg)
      return { success: false, error: msg, timestamp: new Date().toISOString() } as MessageApiResponse
    } finally {
      setLoading(false)
    }
  }

  const sendText = useCallback(
    (data: SendTextRequest) => handleSend(() => WhatsAppMessageService.sendText(data)),
    []
  )

  const sendImage = useCallback(
    (data: SendImageRequest) => handleSend(() => WhatsAppMessageService.sendImage(data)),
    []
  )

  const sendDocument = useCallback(
    (data: SendDocumentRequest) => handleSend(() => WhatsAppMessageService.sendDocument(data)),
    []
  )

  const sendAudio = useCallback(
    (data: SendAudioRequest) => handleSend(() => WhatsAppMessageService.sendAudio(data)),
    []
  )

  const sendButtons = useCallback(
    (data: SendButtonsRequest) => handleSend(() => WhatsAppMessageService.sendButtons(data)),
    []
  )

  return {
    lastResponse,
    loading,
    error,
    sendText,
    sendImage,
    sendDocument,
    sendAudio,
    sendButtons,
  }
}

// ============================================
// HOOK - Webhook
// ============================================

export function useWhatsappWebhook() {
  const [pingResult, setPingResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ping = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await WhatsAppWebhookService.ping()
      setPingResult(result)
      return result
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Webhook inaccessible')
    } finally {
      setLoading(false)
    }
  }, [])

  const sendWebhook = useCallback(async (payload: WebhookPayload) => {
    setLoading(true)
    setError(null)
    try {
      return await WhatsAppWebhookService.send(payload)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Erreur d'envoi webhook"
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    pingResult,
    loading,
    error,
    ping,
    sendWebhook,
  }
}
