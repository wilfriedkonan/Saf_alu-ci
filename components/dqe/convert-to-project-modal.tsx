"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import {
  CalendarIcon,
  Info,
  Briefcase,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Search,
  Link2,
  PlusCircle
} from "lucide-react"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDqeConversion } from "@/hooks/useDqe"
import { Project } from "@/types/projet"
import { ProjetService } from "@/services/projetService"
import {
  formatCurrency,
  type DQE,
  type ConvertDQEToProjectRequest,
  formatDate
} from "@/types/dqe"
import { Building2, DollarSign, TrendingUp, FileText } from "lucide-react"
import useProjetForDqeLinking from "@/hooks/useProjet"

interface ConvertToProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dqe: DQE
  onConvert: (projectData: any) => void
}

// Mode de conversion
type ConversionMode = "nouveau" | "existant"

// Types de projets
const typesProjets = [
  { id: 1, nom: "Bâtiment" },
  { id: 2, nom: "Infrastructure" },
  { id: 3, nom: "VRD" },
  { id: 4, nom: "Rénovation" },
  { id: 5, nom: "Autre" },
]

// Chefs de projets mockés
const chefsProjets = [
  { id: 1, nom: "Kouassi Jean" },
  { id: 2, nom: "Marie Dubois" },
  { id: 3, nom: "Ahmed Koné" },
  { id: 4, nom: "Sophie Martin" },
  { id: 5, nom: "Ibrahim Traoré" },
]

export function ConvertToProjectModal({
  open,
  onOpenChange,
  dqe,
  onConvert
}: ConvertToProjectModalProps) {
  const router = useRouter()

  // Hooks
  const {
    loading: conversionLoading,
    preview,
    generatePreview,
    convertToProject,
    linkToExistingProject,
    resetPreview
  } = useDqeConversion()

  const {
    projets: projetsDisponibles,
    loading: projetsLoading,
    getAvailableProjects
  } = useProjetForDqeLinking()

  // Mode de conversion
  const [conversionMode, setConversionMode] = useState<ConversionMode>("nouveau")

  // Pour nouveau projet
  const [currentStep, setCurrentStep] = useState<"mode" | "info" | "config" | "preview">("mode")
  const [nomProjet, setNomProjet] = useState(dqe.nom)
  const [description, setDescription] = useState("")
  const [typeProjetId, setTypeProjetId] = useState<number>(1)
  const [dateDebut, setDateDebut] = useState<Date>()
  const [dureeTotaleJours, setDureeTotaleJours] = useState<string>("90")
  const [chefProjetId, setChefProjetId] = useState<number>()
  const [methodeCalculDurees, setMethodeCalculDurees] = useState<"proportionnel" | "egal" | "personnalise">("proportionnel")

  // Pour projet existant
  const [projetExistantId, setProjetExistantId] = useState<number>()
  const [projetExistant, setProjetExistant] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showProjectSearch, setShowProjectSearch] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Charger les projets disponibles
  useEffect(() => {
    if (open && conversionMode === "existant") {
      getAvailableProjects()
    }
  }, [open, conversionMode, getAvailableProjects])

  // Filtrer les projets selon la recherche
  const projetsFiltres = projetsDisponibles?.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Réinitialiser le formulaire
  useEffect(() => {
    if (open) {
      setConversionMode("nouveau")
      setNomProjet(dqe.nom)
      setDescription("")
      setTypeProjetId(1)
      setDateDebut(undefined)
      setDureeTotaleJours("90")
      setChefProjetId(undefined)
      setMethodeCalculDurees("proportionnel")
      setProjetExistantId(undefined)
      setSearchTerm("")
      setCurrentStep("mode")
      setErrors({})
      resetPreview()
    }
  }, [open, dqe.nom, resetPreview])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (conversionMode === "nouveau") {
      if (!nomProjet.trim()) {
        newErrors.nomProjet = "Le nom du projet est requis"
      }
      if (!typeProjetId) {
        newErrors.typeProjetId = "Le type de projet est requis"
      }
      if (!dateDebut) {
        newErrors.dateDebut = "La date de début est requise"
      }
      if (!dureeTotaleJours || parseInt(dureeTotaleJours) <= 0) {
        newErrors.dureeTotaleJours = "La durée doit être supérieure à 0"
      }
    } else {
      if (!projetExistantId) {
        newErrors.projetExistant = "Veuillez sélectionner un projet"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectMode = (mode: ConversionMode) => {
    setConversionMode(mode)
    setCurrentStep("info")
  }

  const handleNextToConfig = () => {
    if (validateForm()) {
      if (conversionMode === "existant") {
        setCurrentStep("preview")
      } else {
        setCurrentStep("config")
      }
    }
  }

  const handleGeneratePreview = async () => {
    if (!dateDebut) {
      toast.error("Veuillez sélectionner une date de début")
      return
    }

    const request: ConvertDQEToProjectRequest = {
      dqeId: dqe.id,
      nomProjet,
      descriptionProjet: description,
      typeProjetId,
      dateDebut: dateDebut.toISOString(),
      dureeTotaleJours: parseInt(dureeTotaleJours),
      chefProjetId,
      methodeCalculDurees,
    }

    const previewData = await generatePreview(dqe.id, request)

    if (previewData) {
      setCurrentStep("preview")
    }
  }

  const handleConvert = async () => {
    if (conversionMode === "nouveau") {
      // Créer un nouveau projet
      if (!dateDebut) {
        toast.error("Veuillez sélectionner une date de début")
        return
      }

      const request: ConvertDQEToProjectRequest = {
        dqeId: dqe.id,
        nomProjet,
        descriptionProjet: description,
        typeProjetId,
        dateDebut: format(dateDebut, "yyyy-MM-dd"),
        dureeTotaleJours: parseInt(dureeTotaleJours),
        chefProjetId,
        methodeCalculDurees,
      }

      const projetId = await convertToProject(dqe.id, request)

      if (projetId) {
        toast.success("Projet créé avec succès !")
        onConvert({ projetId })
        onOpenChange(false)
        router.push(`/projets/${projetId}`)
      }
    } else {
      // Lier à un projet existant
      if (!projetExistantId) {
        toast.error("Veuillez sélectionner un projet")
        return
      }

      const success = await linkToExistingProject(dqe.id, projetExistantId)

      if (success) {
        toast.success("DQE lié au projet avec succès !")
        onConvert({ projetId: projetExistantId })
        onOpenChange(false)
        router.push(`/projets/${projetExistantId}`)
      }
    }
  }

  const projetSelectionne = projetsFiltres.find(p => p.id === projetExistantId)

  // Charger les détails complets du projet sélectionné
  useEffect(() => {
    const fetchProjetDetails = async () => {
      if (projetExistantId) {
        try {
          const projet = await ProjetService.getProjetById(projetExistantId)
          setProjetExistant(projet)
        } catch (error) {
          console.error("Erreur lors de la récupération du projet:", error)
          toast.error("Impossible de charger les détails du projet")
          setProjetExistant(null)
        }
      } else {
        setProjetExistant(null)
      }
    }
    
    fetchProjetDetails()
  }, [projetExistantId])

  const dateFin = dateDebut && dureeTotaleJours
    ? addDays(dateDebut, parseInt(dureeTotaleJours))
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] lg:max-w-[90vw] xl:max-w-[75vw] 2xl:max-w-[70vw] p-5">        <DialogHeader>
          <DialogTitle className="text-2xl">
            Convertir le DQE en Projet
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            DQE : {dqe.reference} - {dqe.nom}
          </p>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 my-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            currentStep === "mode" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              currentStep === "mode" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300"
            )}>
              1
            </span>
            Mode
          </div>

          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            currentStep === "info" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              currentStep === "info" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300"
            )}>
              2
            </span>
            Informations
          </div>

          {conversionMode === "nouveau" && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
              currentStep === "config" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            )}>
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2",
                currentStep === "config" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300"
              )}>
                3
              </span>
              Configuration
            </div>
          )}

          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            currentStep === "preview" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              currentStep === "preview" ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300"
            )}>
              {conversionMode === "nouveau" ? "4" : "3"}
            </span>
            Prévisualisation
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto py-4"  >
          {/* STEP 1: Choix du mode */}
          {currentStep === "mode" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Choisissez comment vous souhaitez utiliser ce DQE
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option: Nouveau projet */}
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    conversionMode === "nouveau" && "border-blue-500 border-2"
                  )}
                  onClick={() => handleSelectMode("nouveau")}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Nouveau projet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Créer un nouveau projet à partir du DQE
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Recommandé
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Option: Projet existant */}
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    conversionMode === "existant" && "border-green-500 border-2"
                  )}
                  onClick={() => handleSelectMode("existant")}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Link2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Projet existant</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Lier le DQE à un projet déjà en cours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-900 dark:text-amber-100">
                  <p className="font-semibold mb-2">Note importante</p>
                  <p className="text-sm">
                    {conversionMode === "nouveau"
                      ? "Un nouveau projet sera créé avec les données du DQE. Les lots deviendront des étapes de projet."
                      : "Les items du DQE seront ajoutés sous les items existants du projet sélectionné."}
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* STEP 2A: Info - Nouveau projet */}
          {currentStep === "info" && conversionMode === "nouveau" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Informations du projet
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nomProjet">
                      Nom du projet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nomProjet"
                      value={nomProjet}
                      onChange={(e) => setNomProjet(e.target.value)}
                      placeholder="Nom du projet"
                      className={errors.nomProjet ? "border-red-500" : ""}
                    />
                    {errors.nomProjet && (
                      <p className="text-sm text-red-500 mt-1">{errors.nomProjet}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description du projet..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Type de projet <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={typeProjetId?.toString()}
                        onValueChange={(value) => setTypeProjetId(parseInt(value))}
                      >
                        <SelectTrigger className={errors.typeProjetId ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typesProjets.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.typeProjetId && (
                        <p className="text-sm text-red-500 mt-1">{errors.typeProjetId}</p>
                      )}
                    </div>

                    <div>
                      <Label>Chef de projet</Label>
                      <Select
                        value={chefProjetId?.toString()}
                        onValueChange={(value) => setChefProjetId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un chef" />
                        </SelectTrigger>
                        <SelectContent>
                          {chefsProjets.map((chef) => (
                            <SelectItem key={chef.id} value={chef.id.toString()}>
                              {chef.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Date de début <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateDebut && "text-muted-foreground",
                              errors.dateDebut && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateDebut}
                            onSelect={setDateDebut}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.dateDebut && (
                        <p className="text-sm text-red-500 mt-1">{errors.dateDebut}</p>
                      )}
                    </div>

                    <div>
                      <Label>
                        Durée totale (jours) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={dureeTotaleJours}
                        onChange={(e) => setDureeTotaleJours(e.target.value)}
                        placeholder="90"
                        min="1"
                        className={errors.dureeTotaleJours ? "border-red-500" : ""}
                      />
                      {errors.dureeTotaleJours && (
                        <p className="text-sm text-red-500 mt-1">{errors.dureeTotaleJours}</p>
                      )}
                      {dateFin && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Date fin prévue: {format(dateFin, "PPP", { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2B: Info - Projet existant */}
          {currentStep === "info" && conversionMode === "existant" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Sélectionnez un projet non terminé pour y lier ce DQE. Les items du DQE seront ajoutés sous les items existants du projet.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Rechercher un projet
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projetsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <>
                      <Popover open={showProjectSearch} onOpenChange={setShowProjectSearch}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              errors.projetExistant && "border-red-500"
                            )}
                          >
                            {projetSelectionne ? (
                              <span className="flex items-center gap-2">
                                <Badge variant="outline">{projetSelectionne.numero}</Badge>
                                {projetSelectionne.nom}
                              </span>
                            ) : (
                              "Rechercher un projet..."
                            )}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher par nom ou numéro..."
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            <CommandEmpty>Aucun projet trouvé.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {projetsFiltres.map((projet) => (
                                <CommandItem
                                  key={projet.id}
                                  value={projet.id.toString()}
                                  onSelect={() => {
                                    setProjetExistantId(projet.id)
                                    setShowProjectSearch(false)
                                  }}
                                >
                                  <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{projet.nom}</span>
                                      <Badge variant="outline">{projet.numero}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Client: {projet.client?.nom || 'Non spécifié'}</span>
                                      <span>Budget: {formatCurrency(projet.budgetInitial || 0)}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {projet.statut}
                                      </Badge>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {errors.projetExistant && (
                        <p className="text-sm text-red-500">{errors.projetExistant}</p>
                      )}

                      {projetSelectionne && (
                        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{projetSelectionne.nom}</h4>
                                <Badge>{projetSelectionne.numero}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Client</p>
                                  <p className="font-medium">{projetSelectionne.client?.nom || 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Budget </p>
                                  <p className="font-medium">{formatCurrency(projetSelectionne.budgetInitial || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Statut</p>
                                  <Badge variant="secondary">{projetSelectionne.statut}</Badge>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Avancement</p>
                                  <p className="font-medium">{projetSelectionne.pourcentageAvancement || 0}%</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {projetsFiltres.length === 0 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Aucun projet disponible. Tous les projets sont soit terminés, soit déjà liés à un DQE.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-900 dark:text-green-100">
                  <p className="font-semibold mb-2">Fonctionnement du lien</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Les lots du DQE deviendront des étapes du projet</li>
                    <li>Les items seront ajoutés sous les items existants</li>
                    <li>Le budget du projet sera mis à jour automatiquement</li>
                    <li>Le DQE sera marqué comme converti et lié au projet</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* STEP 3: Config (uniquement pour nouveau projet) */}
          {currentStep === "config" && conversionMode === "nouveau" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Méthode de calcul des durées</h3>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={methodeCalculDurees}
                    onValueChange={(value: any) => setMethodeCalculDurees(value)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 rounded-lg border">
                        <RadioGroupItem value="proportionnel" id="proportionnel" />
                        <div className="flex-1">
                          <Label htmlFor="proportionnel" className="font-medium cursor-pointer">
                            Proportionnel au budget
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            La durée de chaque étape est proportionnelle à son budget
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border">
                        <RadioGroupItem value="egal" id="egal" />
                        <div className="flex-1">
                          <Label htmlFor="egal" className="font-medium cursor-pointer">
                            Durée égale
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Toutes les étapes auront la même durée
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border">
                        <RadioGroupItem value="personnalise" id="personnalise" />
                        <div className="flex-1">
                          <Label htmlFor="personnalise" className="font-medium cursor-pointer">
                            Personnalisé
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Vous pourrez ajuster les durées après création
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">À propos du calcul des durées</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Chaque lot DQE deviendra une étape du projet</li>
                    <li>Les étapes seront créées dans l'ordre séquentiel</li>
                    <li>La durée minimale par étape est de 5 jours</li>
                    <li>Les dates seront ajustées automatiquement</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* STEP 4: Prévisualisation */}
          {currentStep === "preview" && (
            <div className="space-y-4">
              <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertDescription className="text-emerald-900 dark:text-emerald-100">
                  <p className="font-semibold">Prévisualisation de la conversion</p>
                  <p className="text-sm mt-1">
                    Vérifiez les informations avant de {conversionMode === "nouveau" ? "créer le projet" : "lier au projet"}.
                  </p>
                </AlertDescription>
              </Alert>

              {conversionMode === "nouveau" && preview && (
                <>
                  {/* Informations Projet */}
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Informations du projet</h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nom</p>
                          <p className="font-medium">{preview?.projetPrevu?.nom || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Numéro</p>
                          <p className="font-medium">{preview?.projetPrevu?.numeroProjet || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date début</p>
                          <p className="font-medium">{preview?.projetPrevu?.dateDebut
                            ? format(new Date(preview.projetPrevu.dateDebut), "PPP", { locale: fr })
                            : "Non défini"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date fin prévue</p>
                          <p className="font-medium">{preview?.projetPrevu?.dateFinPrevue
                            ? format(new Date(preview.projetPrevu.dateFinPrevue), "PPP", { locale: fr })
                            : "Non défini"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Budget initial</p>
                          <p className="font-medium text-lg text-primary">
                            {formatCurrency(preview?.projetPrevu?.budgetInitial || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nombre d'étapes</p>
                          <p className="font-medium">{preview?.projetPrevu?.nombreEtapes || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Étapes */}
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Étapes du projet</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {preview?.etapesPrevues?.map((stage, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">
                                  ÉTAPE {stage.ordre} - {stage.nom}
                                </p>
                                <p className="text-xs text-muted-foreground">{stage.code}</p>
                              </div>
                              <Badge>{stage.dureeJours} jours</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Début</p>
                                <p className="font-medium">{formatDate(stage.dateDebut)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Fin</p>
                                <p className="font-medium">{formatDate(stage.dateFinPrevue)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Budget</p>
                                <p className="font-medium">{formatCurrency(stage.budgetPrevu)}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Part du budget</span>
                                <span className="font-medium">{stage.pourcentageBudget.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${stage.pourcentageBudget}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {conversionMode === "existant" && projetExistant && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Link2 className="h-5 w-5" />
                      Liaison au projet existant
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Colonne gauche - Projet actuel */}
                      <Card className="bg-gray-50">
                        <CardHeader>
                          <h4 className="font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Projet actuel
                          </h4>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nom</p>
                            <p className="font-medium">{projetExistant.nom}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Numéro</p>
                            <p className="font-medium">{projetExistant.numero}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Budget actuel</p>
                            <p className="font-medium">{formatCurrency(projetExistant.budgetRevise || 0)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Étapes actuelles</p>
                            <p className="font-medium">{projetExistant.etapes?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avancement</p>
                            <p className="font-medium">{projetExistant.pourcentageAvancement}%</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Colonne droite - Budget DQE */}
                      <Card className="bg-blue-50">
                        <CardHeader>
                          <h4 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Budget DQE à ajouter
                          </h4>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Budget DQE</p>
                            <p className="font-medium text-blue-600">+{formatCurrency(dqe.totalRevenueHT)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Nouvelles étapes</p>
                            <p className="font-medium text-blue-600">+{dqe.lots?.length || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Résultat final */}
                    <Card className="border-2 border-emerald-200 bg-emerald-50">
                      <CardHeader>
                        <h4 className="font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          Résultat après liaison
                        </h4>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-muted-foreground">Budget total</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency((projetExistant.budgetRevise || 0) + dqe.totalRevenueHT)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nombre total d'étapes</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {(projetExistant.etapes?.length || 0) + (dqe.lots?.length || 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Les {dqe.lots?.length || 0} lots du DQE seront ajoutés comme nouvelles étapes sous les étapes existantes du projet.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-900 dark:text-amber-100">
                  <p className="font-semibold mb-2">IMPORTANT</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Le DQE sera marqué comme "converti"</li>
                    <li>Le DQE restera consultable en lecture seule</li>
                    <li>Les modifications se feront sur le projet</li>
                    <li>Le lien DQE ↔ Projet est permanent</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentStep === "mode" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
          )}

          {currentStep === "info" && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep("mode")}>
                Retour
              </Button>
              <Button onClick={handleNextToConfig}>
                {conversionMode === "existant" ? "Prévisualisation" : "Suivant : Configuration"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {currentStep === "config" && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep("info")}>
                Retour
              </Button>
              <Button
                onClick={handleGeneratePreview}
                disabled={conversionLoading}
              >
                {conversionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    Générer la prévisualisation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </>
          )}

          {currentStep === "preview" && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep(conversionMode === "existant" ? "info" : "config")}>
                Retour
              </Button>
              <Button
                onClick={handleConvert}
                disabled={conversionLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {conversionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {conversionMode === "nouveau" ? "Création en cours..." : "Liaison en cours..."}
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 mr-2" />
                    {conversionMode === "nouveau" ? "Créer le projet" : "Lier au projet"}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}