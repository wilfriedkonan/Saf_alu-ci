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
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  CalendarIcon, 
  Info, 
  FileText, 
  Settings, 
  Briefcase, 
  AlertTriangle, 
  Loader2,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDqeConversion } from "@/hooks/useDqe"
import { useProjet } from "@/hooks/useProjet" // Assurez-vous que ce hook existe
import { 
  formatCurrency,
  type DQE,
  type ConvertDQEToProjectRequest, 
  formatDate
} from "@/types/dqe"

interface ConvertToProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dqe: DQE
  onConvert: (projectData: any) => void
}

// Types de projets
const typesProjets = [
  { id: 1, nom: "Bâtiment" },
  { id: 2, nom: "Infrastructure" },
  { id: 3, nom: "VRD" },
  { id: 4, nom: "Rénovation" },
  { id: 5, nom: "Autre" },
]

// Chefs de projets mockés - À remplacer par un appel API réel
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
  
  // Hooks personnalisés
  const { 
    loading: conversionLoading, 
    preview, 
    generatePreview, 
    convertToProject,
    resetPreview
  } = useDqeConversion()

  // État du formulaire
  const [currentStep, setCurrentStep] = useState<"info" | "config" | "preview">("info")
  const [nomProjet, setNomProjet] = useState(dqe.nom)
  const [description, setDescription] = useState("")
  const [typeProjetId, setTypeProjetId] = useState<number>(1)
  const [dateDebut, setDateDebut] = useState<Date>()
  const [dureeTotaleJours, setDureeTotaleJours] = useState<string>("90")
  const [chefProjetId, setChefProjetId] = useState<number>()
  const [methodeCalculDurees, setMethodeCalculDurees] = useState<"proportionnel" | "egal" | "personnalise">("proportionnel")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (open) {
      setNomProjet(dqe.nom)
      setDescription("")
      setTypeProjetId(1)
      setDateDebut(undefined)
      setDureeTotaleJours("90")
      setChefProjetId(undefined)
      setMethodeCalculDurees("proportionnel")
      setCurrentStep("info")
      setErrors({})
      resetPreview()
    }
  }, [open, dqe.nom, resetPreview])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextToConfig = () => {
    if (validateForm()) {
      setCurrentStep("config")
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
      dateDebut: format(dateDebut, "yyyy-MM-dd"),
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
    }
  }

  const dateFin = dateDebut && dureeTotaleJours 
    ? addDays(dateDebut, parseInt(dureeTotaleJours))
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
            currentStep === "info" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              currentStep === "info" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
            )}>
              1
            </span>
            <span className="font-medium">Informations</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            currentStep === "config" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              currentStep === "config" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
            )}>
              2
            </span>
            <span className="font-medium">Configuration</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            currentStep === "preview" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              currentStep === "preview" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
            )}>
              3
            </span>
            <span className="font-medium">Prévisualisation</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* STEP 1: Informations de base */}
          {currentStep === "info" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Complétez les informations de base du projet qui sera créé depuis ce DQE.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nomProjet">
                    Nom du projet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomProjet"
                    value={nomProjet}
                    onChange={(e) => setNomProjet(e.target.value)}
                    placeholder="Ex: Construction Centre Médical Abobo"
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
                    placeholder="Description détaillée du projet..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="typeProjet">
                    Type de projet <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={typeProjetId?.toString()}
                    onValueChange={(value) => setTypeProjetId(parseInt(value))}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="chefProjet">Chef de projet</Label>
                  <Select
                    value={chefProjetId?.toString()}
                    onValueChange={(value) => setChefProjetId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chef de projet" />
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
                            !dateDebut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : "Choisir une date"}
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
                    <Label htmlFor="duree">
                      Durée totale (jours) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="duree"
                      type="number"
                      value={dureeTotaleJours}
                      onChange={(e) => setDureeTotaleJours(e.target.value)}
                      min="1"
                    />
                    {errors.dureeTotaleJours && (
                      <p className="text-sm text-red-500 mt-1">{errors.dureeTotaleJours}</p>
                    )}
                  </div>
                </div>

                {dateFin && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Date de fin prévue : <strong>{format(dateFin, "PPP", { locale: fr })}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Récap DQE */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Résumé du DQE</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{dqe.client?.nom}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget HT</p>
                      <p className="font-medium">{formatCurrency(dqe.totalRevenueHT)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nombre de lots</p>
                      <p className="font-medium">{dqe.lots?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Référence</p>
                      <p className="font-medium">{dqe.reference}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2: Configuration */}
          {currentStep === "config" && (
            <div className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Choisissez la méthode de calcul des durées des étapes du projet.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Méthode de calcul des durées</Label>
                  <RadioGroup
                    value={methodeCalculDurees}
                    onValueChange={(value) => setMethodeCalculDurees(value as any)}
                    className="space-y-3 mt-2"
                  >
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="proportionnel" id="proportionnel" />
                      <div className="flex-1">
                        <Label htmlFor="proportionnel" className="font-semibold cursor-pointer">
                          Proportionnel au budget
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Les lots avec un budget plus élevé auront une durée plus longue (minimum 5 jours par étape)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="egal" id="egal" />
                      <div className="flex-1">
                        <Label htmlFor="egal" className="font-semibold cursor-pointer">
                          Durée égale
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Toutes les étapes auront la même durée
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg opacity-50">
                      <RadioGroupItem value="personnalise" id="personnalise" disabled />
                      <div className="flex-1">
                        <Label htmlFor="personnalise" className="font-semibold cursor-pointer">
                          Durée personnalisée
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Définir manuellement la durée de chaque étape (prochainement)
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

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
            </div>
          )}

          {/* STEP 3: Prévisualisation */}
          {currentStep === "preview" && preview && (
            <div className="space-y-4">
              <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertDescription className="text-emerald-900 dark:text-emerald-100">
                  <p className="font-semibold">Prévisualisation de la conversion</p>
                  <p className="text-sm mt-1">
                    Vérifiez les informations avant de créer le projet définitif.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Informations Projet */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Informations du projet</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nom</p>
                      <p className="font-medium">{preview.projectPreview?.nomProjet}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Numéro</p>
                      <p className="font-medium">{preview.projectPreview?.numeroProjet}</p>
                    </div>
                    <div>                         

                      <p className="text-muted-foreground">Date début</p>
                      <p className="font-medium">{preview.projectPreview?.dateDebut ? format(preview.projectPreview?.dateDebut, "ppp",{locale:fr}): "Sélectionner"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date fin prévue</p>
                      <p className="font-medium">{preview.projectPreview?.dateFinPrevue ? format(preview.projectPreview?.dateFinPrevue, "ppp",{locale:fr}): "Sélectionner"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget initial</p>
                      <p className="font-medium text-lg text-primary">
                        {formatCurrency(preview.projectPreview?.budgetInitial)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nombre d'étapes</p>
                      <p className="font-medium">{preview.projectPreview?.nombreEtapes}</p>
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
                    {preview?.stagesPreview?.map((stage, index) => (
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
          {currentStep === "info" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleNextToConfig}>
                Suivant : Configuration
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
              <Button variant="outline" onClick={() => setCurrentStep("config")}>
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
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Créer le projet
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