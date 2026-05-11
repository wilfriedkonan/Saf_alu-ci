// ============================================
// TYPES - WhatsApp Paramètres (API SafAlu)
// ============================================

// --- Comptes WhatsApp ---

export interface WhatsAppCompte {
  id: number
  nomInstance: string
  nomAffichage: string
  numeroTelephone: string
  description?: string
  service?: string
  connecte: boolean
  dateConnexion?: string
  dateCreation?: string
  dateModification?: string
}

export interface CreateWhatsAppCompteRequest {
  nomInstance: string
  nomAffichage: string
  numeroTelephone: string
  description?: string
  service?: string
}

export interface UpdateWhatsAppCompteRequest {
  nomAffichage: string
  numeroTelephone?: string
  description?: string
  service?: string
}

export interface ConnexionWhatsAppRequest {
  connecte: boolean
}

// --- Types de messages ---

export interface WhatsAppMessageType {
  id: number
  code: string
  libelle: string
  description?: string
}

// --- Messages prédéfinis ---

export interface WhatsAppMessagePredefini {
  id: number
  idType: number
  titre: string
  contenu: string
  variables?: string
  variablesListe?: string[]
  actif: boolean
  type?: WhatsAppMessageType
  dateCreation?: string
  dateModification?: string
}

export interface CreateWhatsAppMessagePredefiniRequest {
  idType: number
  titre: string
  contenu: string
  variables?: string
}

export interface UpdateWhatsAppMessagePredefiniRequest {
  titre: string
  contenu: string
  variables?: string
  actif?: boolean
}

export interface PrevisualiserMessageRequest {
  variables: Record<string, string>
}

export interface PrevisualiserMessageResponse {
  contenuResolu: string
  variablesManquantes: string[]
  estComplet: boolean
  [key: string]: any
}
