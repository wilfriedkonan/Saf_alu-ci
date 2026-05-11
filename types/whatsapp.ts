// ============================================
// TYPES - WhatsApp API Service
// ============================================

// --- Instances ---

export interface CreateInstanceRequest {
  instanceName?: string
  integration?: string
  qrcode: boolean
}

export interface InstanceStatus {
  instanceName: string
  status: string
  connected: boolean
  [key: string]: any
}

export interface QrCodeResponse {
  pairingCode?: string | null
  code?: string
  base64?: string
  count?: number
  [key: string]: any
}

// --- Messages ---

export interface SendTextRequest {
  instance: string
  phone: string
  message: string
  delay?: boolean
}

export interface SendImageRequest {
  instance: string
  phone: string
  imageUrl: string
  caption?: string
}

export interface SendDocumentRequest {
  instance: string
  phone: string
  documentUrl: string
  fileName?: string
  caption?: string
}

export interface SendAudioRequest {
  instance: string
  phone: string
  audioUrl: string
}

export interface ButtonItem {
  buttonId?: string
  buttonText?: string
}

export interface SendButtonsRequest {
  instance: string
  phone: string
  title?: string
  description?: string
  footer?: string
  buttons?: ButtonItem[]
}

// --- Réponses ---

export interface MessageResponse {
  messageId?: string
  status?: string
  phone?: string
  sentAt: string
}

export interface MessageApiResponse {
  success: boolean
  message?: string
  data?: MessageResponse
  error?: string
  timestamp: string
}

// --- Webhook ---

export interface WebhookPayload {
  event?: string
  instance?: string
  data?: any
  timestamp: string
}

// --- État des hooks ---

export interface WhatsappState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
