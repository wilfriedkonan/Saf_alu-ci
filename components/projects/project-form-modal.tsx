"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CalendarIcon,
  Plus,
  Trash2,
  Loader2,
  ChevronsUpDown,
  Check,
  UserPlus,
  RotateCcw,
  X,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  type Project,
  type ProjectStatus,
  type CreateProjetRequest,
  type CreateEtapeProjetRequest,
  type StageStatus,
  projectStatusLabels,
} from "@/types/projet"
import { useProjetActions, useTypesProjets } from "@/hooks/useProjet"
import { toast } from "../ui/use-toast"
import { Badge } from "../ui/badge"
import { useClientActions, useClientsList } from "@/hooks/useClients"
import { Client } from "@/types/clients"
import { ClientFormModal } from "../clients/client-form-modal"
import { SubcontractorFormModal } from "../subcontractors/subcontractor-form-modal"
import { useSousTraitantList } from "@/hooks/useSoustraitant"
import { SousTraitant } from "@/types/sous-traitants"
import { SousTraitantService } from "@/services/sous-traitantService"
import { useUtilisateurList } from "@/hooks/use-utilisateur"

// ============================================================
// Types
// ============================================================

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projet?: Project | null
  onSuccess?: () => void
}

/** Un sous-traitant sélectionné sur une étape (formulaire local) */
interface SousTraitantEtapeItem {
  id?: number
  nom?: string
  sousTraitantIds?: number[] | undefined
  etapeProjetId?: number
  role?: string
}

interface ProjectStageForm {
  id?: number
  nom: string
  description: string
  dateDebut: Date | undefined
  dateFinPrevue: Date | undefined
  budgetPrevu: string
  coutReel: string
  ordre: number
  statut: StageStatus
  estActif: boolean
  /** 🆕 Liste des sous-traitants affectés (remplace idSoustraitant/soustraitantNom) */
  sousTraitants: SousTraitantEtapeItem[] | undefined
}

// ============================================================
// Valeurs initiales
// ============================================================

const emptyStage = (): ProjectStageForm => ({
  nom: "",
  description: "",
  dateDebut: undefined,
  dateFinPrevue: undefined,
  budgetPrevu: "",
  coutReel: "",
  ordre: 1,
  estActif: true,
  statut: "NonCommence",
  sousTraitants: [],
})

const getSousTraitantItemId = (item: any) => item?.sousTraitantId ?? item?.id

const getSousTraitantItemNom = (item: any) =>
  item?.nom ?? item?.sousTraitant?.nom ?? "Sous-traitant"

// ============================================================
// Composant principal
// ============================================================

export function ProjectFormModal({ open, onOpenChange, projet, onSuccess }: ProjectFormModalProps) {
  const { createProjet, updateProjet, loading } = useProjetActions()
  const { types, loading: loadingTypes } = useTypesProjets()

  const isEditMode = !!projet

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)

  // ---- État formulaire projet ----
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    clientId: 0,
    clientName: "",
    budgetInitial: "",
    budgetRevise: "",
    statut: "Planification" as ProjectStatus,
    dateDebut: undefined as Date | undefined,
    dateFinPrevue: undefined as Date | undefined,
    adresseChantier: "",
    codePostalChantier: "",
    villeChantier: "",
    chefProjetId: 0,
  })

  // ---- État étapes ----
  const [stages, setStages] = useState<ProjectStageForm[]>([emptyStage()])

  // ---- UI state ----
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  /** Popover d'ajout de sous-traitant ouvert par étape (index → open) */
  const [stAddSTOpen, setStAddSTOpen] = useState<Record<number, boolean>>({})
  /** Recherche locale dans le popover par étape */
  const [stSearchQuery, setStSearchQuery] = useState<Record<number, string>>({})
  const [isExecutantModalOpen, setExecutantModalOpen] = useState(false)
  const [currentStageIndexForExecutant, setCurrentStageIndexForExecutant] = useState<number | null>(null)

  // ---- Données ----
  const { clients, loading: clientLoading, refreshCliens } = useClientsList()
  const { sousTraitantList, loading: soustraitantLoading, refreshSoutraitant } = useSousTraitantList()
  const { Utilisateur, loading: utlisateurLoading } = useUtilisateurList()
  const { createClient } = useClientActions()

  // ============================================================
  // Chargement en mode édition
  // ============================================================
  useEffect(() => {
    if (isEditMode && projet) {
      setFormData({
        nom: projet.nom,
        description: projet.description || "",
        clientId: projet.clientId,
        clientName: projet.client?.nom || "",
        budgetInitial: projet.budgetInitial.toString(),
        budgetRevise: projet.budgetRevise.toString(),
        statut: projet.statut,
        dateDebut: projet.dateDebut ? new Date(projet.dateDebut) : undefined,
        dateFinPrevue: projet.dateFinPrevue ? new Date(projet.dateFinPrevue) : undefined,
        adresseChantier: projet.adresseChantier || "",
        codePostalChantier: projet.codePostalChantier || "",
        villeChantier: projet.villeChantier || "",
        chefProjetId: projet.chefProjetId || 0,
      })

      if (projet.etapes && projet.etapes.length > 0) {
        setStages(
          projet.etapes.map((etape: any) => {
            // 🆕 Charger la liste multi-ST depuis le backend
            let stList: SousTraitantEtapeItem[] = []

            if (etape.sousTraitants && etape.sousTraitants.length > 0) {
              // Nouvelle API : tableau de sous-traitants
              stList = etape.sousTraitants
                .map((st: any) => {
                  const sousTraitantId = st.sousTraitantId ?? st.sousTraitant?.id ?? st.id
                  if (!sousTraitantId) return null
                  return {
                    id: sousTraitantId,
                    sousTraitantId,
                    nom: getSousTraitantItemNom(st),
                    role: st.role ?? undefined,
                    etapeProjetId: st.etapeProjetId ?? etape.id,
                  }
                })
                .filter((st: SousTraitantEtapeItem | null): st is SousTraitantEtapeItem => Boolean(st))
            } else if (etape.idSousTraitant || etape.sousTraitant?.id) {
              // Rétrocompatibilité : ancien champ unique
              stList = [
                {
                  id: etape.idSousTraitant ?? etape.sousTraitant!.id,
                  sousTraitantIds: [etape.idSousTraitant ?? etape.sousTraitant!.id],
                  nom: getSousTraitantItemNom(etape.sousTraitant),
                },
              ]
            }

            return {
              id: etape.id,
              nom: etape.nom,
              description: etape.description || "",
              dateDebut: etape.dateDebut ? new Date(etape.dateDebut) : undefined,
              dateFinPrevue: etape.dateFinPrevue ? new Date(etape.dateFinPrevue) : undefined,
              budgetPrevu: etape.budgetPrevu.toString(),
              coutReel: etape.coutReel?.toString() || "0",
              ordre: etape.ordre,
              statut: etape.statut || "NonCommence",
              estActif: etape.estActif !== undefined ? etape.estActif : true,
              sousTraitants: stList,
            }
          })
        )
      } else {
        setStages([emptyStage()])
      }
    } else {
      resetForm()
    }
  }, [isEditMode, projet, open])

  // ============================================================
  // Gestion des étapes
  // ============================================================

  const removeStage = (index: number) => {
    const stage = stages[index]
    if (stage.id) {
      setStages(stages.map((s, i) => (i === index ? { ...s, estActif: false } : s)))
      toast({ title: "Étape marquée pour suppression", description: "Elle sera retirée à l'enregistrement." })
    } else {
      setStages(stages.filter((_, i) => i !== index))
      toast({ title: "Étape retirée" })
    }
  }

  const restoreStage = (index: number) => {
    setStages(stages.map((s, i) => (i === index ? { ...s, estActif: true } : s)))
    toast({ title: "Étape restaurée" })
  }

  const addStage = () => {
    setStages([...stages, { ...emptyStage(), ordre: stages.length + 1 }])
  }

  const updateStage = (index: number, field: keyof ProjectStageForm, value: any) => {
    setStages(stages.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      clientId: 0,
      clientName: "",
      budgetInitial: "",
      budgetRevise: "",
      statut: "Planification",
      dateDebut: undefined,
      dateFinPrevue: undefined,
      adresseChantier: "",
      codePostalChantier: "",
      villeChantier: "",
      chefProjetId: 0,
    })
    setStages([emptyStage()])
    setStAddSTOpen({})
    setStSearchQuery({})
  }

  // ============================================================
  // 🆕 Gestion des sous-traitants par étape (multi-sélection)
  // ============================================================

  /** Ajoute un sous-traitant à une étape (si pas déjà présent) */
  const addSousTraitantToStage = (stageIndex: number, soustraitant: SousTraitant) => {
    setStages((prev) =>
      prev.map((s, i) => {
        if (i !== stageIndex) return s
        const alreadyIn = s.sousTraitants?.some((st) => getSousTraitantItemId(st) === soustraitant.id)
        if (alreadyIn) return s
        return {
          ...s,
          sousTraitants: [
            ...(s.sousTraitants || []),
            { id: soustraitant.id, sousTraitantId: soustraitant.id, nom: soustraitant.nom },
          ],
        }
      })
    )
    // Fermer le popover et réinitialiser la recherche
    setStAddSTOpen((prev) => ({ ...prev, [stageIndex]: false }))
    setStSearchQuery((prev) => ({ ...prev, [stageIndex]: "" }))
  }

  /** Retire un sous-traitant d'une étape par son ID */
  const removeSousTraitantFromStage = (stageIndex: number, sousTraitantId: number) => {
    setStages((prev) =>
      prev.map((s, i) =>
        i !== stageIndex
          ? s
          : {
              ...s,
              sousTraitants: s.sousTraitants?.filter((st) => getSousTraitantItemId(st) !== sousTraitantId),
            }
      )
    )
  }

  /** Sous-traitants disponibles (non encore ajoutés à l'étape) */
  const getAvailableSousTraitants = (stageIndex: number, query: string) => {
    const stage = stages[stageIndex]
    const selectedIds = new Set((stage.sousTraitants || []).map((st) => getSousTraitantItemId(st)))
    const q = query.toLowerCase()
    return sousTraitantList.filter(
      (st) =>
        !selectedIds.has(st.id) &&
        (st.nom.toLowerCase().includes(q) ||
          (st.email ?? "").toLowerCase().includes(q) ||
          (st.telephone ?? "").toLowerCase().includes(q))
    )
  }

  // ============================================================
  // Client
  // ============================================================

  const getSelectedClient = () =>
    formData.clientId > 0 ? clients.find((c) => c.id === formData.clientId) : null

  const handleClientSelect = (client: Client) => {
    setFormData({ ...formData, clientId: client.id, clientName: client.nom })
    setClientSearchOpen(false)
  }

  // ============================================================
  // Callbacks modaux
  // ============================================================

  const handleNewClient = async (newClient: any) => {
    const response = await createClient(newClient)
    toast({ title: "Client créé", description: response.message || "Client créé avec succès" })
    refreshCliens()
    handleClientSelect(response.data as Client)
    setIsClientModalOpen(false)
  }

  const handleNewExecutant = async (newSoustraitant: any) => {
    try {
      const response = await SousTraitantService.createSoustraitants(newSoustraitant)
      if (response.success && response.data) {
        toast({ title: "Sous-traitant créé", description: response.message || "Créé avec succès" })
        refreshSoutraitant()
        // 🆕 Ajouter directement à l'étape courante
        if (currentStageIndexForExecutant !== null && response.data) {
          addSousTraitantToStage(currentStageIndexForExecutant, response.data)
        }
        setExecutantModalOpen(false)
        setCurrentStageIndexForExecutant(null)
      } else {
        toast({
          title: "Erreur",
          description: response.error || response.message || "Erreur lors de la création",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Erreur lors de la création", variant: "destructive" })
    }
  }

  // ============================================================
  // Soumission
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom.trim()) {
      toast({ title: "Erreur de validation", description: "Le nom du projet est requis", variant: "destructive" })
      return
    }
    if (formData.clientId === 0) {
      toast({ title: "Erreur de validation", description: "Veuillez sélectionner un client", variant: "destructive" })
      return
    }
    if (!formData.budgetInitial || parseFloat(formData.budgetInitial) <= 0) {
      toast({ title: "Erreur de validation", description: "Le budget initial doit être > 0", variant: "destructive" })
      return
    }

    if (isEditMode) {
      const activeStages = stages.filter((s) => s.estActif)
      if (activeStages.length === 0) {
        toast({ title: "Erreur de validation", description: "Au moins une étape active est requise", variant: "destructive" })
        return
      }
      const invalidStages = activeStages.filter((s) => !s.nom.trim() || !s.budgetPrevu || parseFloat(s.budgetPrevu) <= 0)
      if (invalidStages.length > 0) {
        toast({ title: "Erreur de validation", description: "Toutes les étapes actives doivent avoir un nom et un budget valide", variant: "destructive" })
        return
      }
    }

    const projetData: CreateProjetRequest = {
      nom: formData.nom,
      description: formData.description || undefined,
      clientId: formData.clientId,
      typeProjetId: 0,
      budgetInitial: parseFloat(formData.budgetInitial),
      dateDebut: formData.dateDebut?.toISOString(),
      dateFinPrevue: formData.dateFinPrevue?.toISOString(),
      adresseChantier: formData.adresseChantier || undefined,
      codePostalChantier: formData.codePostalChantier || undefined,
      villeChantier: formData.villeChantier || undefined,
      chefProjetId: formData.chefProjetId,
      statut: formData.statut || undefined,
      etapes: isEditMode
        ? stages.map((stage) => ({
            id: stage.id,
            nom: stage.nom,
            description: stage.description || undefined,
            dateDebut: stage.dateDebut?.toISOString(),
            dateFinPrevue: stage.dateFinPrevue?.toISOString(),
            budgetPrevu: parseFloat(stage.budgetPrevu),
            coutReel: parseFloat(stage.coutReel || "0"),
            statut: stage.statut,
            estActif: stage.estActif,
            // 🆕 Envoyer la liste des IDs sous-traitants
            sousTraitantIds:
              stage.sousTraitants && stage.sousTraitants.length > 0
                ? stage.sousTraitants
                    .map((st) => getSousTraitantItemId(st))
                    .filter((id): id is number => typeof id === "number")
                : undefined,
            // Rétrocompatibilité : premier ST comme principal
            idSousTraitant:
              stage.sousTraitants && stage.sousTraitants.length > 0
                ? getSousTraitantItemId(stage.sousTraitants[0])
                : undefined,
          }))
        : undefined,
    }

    try {
      if (isEditMode && projet) {
        await updateProjet(projet.id, projetData)
        toast({ title: "Projet modifié", description: "Le projet a été modifié avec succès" })
      } else {
        await createProjet(projetData)
        toast({ title: "Projet créé", description: "Le projet a été créé avec succès" })
      }
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue", variant: "destructive" })
    }
  }

  const activeStagesCount = stages.filter((s) => s.estActif).length

  // ============================================================
  // Rendu
  // ============================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Modifier le projet" : "Nouveau projet"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Informations générales ── */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du projet *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Construction immeuble R+3"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <div className="flex gap-2">
                      <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientSearchOpen}
                            className="flex-1 justify-between bg-transparent"
                          >
                            {formData.clientName || "Rechercher un client..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Rechercher un client..."
                              className="h-8 border-0 shadow-none focus-visible:ring-0"
                              onChange={(e) => {
                                /* filtre géré inline */
                              }}
                            />
                          </div>
                          <ScrollArea className="max-h-60">
                            {clients.length === 0 ? (
                              <p className="p-3 text-sm text-muted-foreground text-center">Aucun client trouvé.</p>
                            ) : (
                              clients.map((client) => (
                                <button
                                  key={client.id}
                                  type="button"
                                  onClick={() => handleClientSelect(client)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                                >
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      getSelectedClient()?.id === client.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <p className="font-medium">{client.nom}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {client.email} • {client.telephone}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsClientModalOpen(true)}
                        disabled={loading}
                        title="Ajouter un nouveau client"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetInitial">Budget initial (FCFA) *</Label>
                    <Input
                      id="budgetInitial"
                      type="number"
                      value={formData.budgetInitial}
                      onChange={(e) => setFormData({ ...formData, budgetInitial: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="1000"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value: ProjectStatus) => setFormData({ ...formData, statut: value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(projectStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={loading}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateDebut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateDebut ? format(formData.dateDebut, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dateDebut}
                          onSelect={(date) => setFormData({ ...formData, dateDebut: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Date de fin prévue</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={loading}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateFinPrevue && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateFinPrevue
                            ? format(formData.dateFinPrevue, "PPP", { locale: fr })
                            : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dateFinPrevue}
                          onSelect={(date) => setFormData({ ...formData, dateFinPrevue: date })}
                          initialFocus
                          disabled={(date) => (formData.dateDebut ? date < formData.dateDebut : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description détaillée du projet..."
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adresseChantier">Adresse du chantier</Label>
                    <Input
                      id="adresseChantier"
                      value={formData.adresseChantier}
                      onChange={(e) => setFormData({ ...formData, adresseChantier: e.target.value })}
                      placeholder="Ex: 123 Rue de la Paix"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codePostalChantier">Code postal</Label>
                    <Input
                      id="codePostalChantier"
                      value={formData.codePostalChantier}
                      onChange={(e) => setFormData({ ...formData, codePostalChantier: e.target.value })}
                      placeholder="Ex: 00225"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="villeChantier">Ville</Label>
                    <Input
                      id="villeChantier"
                      value={formData.villeChantier}
                      onChange={(e) => setFormData({ ...formData, villeChantier: e.target.value })}
                      placeholder="Ex: Abidjan"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chefProjetId">Chef de projet</Label>
                    <Select
                      value={formData.chefProjetId.toString()}
                      onValueChange={(value) => setFormData({ ...formData, chefProjetId: Number(value) })}
                      disabled={utlisateurLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un chef de projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {Utilisateur.map((chef) => (
                          <SelectItem key={chef.id} value={String(chef.id)}>
                            {chef.prenom} {chef.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Message informatif (mode création) ── */}
            {!isEditMode && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Gestion des étapes</h4>
                      <p className="text-sm text-blue-700">
                        Après la création du projet, vous pourrez ajouter et gérer les étapes du projet
                        (planning, budgets, sous-traitants, etc.) depuis la page de modification.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Étapes du projet (mode édition) ── */}
            {isEditMode && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Étapes du projet *</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addStage} disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une étape
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {(() => {
                    let activeIndex = 0
                    return stages.map((stage, index) => {
                      const isInactive = !stage.estActif
                      const currentActiveIndex = activeIndex
                      if (!isInactive) activeIndex++

                      const query = stSearchQuery[index] ?? ""
                      const availableST = getAvailableSousTraitants(index, query)

                      return (
                        <div
                          key={index}
                          className={cn(
                            "space-y-4 p-4 border rounded-lg",
                            isInactive && "opacity-50 bg-red-50 border-red-200"
                          )}
                        >
                          {/* En-tête de l'étape */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {isInactive ? "Étape supprimée" : `Étape ${currentActiveIndex + 1}`}
                              </h4>
                              {isInactive ? (
                                <Badge variant="destructive" className="text-xs">
                                  Supprimée
                                </Badge>
                              ) : (
                                <>
                                  {isEditMode && stage.id && (
                                    <Badge variant="secondary" className="text-xs">
                                      Existante
                                    </Badge>
                                  )}
                                  {isEditMode && !stage.id && (
                                    <Badge variant="outline" className="text-xs">
                                      Nouvelle
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                            {isInactive ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreStage(index)}
                                disabled={loading}
                                title="Restaurer l'étape"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                              activeStagesCount > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeStage(index)}
                                  disabled={loading}
                                  title="Supprimer l'étape"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )
                            )}
                          </div>

                          {/* Champs de l'étape */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Nom */}
                            <div className="space-y-2">
                              <Label>Nom de l'étape</Label>
                              <Input
                                value={stage.nom}
                                onChange={(e) => updateStage(index, "nom", e.target.value)}
                                placeholder="Ex: Terrassement"
                                disabled={loading || isInactive}
                              />
                            </div>

                            {/* Budget prévu */}
                            <div className="space-y-2">
                              <Label>Budget prévu (FCFA)</Label>
                              <Input
                                type="number"
                                value={stage.budgetPrevu}
                                onChange={(e) => updateStage(index, "budgetPrevu", e.target.value)}
                                placeholder="0"
                                min="0"
                                step="1000"
                                disabled={loading || isInactive}
                              />
                            </div>

                            {/* Coût réel */}
                            <div className="space-y-2">
                              <Label>Coût réel (FCFA)</Label>
                              <Input
                                type="number"
                                value={stage.coutReel}
                                onChange={(e) => updateStage(index, "coutReel", e.target.value)}
                                placeholder="0"
                                min="0"
                                step="1000"
                                disabled={loading || isInactive}
                              />
                              {!isInactive && stage.budgetPrevu && stage.coutReel && parseFloat(stage.budgetPrevu) > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Marge:{" "}
                                  {formatCurrency(parseFloat(stage.budgetPrevu) - parseFloat(stage.coutReel || "0"))}
                                  {parseFloat(stage.coutReel || "0") > parseFloat(stage.budgetPrevu) && (
                                    <span className="text-red-600 ml-1">(Dépassement)</span>
                                  )}
                                </p>
                              )}
                            </div>

                            {/* Date de début */}
                            <div className="space-y-2">
                              <Label>Date de début</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading || isInactive}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !stage.dateDebut && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {stage.dateDebut ? format(stage.dateDebut, "PPP", { locale: fr }) : "Sélectionner"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={stage.dateDebut}
                                    onSelect={(date) => updateStage(index, "dateDebut", date)}
                                    initialFocus
                                    disabled={isInactive}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Date de fin prévue */}
                            <div className="space-y-2">
                              <Label>Date de fin prévue</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading || isInactive}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !stage.dateFinPrevue && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {stage.dateFinPrevue
                                      ? format(stage.dateFinPrevue, "PPP", { locale: fr })
                                      : "Sélectionner"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={stage.dateFinPrevue}
                                    onSelect={(date) => updateStage(index, "dateFinPrevue", date)}
                                    initialFocus
                                    disabled={(date) =>
                                      isInactive || (stage.dateDebut ? date < stage.dateDebut : false)
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* ── 🆕 SOUS-TRAITANTS MULTIPLES ── */}
                            <div className="space-y-2 lg:col-span-1">
                              <Label className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                Sous-traitants
                                {stage.sousTraitants && stage.sousTraitants.length > 0 && (
                                  <Badge variant="secondary" className="text-xs ml-1">
                                    {stage.sousTraitants.length}
                                  </Badge>
                                )}
                              </Label>

                              {/* Badges des ST déjà sélectionnés */}
                              {stage.sousTraitants && stage.sousTraitants.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 rounded-md border">
                                  {stage.sousTraitants.map((st) => (
                                    <Badge
                                      key={`${getSousTraitantItemId(st)}-${st.nom}`}
                                      variant="secondary"
                                      className="flex items-center gap-1 pr-1 text-xs"
                                    >
                                      <span className="truncate max-w-[120px]">{getSousTraitantItemNom(st)}</span>
                                      {!isInactive && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeSousTraitantFromStage(index, getSousTraitantItemId(st) || 0)
                                          }
                                          disabled={loading || !getSousTraitantItemId(st)}
                                          className="ml-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 transition-colors"
                                          title={`Retirer ${getSousTraitantItemNom(st)}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Boutons d'action (ajouter / nouveau) */}
                              {!isInactive && (
                                <div className="flex gap-2">
                                  {/* Popover de sélection */}
                                  <Popover
                                    open={stAddSTOpen[index] ?? false}
                                    onOpenChange={(open) =>
                                      setStAddSTOpen((prev) => ({ ...prev, [index]: open }))
                                    }
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={loading || soustraitantLoading}
                                        className="flex-1 justify-start text-muted-foreground"
                                      >
                                        <Plus className="mr-2 h-3.5 w-3.5" />
                                        {soustraitantLoading
                                          ? "Chargement..."
                                          : "Ajouter un sous-traitant"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] p-0" align="start">
                                      {/* Champ de recherche */}
                                      <div className="p-2 border-b">
                                        <Input
                                          placeholder="Rechercher..."
                                          className="h-8 border-0 shadow-none focus-visible:ring-0 text-sm"
                                          value={query}
                                          onChange={(e) =>
                                            setStSearchQuery((prev) => ({
                                              ...prev,
                                              [index]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>

                                      {/* Liste des ST disponibles */}
                                      <ScrollArea className="max-h-52">
                                        {availableST.length === 0 ? (
                                          <p className="p-3 text-sm text-muted-foreground text-center">
                                            {sousTraitantList.length === 0
                                              ? "Aucun sous-traitant enregistré."
                                              : "Tous les sous-traitants sont déjà ajoutés."}
                                          </p>
                                        ) : (
                                          availableST.map((st) => (
                                            <button
                                              key={st.id}
                                              type="button"
                                              onClick={() => addSousTraitantToStage(index, st)}
                                              className="w-full flex items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{st.nom}</p>
                                                {(st.email || st.telephone) && (
                                                  <p className="text-xs text-muted-foreground truncate">
                                                    {[st.email, st.telephone].filter(Boolean).join(" • ")}
                                                  </p>
                                                )}
                                              </div>
                                              {st.noteMoyenne > 0 && (
                                                <span className="text-xs text-amber-500 shrink-0">
                                                  ★ {st.noteMoyenne.toFixed(1)}
                                                </span>
                                              )}
                                            </button>
                                          ))
                                        )}
                                      </ScrollArea>
                                    </PopoverContent>
                                  </Popover>

                                  {/* Bouton créer un nouveau ST */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentStageIndexForExecutant(index)
                                      setExecutantModalOpen(true)
                                    }}
                                    disabled={loading}
                                    title="Créer un nouveau sous-traitant"
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description de l'étape */}
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={stage.description}
                              onChange={(e) => updateStage(index, "description", e.target.value)}
                              placeholder="Description de l'étape..."
                              rows={2}
                              disabled={loading || isInactive}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? isEditMode
                ? "Modification..."
                : "Création..."
              : isEditMode
              ? "Modifier le projet"
              : "Créer le projet"}
          </Button>
        </div>
      </DialogContent>

      {/* Modal création client */}
      <ClientFormModal open={isClientModalOpen} onOpenChange={setIsClientModalOpen} onSubmit={handleNewClient} />

      {/* Modal création sous-traitant */}
      <SubcontractorFormModal
        isOpen={isExecutantModalOpen}
        onClose={() => {
          setExecutantModalOpen(false)
          setCurrentStageIndexForExecutant(null)
        }}
        onSubmit={handleNewExecutant}
      />
    </Dialog>
  )
}