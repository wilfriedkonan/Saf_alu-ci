"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw, Search, X, Check } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useTresorerie } from "@/hooks/useTresorerie"
import {
  categoriesMouvementList,
  CreateMouvementRequest,
  formatDateForAPI,
  typeMouvementLabels,
  typesMouvementList,
  TypeMouvement,
  Compte,
} from "@/types/tresorerie"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProjetEtapes, useProjetsList } from "@/hooks/useProjet"
import { useSousTraitantList } from "@/hooks/useSoustraitant"
import { ScrollArea } from "@/components/ui/scroll-area"

// ============================================
// INTERFACES POUR LES ENTITÉS LIÉES
// ============================================

interface Projet {
  id: number
  numero: string
  nom: string
  client: string
}

interface Facture {
  id: number
  numeroFacture: string
  client: string
  montantTotal: number
}

interface SousTraitant {
  id: number
  codeContractant: string
  nom: string
  specialite: string
}

// ============================================
// PROPS DU COMPOSANT
// ============================================

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  comptes?: Compte[]
  loadingComptes?: boolean
  errorComptes?: string | null
}

interface FormState {
  typeMouvement: TypeMouvement
  compteId: string
  compteDestinationId: string
  libelle: string
  description: string
  categorie: string
  montant: string
  modePaiement: string
  reference: string
  factureId: string
  projetId: string
  sousTraitantId: string
  etapeProjetId: string
}

const initialFormState: FormState = {
  typeMouvement: "Entree",
  compteId: "",
  compteDestinationId: "",
  libelle: "",
  description: "",
  categorie: "",
  montant: "",
  modePaiement: "",
  reference: "",
  factureId: "",
  projetId: "",
  sousTraitantId: "",
  etapeProjetId: "",
}

// ============================================
// COMPOSANT DE RECHERCHE CORRIGÉ
// Utilise Input + ScrollArea au lieu de Command
// ============================================

interface SearchSelectProps<T> {
  label: string
  placeholder: string
  data: T[]
  loading: boolean
  error?: string | null
  value: string
  onValueChange: (value: string) => void
  displayField: (item: T) => string
  secondaryField?: (item: T) => string
  getKey: (item: T) => string
  disabled?: boolean
}

function SearchSelect<T>({
  label,
  placeholder,
  data,
  loading,
  error,
  value,
  onValueChange,
  displayField,
  secondaryField,
  getKey,
  disabled = false,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrage avec recherche sur TOUS les champs possibles (nom, designation, etc.)
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return []
    if (!searchQuery.trim()) return data
    
    const query = searchQuery.toLowerCase().trim()
    
    return data.filter((item: T) => {
      const itemAny = item as any
      
      // Liste de tous les champs à rechercher
      const fieldsToSearch = [
        displayField(item),
        secondaryField ? secondaryField(item) : '',
        itemAny?.nom,
        itemAny?.name,
        itemAny?.nomProjet,
        itemAny?.nomEtape,
        itemAny?.designation,
        itemAny?.numero,
        itemAny?.codeProjet,
        itemAny?.codeContractant,
        itemAny?.numeroFacture,
        itemAny?.client,
        itemAny?.nomClient,
        itemAny?.specialite,
      ]
      
      // Vérifier si au moins un champ contient la requête
      return fieldsToSearch.some(field => 
        field && typeof field === 'string' && field.toLowerCase().includes(query)
      )
    })
  }, [data, searchQuery, displayField, secondaryField])

  const selectedItem = useMemo(() => {
    if (!value || !Array.isArray(data)) return null
    return data.find((item: T) => getKey(item) === value)
  }, [data, value, getKey])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange("")
    setSearchQuery("")
  }

  const handleSelect = (item: T) => {
    onValueChange(getKey(item))
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <div>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedItem && "text-muted-foreground"
            )}
            disabled={disabled || loading}
          >
            <span className="truncate">
              {loading ? "Chargement..." : selectedItem ? displayField(selectedItem) : placeholder}
            </span>
            {selectedItem ? (
              <X
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
              />
            ) : (
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="flex flex-col">
            {/* Input de recherche */}
            <div className="p-2 border-b">
              <Input
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
                autoFocus
              />
            </div>
            
            {/* Liste des résultats */}
            <ScrollArea className="h-[250px]">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Chargement...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-destructive">
                  {error}
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? "Aucun résultat trouvé" : "Aucune donnée disponible"}
                </div>
              ) : (
                <div className="p-1">
                  {filteredData.map((item: T) => {
                    const isSelected = value === getKey(item)
                    return (
                      <div
                        key={getKey(item)}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer",
                          "hover:bg-accent hover:text-accent-foreground",
                          isSelected && "bg-accent"
                        )}
                      >
                        <Check 
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )} 
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">
                            {displayField(item)}
                          </span>
                          {secondaryField && (
                            <span className="text-xs text-muted-foreground truncate">
                              {secondaryField(item)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
            
            {/* Compteur de résultats */}
            {!loading && !error && filteredData.length > 0 && (
              <div className="p-2 border-t text-xs text-muted-foreground text-center">
                {filteredData.length} résultat(s) {searchQuery && `pour "${searchQuery}"`}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

// ============================================
// HOOKS POUR CHARGER LES DONNÉES
// ============================================

// Hook pour charger les factures
function useFactures() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFactures = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/Factures/non-payees")
      if (!response.ok) throw new Error("Erreur lors du chargement des factures")
      const data = await response.json()
      
      const rawFactures = Array.isArray(data) ? data : data.factures || []
      const mappedFactures = rawFactures.map((f: any) => ({
        id: f.id || f.factureId,
        numeroFacture: f.numeroFacture || f.numero || '',
        client: f.client || f.nomClient || f.detailDebiteur?.nom || '',
        montantTotal: f.montantTotal || f.montant || 0,
      }))
      
      setFactures(mappedFactures)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFactures()
  }, [fetchFactures])

  return { factures, loading, error, refetch: fetchFactures }
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  comptes: comptesFromProps,
  loadingComptes: loadingComptesFromProps,
  errorComptes: errorComptesFromProps,
}: TransactionFormModalProps) {
  const { toast } = useToast()
  const tresorerieHook = useTresorerie()

  // Charger les comptes
  const rawComptes = useMemo(() => {
    if (comptesFromProps !== undefined) {
      return Array.isArray(comptesFromProps) ? comptesFromProps : []
    }
    const hookComptes = tresorerieHook.comptes
    return Array.isArray(hookComptes) ? hookComptes : []
  }, [comptesFromProps, tresorerieHook.comptes])

  const loadingComptes = loadingComptesFromProps !== undefined ? loadingComptesFromProps : (tresorerieHook.loadingComptes ?? false)
  const errorComptes = errorComptesFromProps !== undefined ? errorComptesFromProps : (tresorerieHook.errorComptes ?? null)

  const {
    createMouvement,
    loadingMouvementActions,
    errorMouvementActions,
    refreshComptes,
  } = tresorerieHook

  // Filtrer uniquement les comptes actifs
  const comptes = useMemo(() => {
    return Array.isArray(rawComptes) ? rawComptes.filter((compte) => compte.actif) : []
  }, [rawComptes])

  // Charger les données liées
  const { projets, loading: loadingProjets, error: errorProjets } = useProjetsList()
  const { factures, loading: loadingFactures, error: errorFactures } = useFactures()
  const { sousTraitantList, loading: loadingSousTraitants, error: errorSousTraitants } = useSousTraitantList()

  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [transactionDate, setTransactionDate] = useState<Date>(new Date())

  // Charger les étapes quand un projet est sélectionné
  const { etapes, loading: loadingEtapes, error: errorEtapes } = useProjetEtapes(Number(formState.projetId))

  const resetForm = useCallback(() => {
    setFormState({ ...initialFormState })
    setTransactionDate(new Date())
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  // Rafraîchir les comptes à l'ouverture
  useEffect(() => {
    if (isOpen && comptesFromProps === undefined && rawComptes.length === 0 && !loadingComptes) {
      refreshComptes()
    }
  }, [isOpen, comptesFromProps, rawComptes.length, loadingComptes, refreshComptes])

  // Sélectionner automatiquement le premier compte
  useEffect(() => {
    if (comptes.length > 0 && !formState.compteId) {
      setFormState((prev) => ({ ...prev, compteId: comptes[0].id.toString() }))
    }
  }, [comptes, formState.compteId])

  const isVirement = formState.typeMouvement === "Virement"
  const isEntree = formState.typeMouvement === "Entree"
  const isSortie = formState.typeMouvement === "Sortie"

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => {
      const newState = { ...prev, [field]: value }

      // Si on change de projet, réinitialiser l'étape
      if (field === "projetId") {
        newState.etapeProjetId = ""
      }

      return newState
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formState.compteId) {
      toast({
        title: "Compte requis",
        description: "Veuillez sélectionner un compte source.",
        variant: "destructive",
      })
      return
    }

    if (isVirement && (!formState.compteDestinationId || formState.compteDestinationId === formState.compteId)) {
      toast({
        title: "Virement invalide",
        description: "Sélectionnez un compte de destination différent du compte source.",
        variant: "destructive",
      })
      return
    }

    const montant = Number(formState.montant)
    if (!montant || montant <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à zéro.",
        variant: "destructive",
      })
      return
    }

    const payload: CreateMouvementRequest = {
      compteId: Number(formState.compteId),
      typeMouvement: formState.typeMouvement,
      libelle: formState.libelle.trim(),
      description: formState.description.trim() || undefined,
      montant,
      dateMouvement: formatDateForAPI(transactionDate) ?? transactionDate.toISOString(),
      categorie: formState.categorie || undefined,
      modePaiement: formState.modePaiement || undefined,
      reference: formState.reference || undefined,
    }

    if (isVirement) {
      payload.compteDestinationId = Number(formState.compteDestinationId)
    }

    // En cas d'entrée avec facture
    if (isEntree && formState.factureId) {
      payload.factureId = Number(formState.factureId)
    }

    // En cas de sortie avec sous-traitant
    if (isSortie && formState.sousTraitantId) {
      payload.sousTraitantId = Number(formState.sousTraitantId)
    }

    // Toujours inclure le projetId si renseigné
    if (formState.projetId) {
      payload.projetId = Number(formState.projetId)
    }

    // Toujours inclure l'etapeProjetId si renseigné
    if (formState.etapeProjetId) {
      payload.etapeProjetId = Number(formState.etapeProjetId)
    }

    try {
      console.log('TransactionFormModal - Envoi du mouvement:', payload)
      const response = await createMouvement(payload)
      if (response && response.success === false) {
        throw new Error(response.message || "Échec de la création du mouvement")
      }

      toast({
        title: "Mouvement enregistré",
        description: `Le mouvement "${payload.libelle}" a été créé avec succès.`,
      })

      onClose()
      resetForm()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erreur lors de la création du mouvement:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer le mouvement",
        variant: "destructive",
      })
    }
  }

  const handleManualRefresh = useCallback(() => {
    refreshComptes()
  }, [refreshComptes])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-0">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <DialogTitle>Nouvelle transaction</DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={loadingComptes}
              >
                <RefreshCw className={`h-4 w-4 ${loadingComptes ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 pb-4">
            {errorComptes && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorComptes}</AlertDescription>
              </Alert>
            )}
            {errorMouvementActions && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMouvementActions}</AlertDescription>
              </Alert>
            )}

            {loadingComptes && comptes.length === 0 && (
              <Alert className="mb-4">
                <AlertDescription className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Chargement des comptes...
                </AlertDescription>
              </Alert>
            )}

            {!loadingComptes && comptes.length === 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Aucun compte actif disponible. Veuillez créer un compte avant d'ajouter une transaction.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* INFORMATIONS PRINCIPALES */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations principales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Type de mouvement</Label>
                      <Select
                        value={formState.typeMouvement}
                        onValueChange={(value: TypeMouvement) => handleChange("typeMouvement", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typesMouvementList.map((type) => (
                            <SelectItem key={type} value={type}>
                              {typeMouvementLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Montant (XOF)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formState.montant}
                        onChange={(event) => handleChange("montant", event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Compte source</Label>
                      <Select
                        value={formState.compteId}
                        onValueChange={(value) => handleChange("compteId", value)}
                        disabled={loadingComptes || comptes.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingComptes
                                ? "Chargement..."
                                : comptes.length === 0
                                  ? "Aucun compte disponible"
                                  : "Sélectionner un compte"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {comptes.map((compte) => (
                            <SelectItem key={compte.id} value={compte.id.toString()}>
                              {compte.nom} ({compte.typeCompte})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {comptes.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {comptes.length} compte(s) disponible(s)
                        </p>
                      )}
                    </div>
                    {isVirement && (
                      <div>
                        <Label>Compte destination</Label>
                        <Select
                          value={formState.compteDestinationId}
                          onValueChange={(value) => handleChange("compteDestinationId", value)}
                          disabled={loadingComptes || comptes.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingComptes
                                  ? "Chargement..."
                                  : comptes.length === 0
                                    ? "Aucun compte disponible"
                                    : "Sélectionner un compte"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {comptes
                              .filter((compte) => compte.id.toString() !== formState.compteId)
                              .map((compte) => (
                                <SelectItem key={compte.id} value={compte.id.toString()}>
                                  {compte.nom} ({compte.typeCompte})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Date du mouvement</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !transactionDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {transactionDate ? format(transactionDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={transactionDate}
                            onSelect={(date) => date && setTransactionDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Catégorie</Label>
                      <Select value={formState.categorie} onValueChange={(value) => handleChange("categorie", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesMouvementList.map((categorie) => (
                            <SelectItem key={categorie} value={categorie}>
                              {categorie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Mode de paiement</Label>
                      <Input
                        placeholder="Virement, Espèces, Chèque..."
                        value={formState.modePaiement}
                        onChange={(event) => handleChange("modePaiement", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Référence</Label>
                      <Input
                        placeholder="Référence interne ou bancaire"
                        value={formState.reference}
                        onChange={(event) => handleChange("reference", event.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* LIENS AVEC PROJETS, FACTURES, SOUS-TRAITANTS */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Liens avec le projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Recherche Projet */}
                    <SearchSelect<any>
                      label="Projet"
                      placeholder="Rechercher par nom..."
                      data={projets || []}
                      loading={loadingProjets}
                      error={errorProjets}
                      value={formState.projetId}
                      onValueChange={(value) => handleChange("projetId", value)}
                      displayField={(projet) => `${projet.numero || projet.codeProjet || ''} - ${projet.nom || projet.nomProjet || ''}`}
                      secondaryField={(projet) => `Client: ${projet.client || projet.nomClient || ''}`}
                      getKey={(projet) => (projet.id || projet.projetId || '').toString()}
                    />

                    {/* Recherche Étape Projet */}
                    <SearchSelect<any>
                      label="Étape du projet"
                      placeholder={formState.projetId ? "Rechercher par nom..." : "Sélectionner d'abord un projet"}
                      data={etapes || []}
                      loading={loadingEtapes}
                      error={errorEtapes}
                      value={formState.etapeProjetId}
                      onValueChange={(value) => handleChange("etapeProjetId", value)}
                      displayField={(etape) => etape.nom || etape.nomEtape || etape.designation || ''}
                      secondaryField={(etape) => etape.statut ? `Statut: ${etape.statut}` : 'undefined'}
                      getKey={(etape) => (etape.id || etape.etapeProjetId || '').toString()}
                      disabled={!formState.projetId}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Recherche Facture (seulement pour les entrées) */}
                    {isEntree && (
                      <SearchSelect<Facture>
                        label="Facture (Entrée)"
                        placeholder="Rechercher par numéro..."
                        data={factures || []}
                        loading={loadingFactures}
                        error={errorFactures}
                        value={formState.factureId}
                        onValueChange={(value) => handleChange("factureId", value)}
                        displayField={(facture) => `${facture.numeroFacture} - ${facture.client}`}
                        secondaryField={(facture) => `Montant: ${facture.montantTotal?.toLocaleString() || 0} XOF`}
                        getKey={(facture) => facture.id.toString()}
                      />
                    )}

                    {/* Recherche Sous-traitant (seulement pour les sorties) */}
                    {isSortie && (
                      <SearchSelect<any>
                        label="Sous-traitant (Sortie)"
                        placeholder="Rechercher par nom..."
                        data={sousTraitantList || []}
                        loading={loadingSousTraitants}
                        error={errorSousTraitants}
                        value={formState.sousTraitantId}
                        onValueChange={(value) => handleChange("sousTraitantId", value)}
                        displayField={(st) => `${st.codeContractant || st.code || ''} - ${st.nom || ''}`}
                        secondaryField={(st) => `Spécialité: ${st.specialite || st.specialiteNom || 'Non spécifié'}`}
                        getKey={(st) => (st.id || st.sousTraitantId || '').toString()}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* DESCRIPTION */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Libellé</Label>
                    <Input
                      placeholder="Ex: Paiement client rénovation"
                      value={formState.libelle}
                      onChange={(event) => handleChange("libelle", event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      placeholder="Ajouter des détails concernant le mouvement..."
                      value={formState.description}
                      onChange={(event) => handleChange("description", event.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Réinitialiser
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loadingMouvementActions || loadingComptes || comptes.length === 0}
            >
              {loadingMouvementActions && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}