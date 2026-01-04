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
import { CalendarIcon, Plus, Trash2, Loader2, ChevronsUpDown, Check, UserPlus, RotateCcw, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  type Project,
  type ProjectStatus,
  type CreateProjetRequest,
  type CreateEtapeProjetRequest,
  type StageStatus,
  projectStatusLabels
} from "@/types/projet"
import { useProjetActions, useTypesProjets } from "@/hooks/useProjet"
import { toast } from "../ui/use-toast"
import { Badge } from "../ui/badge"
import { useClientActions, useClientsList } from "@/hooks/useClients"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { Client } from "@/types/clients"
import { ClientFormModal } from "../clients/client-form-modal"
import { SubcontractorFormModal } from "../subcontractors/subcontractor-form-modal"
import { useSousTraitantList } from "@/hooks/useSoustraitant"
import { SousTraitant } from "@/types/sous-traitants"
import { SousTraitantService } from "@/services/sous-traitantService"
import { useUtilisateurService } from "@/services/utilisatuerService"
import { useUtilisateurList } from "@/hooks/use-utilisateur"

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projet?: Project | null
  onSuccess?: () => void
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
  idSoustraitant: number
  soustraitantNom?: string // Pour afficher le nom du sous-traitant sélectionné
}

export function ProjectFormModal({ open, onOpenChange, projet, onSuccess }: ProjectFormModalProps) {
  const { createProjet, updateProjet, loading } = useProjetActions()
  const { types, loading: loadingTypes } = useTypesProjets()

  const isEditMode = !!projet

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

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

  const [stages, setStages] = useState<ProjectStageForm[]>([
    {
      nom: "",
      description: "",
      dateDebut: undefined,
      dateFinPrevue: undefined,
      budgetPrevu: "",
      coutReel: "",
      ordre: 1,
      estActif: true,
      idSoustraitant: 0,
      soustraitantNom: undefined,
      statut: "NonCommence",
    },
  ])

  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  // État pour gérer les popovers de sous-traitant par étape (index => open/closed)
  const [soustraitantSearchOpen, setSoustraitantSearchOpen] = useState<{ [key: number]: boolean }>({})
  const [isExecutantModalOpen, setExecutantModalOpen] = useState(false)
  const [currentStageIndexForExecutant, setCurrentStageIndexForExecutant] = useState<number | null>(null)

  const { clients, loading: clientLoading, error: clientError, refreshCliens } = useClientsList()
  const { sousTraitantList, loading: soustraitantLoading, error: soustraitantError, refreshSoutraitant } = useSousTraitantList();
  const { Utilisateur, loading: utlisateurLoading, error: utilsateurError } = useUtilisateurList()
  const { createClient } = useClientActions()

  const getSelectedClient = () => {
    if (formData.clientId > 0 && clients) {
      return clients.find(client => client.id === formData.clientId)
    }
    return null
  }
  const getSelectedExecut = () => {
    if (formData.clientId > 0 && clients) {
      return clients.find(client => client.id === formData.clientId)
    }
    return null
  }
  const [chefsProjets] = useState([
    { id: 1, nom: "Marie", prenom: "Dubois" },
    { id: 2, nom: "Jean", prenom: "Kouame" },
    { id: 3, nom: "Paul", prenom: "Traore" },
    { id: 4, nom: "Aya", prenom: "Diallo" },
  ])

  // ========================================
  // ✅ CORRECTION: Charger estActif depuis le backend
  // ========================================
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

      // ✅ CORRECTION: Charger estActif depuis l'étape backend
      if (projet.etapes && projet.etapes.length > 0) {
        setStages(
          projet.etapes.map((etape) => ({
            id: etape.id,
            nom: etape.nom,
            description: etape.description || "",
            dateDebut: etape.dateDebut ? new Date(etape.dateDebut) : undefined,
            dateFinPrevue: etape.dateFinPrevue ? new Date(etape.dateFinPrevue) : undefined,
            budgetPrevu: etape.budgetPrevu.toString(),
            coutReel: etape.coutReel?.toString() || "0",
            ordre: etape.ordre,
            statut: etape.statut || "NonCommence",
            // ✅ CORRECTION: Utiliser la valeur de estActif depuis le backend
            // Si la propriété n'existe pas, par défaut true
            estActif: etape.estActif !== undefined ? etape.estActif : true,
            idSoustraitant: etape.idSousTraitant || etape.sousTraitant?.id || 0,
            soustraitantNom: etape.sousTraitant?.nom || undefined,
          }))
        )
      } else {
        setStages([
          {
            nom: "",
            description: "",
            dateDebut: undefined,
            dateFinPrevue: undefined,
            budgetPrevu: "",
            coutReel: "",
            ordre: 1,
            estActif: true,
            idSoustraitant: 0,
            soustraitantNom: undefined,
            statut: "NonCommence",
          },
        ])
      }
    } else {
      resetForm()
    }
  }, [isEditMode, projet, open])

  // ========================================
  // FONCTIONS DE GESTION DES ÉTAPES
  // ========================================

  const removeStage = (index: number) => {
    const stage = stages[index]

    if (stage.id) {
      // Soft delete pour étapes existantes
      setStages(stages.map((s, i) =>
        i === index ? { ...s, estActif: false } : s
      ))

      toast({
        title: "Étape marquée pour suppression",
        description: "L'étape sera supprimée lors de l'enregistrement du projet.",
        variant: "default",
      })
    } else {
      // Suppression directe pour nouvelles étapes
      setStages(stages.filter((_, i) => i !== index))

      toast({
        title: "Étape retirée",
        description: "La nouvelle étape a été retirée.",
      })
    }
  }

  const restoreStage = (index: number) => {
    setStages(stages.map((stage, i) =>
      i === index ? { ...stage, estActif: true } : stage
    ))

    toast({
      title: "Étape restaurée",
      description: "L'étape a été restaurée avec succès.",
    })
  }

  const addStage = () => {
    const newStage: ProjectStageForm = {
      nom: "",
      description: "",
      dateDebut: undefined,
      dateFinPrevue: undefined,
      budgetPrevu: "",
      coutReel: "",
      ordre: stages.length + 1,
      estActif: true,
      idSoustraitant: 0,
      soustraitantNom: undefined,
      statut: "NonCommence",
    }
    setStages([...stages, newStage])
  }

  const updateStage = (index: number, field: keyof ProjectStageForm, value: any) => {
    setStages(stages.map((stage, i) =>
      i === index ? { ...stage, [field]: value } : stage
    ))
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
    setStages([
      {
        nom: "",
        description: "",
        dateDebut: undefined,
        dateFinPrevue: undefined,
        budgetPrevu: "",
        coutReel: "",
        ordre: 1,
        estActif: true,
        idSoustraitant: 0,
        soustraitantNom: undefined,
        statut: "NonCommence",
      },
    ])
  }

  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      clientId: client.id,
      clientName: client.nom,
    })
    setClientSearchOpen(false)
  }

  // Fonction pour sélectionner un sous-traitant pour une étape spécifique
  const handleSoustraitantSelect = (stageIndex: number, soustraitant: SousTraitant) => {
    setStages(stages.map((stage, i) =>
      i === stageIndex
        ? { ...stage, idSoustraitant: soustraitant.id, soustraitantNom: soustraitant.nom }
        : stage
    ))
    setSoustraitantSearchOpen({ ...soustraitantSearchOpen, [stageIndex]: false })
  }

  // Fonction pour obtenir le sous-traitant sélectionné pour une étape
  const getSelectedSoustraitant = (stageIndex: number) => {
    const stage = stages[stageIndex]
    if (stage && stage.idSoustraitant > 0 && sousTraitantList) {
      return sousTraitantList.find(st => st.id === stage.idSoustraitant)
    }
    return null
  }

  // Fonction pour retirer le sous-traitant d'une étape
  const removeSoustraitantFromStage = (stageIndex: number) => {
    setStages(stages.map((stage, i) =>
      i === stageIndex
        ? { ...stage, idSoustraitant: 0, soustraitantNom: undefined }
        : stage
    ))
  }

  const handleNewClient = async (newClient: any) => {
    const response = await createClient(newClient)
    toast({
      title: "Client créé",
      description: response.message || "Le Client a été créé avec succès",
    })
    refreshCliens()
    handleClientSelect(response.data as Client)
    setIsClientModalOpen(false)
  }
  const handleNewExecutant = async (newSoustraitant: any) => {
    try {
      const response = await SousTraitantService.createSoustraitants(newSoustraitant)
      if (response.success && response.data) {
        toast({
          title: "Sous-traitant créé",
          description: response.message || "Le sous-traitant a été créé avec succès",
        })
        refreshSoutraitant()
        // Si on a un index d'étape en cours, sélectionner le nouveau sous-traitant
        if (currentStageIndexForExecutant !== null && response.data) {
          handleSoustraitantSelect(currentStageIndexForExecutant, response.data)
        }
        setExecutantModalOpen(false)
        setCurrentStageIndexForExecutant(null)
      } else {
        toast({
          title: "Erreur",
          description: response.error || response.message || "Une erreur est survenue lors de la création du sous-traitant",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du sous-traitant",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    /*  console.log("========== HANDLE SUBMIT ==========")
     console.log("Début du processus de soumission")
     console.log("FormData initial :", formData) */

    // Validation
    if (!formData.nom.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du projet est requis",
        variant: "destructive",
      })
      return
    }

    if (formData.clientId === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      })
      return
    }

    if (!formData.budgetInitial || parseFloat(formData.budgetInitial) <= 0) {
      toast({
        title: "Erreur de validation",
        description: "Le budget initial doit être supérieur à 0",
        variant: "destructive",
      })
      return
    }
    if (isEditMode) {
      const activeStages = stages.filter(s => s.estActif)
      if (activeStages.length === 0) {
        toast({
          title: "Erreur de validation",
          description: "Au moins une étape active est requise",
          variant: "destructive",
        })
        return
      }

      const invalidStages = activeStages.filter(
        (s) => !s.nom.trim() || !s.budgetPrevu || parseFloat(s.budgetPrevu) <= 0
      )

      if (invalidStages.length > 0) {
        toast({
          title: "Erreur de validation",
          description: "Toutes les étapes actives doivent avoir un nom et un budget prévu valide",
          variant: "destructive",
        })
        return
      }
    }
    // ✅ DEBUG: Afficher l'état de estActif avant soumission
    /* console.log("Stages avant soumission:", stages.map(s => ({
      id: s.id,
      nom: s.nom,
      estActif: s.estActif,
      type: typeof s.estActif
    }))) */

    const projetData: CreateProjetRequest = {
      nom: formData.nom,
      description: formData.description || undefined,
      clientId: formData.clientId,
      typeProjetId: 0,
      budgetInitial: parseFloat(formData.budgetInitial),
      // ✅ CORRECTION: Convertir en ISO string pour .NET (ex: "2025-01-15T10:30:00.000Z")
      dateDebut: formData.dateDebut?.toISOString(),
      dateFinPrevue: formData.dateFinPrevue?.toISOString(),
      adresseChantier: formData.adresseChantier || undefined,
      codePostalChantier: formData.codePostalChantier || undefined,
      villeChantier: formData.villeChantier || undefined,
      chefProjetId: formData.chefProjetId,
      statut: formData.statut || undefined,
      etapes: isEditMode ? stages.map((stage) => ({
        id: stage.id,
        nom: stage.nom,
        description: stage.description || undefined,
        // ✅ CORRECTION: Convertir en ISO string pour .NET
        dateDebut: stage.dateDebut?.toISOString(),
        dateFinPrevue: stage.dateFinPrevue?.toISOString(),
        budgetPrevu: parseFloat(stage.budgetPrevu),
        coutReel: parseFloat(stage.coutReel || "0"),
        statut: stage.statut,
        estActif: stage.estActif,  // ✅ boolean (pas number)
        idSousTraitant: stage.idSoustraitant > 0 ? stage.idSoustraitant : undefined,
      })) : undefined,
    }

    // ✅ DEBUG: Afficher les données avant envoi
    console.log("Données envoyées:", {
      etapes: projetData.etapes?.map(e => ({
        id: e.id,
        nom: e.nom,
        estActif: e.estActif,
        type: typeof e.estActif
      }))
    })

    try {
      if (isEditMode && projet) {
        await updateProjet(projet.id, projetData)
        toast({
          title: "Projet modifié",
          description: "Le projet a été modifié avec succès",
        })
      } else {
        await createProjet(projetData)
        toast({
          title: "Projet créé",
          description: "Le projet a été créé avec succès",
        })
      }

      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const activeStagesCount = stages.filter(s => s.estActif).length

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
            {/* Informations générales */}
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
                          <Command>
                            <CommandInput placeholder="Rechercher un client..." />
                            <CommandList>
                              <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                              <CommandGroup>
                                {clients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={`${client.nom} ${client.telephone || ""} ${client.email}`}
                                    onSelect={() => handleClientSelect(client)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        getSelectedClient()?.id === client.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{client.nom}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {client.email} • {client.telephone}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
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
                          {formData.dateFinPrevue ? format(formData.dateFinPrevue, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dateFinPrevue}
                          onSelect={(date) => setFormData({ ...formData, dateFinPrevue: date })}
                          initialFocus
                          disabled={(date) => formData.dateDebut ? date < formData.dateDebut : false}
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

            {/* Message informatif en mode création */}
            {!isEditMode && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Gestion des étapes
                      </h4>
                      <p className="text-sm text-blue-700">
                        Après la création du projet, vous pourrez ajouter et gérer les étapes du projet
                        (planning, budgets, sous-traitants, etc.) depuis la page de modification.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Étapes du projet */}
            {isEditMode && ( <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Étapes du projet *</CardTitle>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStage}
                    disabled={loading}
                  >
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

                    return (
                      <div
                        key={index}
                        className={cn(
                          "space-y-4 p-4 border rounded-lg",
                          isInactive && "opacity-50 bg-red-50 border-red-200"
                        )}
                      >
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Nom de l'étape</Label>
                            <Input
                              value={stage.nom}
                              onChange={(e) => updateStage(index, "nom", e.target.value)}
                              placeholder="Ex: Terrassement"
                              disabled={loading || isInactive}
                            />
                          </div>
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
                                Marge: {formatCurrency(parseFloat(stage.budgetPrevu) - parseFloat(stage.coutReel || "0"))}
                                {parseFloat(stage.coutReel || "0") > parseFloat(stage.budgetPrevu) && (
                                  <span className="text-red-600 ml-1">(Dépassement)</span>
                                )}
                              </p>
                            )}
                          </div>
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
                                  {stage.dateFinPrevue ? format(stage.dateFinPrevue, "PPP", { locale: fr }) : "Sélectionner"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={stage.dateFinPrevue}
                                  onSelect={(date) => updateStage(index, "dateFinPrevue", date)}
                                  initialFocus
                                  disabled={(date) => isInactive || (stage.dateDebut ? date < stage.dateDebut : false)}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Sous-traitant (optionnel)</Label>
                            <div className="flex gap-2">
                              <Popover
                                open={soustraitantSearchOpen[index] || false}
                                onOpenChange={(open) => setSoustraitantSearchOpen({ ...soustraitantSearchOpen, [index]: open })}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={soustraitantSearchOpen[index] || false}
                                    className="flex-1 justify-between bg-transparent"
                                    disabled={loading || isInactive}
                                  >
                                    {stage.soustraitantNom || "Rechercher un sous-traitant..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Rechercher un sous-traitant..." />
                                    <CommandList>
                                      <CommandEmpty>Aucun sous-traitant trouvé.</CommandEmpty>
                                      <CommandGroup>
                                        {sousTraitantList.map((soustraitant) => {
                                          const selectedSoustraitant = getSelectedSoustraitant(index)
                                          return (
                                            <CommandItem
                                              key={soustraitant.id}
                                              value={`${soustraitant.nom} ${soustraitant.telephone || ""} ${soustraitant.email || ""}`}
                                              onSelect={() => handleSoustraitantSelect(index, soustraitant)}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  selectedSoustraitant?.id === soustraitant.id ? "opacity-100" : "opacity-0",
                                                )}
                                              />
                                              <div className="flex flex-col">
                                                <span className="font-medium">{soustraitant.nom}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {soustraitant.email || ""} • {soustraitant.telephone || ""}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          )
                                        })}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setCurrentStageIndexForExecutant(index)
                                  setExecutantModalOpen(true)
                                }}
                                disabled={loading || isInactive}
                                title="Ajouter un nouveau sous-traitant"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              {stage.idSoustraitant > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSoustraitantFromStage(index)}
                                  disabled={loading || isInactive}
                                  title="Retirer le sous-traitant"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? (isEditMode ? "Modification..." : "Création...") : (isEditMode ? "Modifier le projet" : "Créer le projet")}
          </Button>
        </div>
      </DialogContent>

      {/* Modal de création client */}
      <ClientFormModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        onSubmit={handleNewClient}
      />
      {/* Modal de création sous-traitant */}
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