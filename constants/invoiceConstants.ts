// constants/invoiceConstants.ts - Constantes pour les factures

import type { InvoiceStatus, InvoiceType } from "@/lib/invoices"

/**
 * Configuration des factures
 */
export const INVOICE_CONFIG = {
  // TVA par défaut en Côte d'Ivoire
  DEFAULT_TAX_RATE: 18,
  
  // Conditions de paiement par défaut
  DEFAULT_PAYMENT_TERMS: "30 jours",
  
  // Délai de relance automatique (en jours)
  AUTO_REMINDER_DELAY: 7,
  
  // Nombre maximum de relances
  MAX_REMINDERS: 3,
  
  // Préfixe du numéro de facture
  INVOICE_NUMBER_PREFIX: "FAC",
  
  // Unités courantes
  COMMON_UNITS: ["unité", "m²", "m³", "ml", "kg", "heure", "jour", "forfait", "lot"],
  
  // Devises
  CURRENCY: "XOF",
  CURRENCY_SYMBOL: "FCFA",
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  
  // Validation
  MIN_AMOUNT: 0,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
} as const

/**
 * États des factures avec leurs propriétés
 */
export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    label: string
    color: string
    icon: string
    canEdit: boolean
    canSend: boolean
    canPay: boolean
    canCancel: boolean
  }
> = {
  brouillon: {
    label: "Brouillon",
    color: "bg-gray-100 text-gray-800",
    icon: "FileEdit",
    canEdit: true,
    canSend: true,
    canPay: false,
    canCancel: true,
  },
  envoyee: {
    label: "Envoyée",
    color: "bg-blue-100 text-blue-800",
    icon: "Send",
    canEdit: false,
    canSend: false,
    canPay: true,
    canCancel: true,
  },
  payee: {
    label: "Payée",
    color: "bg-green-100 text-green-800",
    icon: "CheckCircle",
    canEdit: false,
    canSend: false,
    canPay: false,
    canCancel: false,
  },
  en_retard: {
    label: "En retard",
    color: "bg-red-100 text-red-800",
    icon: "AlertTriangle",
    canEdit: false,
    canSend: false,
    canPay: true,
    canCancel: true,
  },
  partiellement_payee: {
    label: "Partiellement payée",
    color: "bg-yellow-100 text-yellow-800",
    icon: "Clock",
    canEdit: false,
    canSend: false,
    canPay: true,
    canCancel: true,
  },
  annulee: {
    label: "Annulée",
    color: "bg-gray-100 text-gray-800",
    icon: "XCircle",
    canEdit: false,
    canSend: false,
    canPay: false,
    canCancel: false,
  },
}

/**
 * Types de factures avec leurs propriétés
 */
export const INVOICE_TYPE_CONFIG: Record<
  InvoiceType,
  {
    label: string
    description: string
    icon: string
    requiresClient: boolean
    requiresSubcontractor: boolean
  }
> = {
  facture_devis: {
    label: "Facture Devis",
    description: "Facture basée sur un devis client",
    icon: "FileText",
    requiresClient: true,
    requiresSubcontractor: false,
  },
  facture_sous_traitant: {
    label: "Facture Sous-traitant",
    description: "Facture pour un sous-traitant",
    icon: "Users",
    requiresClient: false,
    requiresSubcontractor: true,
  },
  avoir: {
    label: "Avoir",
    description: "Note de crédit ou remboursement",
    icon: "RefreshCcw",
    requiresClient: true,
    requiresSubcontractor: false,
  },
}

/**
 * Modes de paiement disponibles
 */
export const PAYMENT_METHODS = [
  { value: "especes", label: "Espèces" },
  { value: "virement", label: "Virement bancaire" },
  { value: "cheque", label: "Chèque" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "carte_bancaire", label: "Carte bancaire" },
  { value: "autre", label: "Autre" },
] as const

/**
 * Conditions de paiement prédéfinies
 */
export const PAYMENT_TERMS_OPTIONS = [
  { value: "comptant", label: "Comptant", days: 0 },
  { value: "15_jours", label: "15 jours", days: 15 },
  { value: "30_jours", label: "30 jours", days: 30 },
  { value: "45_jours", label: "45 jours", days: 45 },
  { value: "60_jours", label: "60 jours", days: 60 },
  { value: "90_jours", label: "90 jours", days: 90 },
] as const

/**
 * Templates d'échéanciers de paiement
 */
export const PAYMENT_SCHEDULE_TEMPLATES = [
  {
    id: "unique",
    label: "Paiement unique",
    schedule: [{ percentage: 100, description: "Paiement total" }],
  },
  {
    id: "30_70",
    label: "30% - 70%",
    schedule: [
      { percentage: 30, description: "Acompte à la commande" },
      { percentage: 70, description: "Solde à la livraison" },
    ],
  },
  {
    id: "50_50",
    label: "50% - 50%",
    schedule: [
      { percentage: 50, description: "Acompte à la commande" },
      { percentage: 50, description: "Solde à la livraison" },
    ],
  },
  {
    id: "40_30_30",
    label: "40% - 30% - 30%",
    schedule: [
      { percentage: 40, description: "Acompte à la commande" },
      { percentage: 30, description: "Paiement intermédiaire" },
      { percentage: 30, description: "Solde à la livraison" },
    ],
  },
  {
    id: "25_25_25_25",
    label: "4 versements égaux",
    schedule: [
      { percentage: 25, description: "1er versement" },
      { percentage: 25, description: "2ème versement" },
      { percentage: 25, description: "3ème versement" },
      { percentage: 25, description: "Dernier versement" },
    ],
  },
] as const

/**
 * Messages de relance par défaut
 */
export const REMINDER_TEMPLATES = {
  first: {
    subject: "Rappel: Facture {{invoiceNumber}} à échéance",
    body: `Bonjour {{clientName}},

Nous vous rappelons que la facture {{invoiceNumber}} d'un montant de {{amount}} arrive à échéance le {{dueDate}}.

Merci de bien vouloir procéder au règlement dans les meilleurs délais.

Cordialement,
SAF ALU-CI`,
  },
  second: {
    subject: "2ème rappel: Facture {{invoiceNumber}} en retard",
    body: `Bonjour {{clientName}},

Nous constatons que la facture {{invoiceNumber}} d'un montant de {{amount}} est en retard de paiement depuis le {{dueDate}}.

Nous vous remercions de régulariser votre situation rapidement.

Cordialement,
SAF ALU-CI`,
  },
  third: {
    subject: "Dernier rappel: Facture {{invoiceNumber}} - Action requise",
    body: `Bonjour {{clientName}},

Malgré nos précédents rappels, la facture {{invoiceNumber}} d'un montant de {{amount}} reste impayée depuis le {{dueDate}}.

Nous vous prions de bien vouloir nous contacter dans les plus brefs délais pour régulariser cette situation.

Cordialement,
SAF ALU-CI`,
  },
} as const

/**
 * Règles de validation
 */
export const VALIDATION_RULES = {
  invoice: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 200,
    },
    description: {
      required: false,
      maxLength: 500,
    },
    items: {
      required: true,
      minItems: 1,
      maxItems: 100,
    },
    taxRate: {
      required: true,
      min: 0,
      max: 100,
    },
  },
  item: {
    designation: {
      required: true,
      minLength: 2,
      maxLength: 200,
    },
    quantity: {
      required: true,
      min: 0.01,
      max: 999999,
    },
    unitPrice: {
      required: true,
      min: 0,
      max: 999999999,
    },
  },
  payment: {
    amount: {
      required: true,
      min: 0.01,
    },
    dueDate: {
      required: true,
    },
  },
} as const

/**
 * Format d'export disponibles
 */
export const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF", icon: "FileText" },
  { value: "excel", label: "Excel", icon: "FileSpreadsheet" },
  { value: "csv", label: "CSV", icon: "FileSpreadsheet" },
] as const

/**
 * Colonnes disponibles pour l'export
 */
export const EXPORT_COLUMNS = [
  { key: "number", label: "Numéro", default: true },
  { key: "type", label: "Type", default: true },
  { key: "clientName", label: "Client", default: true },
  { key: "title", label: "Titre", default: true },
  { key: "status", label: "Statut", default: true },
  { key: "invoiceDate", label: "Date facture", default: true },
  { key: "dueDate", label: "Date échéance", default: true },
  { key: "subtotal", label: "Sous-total", default: true },
  { key: "taxAmount", label: "TVA", default: true },
  { key: "total", label: "Total TTC", default: true },
  { key: "paidAmount", label: "Montant payé", default: true },
  { key: "remainingAmount", label: "Reste à payer", default: true },
  { key: "paymentTerms", label: "Conditions paiement", default: false },
  { key: "clientEmail", label: "Email client", default: false },
  { key: "clientPhone", label: "Téléphone client", default: false },
  { key: "description", label: "Description", default: false },
  { key: "notes", label: "Notes", default: false },
  { key: "remindersSent", label: "Relances envoyées", default: false },
  { key: "createdAt", label: "Date création", default: false },
  { key: "updatedAt", label: "Date modification", default: false },
] as const

/**
 * Permissions requises pour chaque action
 */
export const INVOICE_PERMISSIONS = {
  view: ["admin", "manager", "accountant", "viewer"],
  create: ["admin", "manager", "accountant"],
  edit: ["admin", "manager", "accountant"],
  delete: ["admin", "manager"],
  send: ["admin", "manager", "accountant"],
  markAsPaid: ["admin", "manager", "accountant"],
  cancel: ["admin", "manager"],
  exportPDF: ["admin", "manager", "accountant", "viewer"],
  exportExcel: ["admin", "manager", "accountant"],
  sendReminder: ["admin", "manager", "accountant"],
} as const

/**
 * Messages d'erreur par défaut
 */
export const ERROR_MESSAGES = {
  LOAD_FAILED: "Erreur lors du chargement des factures",
  CREATE_FAILED: "Erreur lors de la création de la facture",
  UPDATE_FAILED: "Erreur lors de la mise à jour de la facture",
  DELETE_FAILED: "Erreur lors de la suppression de la facture",
  SEND_FAILED: "Erreur lors de l'envoi de la facture",
  PAYMENT_FAILED: "Erreur lors de l'enregistrement du paiement",
  CANCEL_FAILED: "Erreur lors de l'annulation de la facture",
  PDF_FAILED: "Erreur lors de la génération du PDF",
  EXPORT_FAILED: "Erreur lors de l'export",
  REMINDER_FAILED: "Erreur lors de l'envoi de la relance",
  INVALID_DATA: "Données invalides",
  PERMISSION_DENIED: "Permission refusée",
  NOT_FOUND: "Facture non trouvée",
  ALREADY_PAID: "Facture déjà payée",
  CANNOT_EDIT: "Impossible de modifier cette facture",
  INVALID_AMOUNT: "Montant invalide",
  SCHEDULE_MISMATCH: "Le total des échéanciers ne correspond pas au montant total",
} as const

/**
 * Messages de succès par défaut
 */
export const SUCCESS_MESSAGES = {
  CREATED: "Facture créée avec succès",
  UPDATED: "Facture mise à jour avec succès",
  DELETED: "Facture supprimée avec succès",
  SENT: "Facture envoyée avec succès",
  PAID: "Paiement enregistré avec succès",
  CANCELLED: "Facture annulée avec succès",
  PDF_GENERATED: "PDF généré avec succès",
  EXPORTED: "Export réussi",
  REMINDER_SENT: "Relance envoyée avec succès",
} as const