import axios from 'axios'
import { apiClient, API_BASE_URL, publicApiClient } from '@/lib/api-config'
import type {
  DevisFournisseur,
  Fournisseur,
  ComparaisonDevis,
  FormulairePublicDevis,
  CreateDevisFournisseurRequest,
  UpdateDevisFournisseurRequest,
  CreateLigneRequest,
  UpdateLigneRequest,
  CreateSectionRequest,
  UpdateSectionRequest,
  EnvoyerDemandesRequest,
  CreateFournisseurRequest,
  UpdateFournisseurRequest,
  SelectionnerFournisseurRequest,
  SelectionnerLignesRequest,
  ValiderOtpRequest,
  SoumettreReponsesRequest,
} from '@/types/devis-fournisseur'

// Client sans intercepteur d'auth pour les endpoints publics (AllowAnonymous)
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Fournisseurs ──────────────────────────────────────────────

export const FournisseurService = {
  getAll: async (search?: string): Promise<Fournisseur[]> => {
    const r = await apiClient.get('/fournisseurs', { params: search ? { search } : {} })
    return r.data?.fournisseurs ?? r.data
  },

  getById: async (id: number): Promise<Fournisseur> => {
    const r = await apiClient.get(`/fournisseurs/${id}`)
    return r.data
  },

  create: async (data: CreateFournisseurRequest): Promise<{ id: number }> => {
    const r = await apiClient.post('/fournisseurs', data)
    return r.data
  },

  update: async (id: number, data: UpdateFournisseurRequest): Promise<void> => {
    await apiClient.put(`/fournisseurs/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/fournisseurs/${id}`)
  },
}

// ── Devis Fournisseur (back-office) ───────────────────────────

export const DevisFournisseurService = {
  getAll: async (params?: { statut?: string; typeDevis?: string }) => {
    const r = await apiClient.get('/devis-fournisseur', { params })
    return r.data
  },

  getById: async (id: number): Promise<DevisFournisseur> => {
    const r = await apiClient.get(`/devis-fournisseur/${id}`)
    return r.data
  },

  create: async (data: CreateDevisFournisseurRequest): Promise<{ id: number }> => {
    const r = await apiClient.post('/devis-fournisseur', data)
    return r.data
  },

  update: async (id: number, data: UpdateDevisFournisseurRequest): Promise<void> => {
    await apiClient.put(`/devis-fournisseur/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/devis-fournisseur/${id}`)
  },

  cloturer: async (id: number): Promise<void> => {
    await apiClient.patch(`/devis-fournisseur/${id}/cloturer`)
  },

  // Sections
  createSection: async (devisId: number, data: CreateSectionRequest) => {
    const r = await apiClient.post(`/devis-fournisseur/${devisId}/sections`, data)
    return r.data
  },

  updateSection: async (devisId: number, sectionId: number, data: UpdateSectionRequest) => {
    await apiClient.put(`/devis-fournisseur/${devisId}/sections/${sectionId}`, data)
  },

  deleteSection: async (devisId: number, sectionId: number) => {
    await apiClient.delete(`/devis-fournisseur/${devisId}/sections/${sectionId}`)
  },

  // Lignes
  createLigne: async (devisId: number, data: CreateLigneRequest) => {
    const r = await apiClient.post(`/devis-fournisseur/${devisId}/lignes`, data)
    return r.data
  },

  updateLigne: async (devisId: number, ligneId: number, data: UpdateLigneRequest) => {
    await apiClient.put(`/devis-fournisseur/${devisId}/lignes/${ligneId}`, data)
  },

  deleteLigne: async (devisId: number, ligneId: number) => {
    await apiClient.delete(`/devis-fournisseur/${devisId}/lignes/${ligneId}`)
  },

  // Demandes
  envoyerDemandes: async (devisId: number, data: EnvoyerDemandesRequest) => {
    const r = await apiClient.post(`/devis-fournisseur/${devisId}/demandes`, data)
    return r.data
  },

  annulerDemande: async (devisId: number, demandeId: number) => {
    await apiClient.delete(`/devis-fournisseur/${devisId}/demandes/${demandeId}`)
  },

  // Comparaison
  getComparaison: async (devisId: number): Promise<ComparaisonDevis> => {
    const r = await apiClient.get(`/devis-fournisseur/${devisId}/comparaison`)
    return r.data
  },

  selectionnerFournisseur: async (devisId: number, data: SelectionnerFournisseurRequest) => {
    await apiClient.post(`/devis-fournisseur/${devisId}/selectionner-fournisseur`, data)
  },

  selectionnerLignes: async (devisId: number, data: SelectionnerLignesRequest) => {
    await apiClient.post(`/devis-fournisseur/${devisId}/selectionner-lignes`, data)
  },
}

// ── Devis Fournisseur Public (AllowAnonymous) ─────────────────

export const DevisFournisseurPublicService = {
  getFormulaire: async (token: string): Promise<FormulairePublicDevis> => {
    const r = await publicClient.get(`/devis-fournisseur/public/${token}`)
    return r.data
  },

  validerOtp: async (token: string, data: ValiderOtpRequest): Promise<void> => {
    await publicClient.post(`/devis-fournisseur/public/${token}/valider-otp`, data)
  },

  soumettreReponses: async (token: string, data: SoumettreReponsesRequest): Promise<void> => {
    await publicClient.post(`/devis-fournisseur/public/${token}/soumettre`, data)
  },
}

// ============================================================
// API — Public (no auth)
// ============================================================


export async function apiPublic<T>(
  path: string,
  options?: { method?: string; body?: string }
): Promise<T> {
  const res = await publicApiClient.request<T>({
    url:    `/devis-fournisseur/public/${path}`,
    method: options?.method ?? "GET",
    data:   options?.body ? JSON.parse(options.body) : undefined,
  })
  return res.data
}
