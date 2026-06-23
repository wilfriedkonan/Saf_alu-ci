
import whatsappClient from '@/lib/api-config';
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
} from '@/types/whatsapp';

// ✅ Le frontend appelle TOUJOURS via le proxy SAF ALU-CI
// La clé API WhatsApp ne quitte JAMAIS le client!

export const WhatsAppInstanceService = {
  /** Liste toutes les instances WhatsApp */
  getAll: async (): Promise<any[]> => {
    const response = await whatsappClient.get('/WhatsAppProxy/instances');
    return response.data.data ?? [];
  },

  /** Crée une nouvelle instance */
  create: async (data: CreateInstanceRequest): Promise<any> => {
    const response = await whatsappClient.post('/WhatsAppProxy/instances', data);
    return response.data.data;
  },

  /** Statut de connexion d'une instance */
  getStatus: async (instanceName: string): Promise<InstanceStatus> => {
    const response = await whatsappClient.get(
      `/WhatsAppProxy/instances/${instanceName}/status`
    );
    return response.data.data;
  },

  /** QR Code pour connecter une instance */
  getQrCode: async (instanceName: string): Promise<QrCodeResponse> => {
    const response = await whatsappClient.get(
      `/WhatsAppProxy/instances/${instanceName}/qrcode`
    );
    return response.data.data ?? response.data;
  },

  /** Déconnecter une instance */
  logout: async (instanceName: string): Promise<any> => {
    const response = await whatsappClient.post(
      `/WhatsAppProxy/instances/${instanceName}/logout`
    );
    return response.data.data;
  },

  /** Redémarrer une instance */
  restart: async (instanceName: string): Promise<any> => {
    const response = await whatsappClient.post(
      `/WhatsAppProxy/instances/${instanceName}/restart`
    );
    return response.data.data;
  },

  /** Supprimer une instance */
  delete: async (instanceName: string): Promise<any> => {
    const response = await whatsappClient.delete(
      `/WhatsAppProxy/instances/${instanceName}`
    );
    return response.data.data;
  },
};

export const WhatsAppMessageService = {
  /** Envoyer un message texte */
  sendText: async (data: SendTextRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>(
      '/WhatsAppProxy/messages/text',
      data
    );
    return  response.data;
  },

  /** Envoyer une image */
  sendImage: async (data: SendImageRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>(
      '/WhatsAppProxy/messages/image',
      data
    );
    return response.data;
  },

  /** Envoyer un document (PDF, Word, etc.) */
  sendDocument: async (data: SendDocumentRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>(
      '/WhatsAppProxy/messages/document',
      data
    );
    return  response.data;
  },

  /** Envoyer un message audio */
  sendAudio: async (data: SendAudioRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>(
      '/WhatsAppProxy/messages/audio',
      data
    );
    return  response.data;
  },

  /** Envoyer un message avec boutons interactifs */
  sendButtons: async (data: SendButtonsRequest): Promise<MessageApiResponse> => {
    const response = await whatsappClient.post<MessageApiResponse>(
      '/WhatsAppProxy/messages/buttons',
      data
    );
    return  response.data;
  },
};

export const WhatsAppWebhookService = {
  /** Vérifier que le webhook est actif */
  ping: async (): Promise<any> => {
    const response = await whatsappClient.get('/WhatsAppProxy/webhook/ping');
    return response.data.data ?? response.data;
  },

  /** Envoyer un payload webhook manuellement */
  send: async (payload: WebhookPayload): Promise<any> => {
    const response = await whatsappClient.post('/WhatsAppProxy/webhook', payload);
    return response.data.data ?? response.data;
  },
};