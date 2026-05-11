import { useState, useEffect, useCallback } from 'react'
import { FournisseurService, DevisFournisseurService, DevisFournisseurPublicService } from '@/services/devisFournisseurService'
import type {
  DevisFournisseur,
  Fournisseur,
  ComparaisonDevis,
  FormulairePublicDevis,
  SoumettreReponsesRequest,
} from '@/types/devis-fournisseur'

export function useFournisseurs(search?: string) {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setFournisseurs(await FournisseurService.getAll(search)) }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetch() }, [fetch])
  return { fournisseurs, loading, error, refresh: fetch }
}

export function useDevisFournisseurList(params?: { statut?: string; typeDevis?: string }) {
  const [data, setData] = useState<{ devis: DevisFournisseur[]; resume: any } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await DevisFournisseurService.getAll(params)) }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message) }
    finally { setLoading(false) }
  }, [params?.statut, params?.typeDevis])

  useEffect(() => { fetch() }, [fetch])
  return { devis: data?.devis ?? [], resume: data?.resume, loading, error, refresh: fetch }
}

export function useDevisFournisseur(id: number | null) {
  const [devis, setDevis] = useState<DevisFournisseur | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true); setError(null)
    try { setDevis(await DevisFournisseurService.getById(id)) }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetch() }, [fetch])
  return { devis, loading, error, refresh: fetch }
}

export function useComparaisonDevis(devisId: number | null) {
  const [comparaison, setComparaison] = useState<ComparaisonDevis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!devisId) return
    setLoading(true); setError(null)
    try { setComparaison(await DevisFournisseurService.getComparaison(devisId)) }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message) }
    finally { setLoading(false) }
  }, [devisId])

  useEffect(() => { fetch() }, [fetch])
  return { comparaison, loading, error, refresh: fetch }
}

export function useDevisFournisseurPublic(token: string | null) {
  const [formulaire, setFormulaire] = useState<FormulairePublicDevis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpValide, setOtpValide] = useState(false)

  const fetchFormulaire = useCallback(async () => {
    if (!token) return
    setLoading(true); setError(null)
    try {
      const data = await DevisFournisseurPublicService.getFormulaire(token)
      setFormulaire(data)
      setOtpValide(data.otpValide)
    }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { fetchFormulaire() }, [fetchFormulaire])

  const validerOtp = useCallback(async (otp: string): Promise<void> => {
    if (!token) throw new Error('Token manquant')
    await DevisFournisseurPublicService.validerOtp(token, { otp })
    setOtpValide(true)
  }, [token])

  const soumettre = useCallback(async (reponses: SoumettreReponsesRequest['reponses']): Promise<void> => {
    if (!token) throw new Error('Token manquant')
    await DevisFournisseurPublicService.soumettreReponses(token, { reponses })
  }, [token])

  return { formulaire, loading, error, otpValide, validerOtp, soumettre, refresh: fetchFormulaire }
}
