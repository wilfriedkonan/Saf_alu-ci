"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Info, Lock, FileText, Settings } from "lucide-react"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/dqe"

interface DQELot {
  id: string
  numero: string
  designation: string
  montantHT: number
}

interface ConvertToProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dqe: {
    id: string
    reference: string
    nomProjet: string
    client: string
    budgetTotalHT: number
    lots: DQELot[]
  }
  onConvert: (projectData: any) => void
}

const chefsProjets = [
  { id: "1", nom: "Kouassi Jean" },
  { id: "2", nom: "Marie Dubois" },
  { id: "3", nom: "Ahmed Koné" },
  { id: "4", nom: "Sophie Martin" },
  { id: "5", nom: "Ibrahim Traoré" },
]

const typesProjets = ["Bâtiment", "Infrastructure", "VRD", "Rénovation", "Autre"]
const priorites = ["Basse", "Normale", "Haute", "Urgente"]
const statuts = ["Planification", "En cours"]

interface CalculatedStep {
  numero: number
  nom: string
  lotId: string
  budget: number
  pourcentage: number
  dureeJours: number
  dateDebut: Date
  dateFin: Date
  assigneA: string
  dependance: string
}

export function ConvertToProjectModal({ open, onOpenChange, dqe, onConvert }: ConvertToProjectModalProps) {
  const [nomProjet, setNomProjet] = useState(dqe.nomProjet)
  const [typeProjet, setTypeProjet] = useState("")
  const [description, setDescription] = useState("")
  const [dateDebut, setDateDebut] = useState<Date>()
  const [duree, setDuree] = useState("")
  const [dateFin, setDateFin] = useState<Date>()
  const [chefProjet, setChefProjet] = useState("")
  const [priorite, setPriorite] = useState("Normale")
  const [statut, setStatut] = useState("Planification")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [currentStep, setCurrentStep] = useState<"info" | "config">("info")
  const [creationMode, setCreationMode] = useState("auto")
  const [durationMethod, setDurationMethod] = useState("proportional")
  const [showPlanning, setShowPlanning] = useState(false)
  const [calculatedSteps, setCalculatedSteps] = useState<CalculatedStep[]>([])
  const [stepAssignments, setStepAssignments] = useState<Record<string, string>>({})

  const responsables = [
    { id: "1", nom: "Chef maçon", type: "Interne" },
    { id: "2", nom: "Chef électricien", type: "Interne" },
    { id: "3", nom: "Chef plombier", type: "Interne" },
    { id: "4", nom: "Sous-traitant charpente", type: "Externe" },
    { id: "5", nom: "Sous-traitant peinture", type: "Externe" },
  ]

  useEffect(() => {
    if (dateDebut && duree) {
      const dureeDays = Number.parseInt(duree)
      if (!isNaN(dureeDays) && dureeDays > 0) {
        const fin = new Date(dateDebut)
        fin.setDate(fin.getDate() + dureeDays)
        setDateFin(fin)
      }
    }
  }, [dateDebut, duree])

  const numeroProjet = `PROJ-2024-${String(Math.floor(Math.random() * 100) + 1).padStart(3, "0")}`

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!nomProjet.trim()) newErrors.nomProjet = "Le nom du projet est requis"
    if (!typeProjet) newErrors.typeProjet = "Le type de projet est requis"
    if (!dateDebut) newErrors.dateDebut = "La date de début est requise"
    if (!duree || Number.parseInt(duree) <= 0) newErrors.duree = "La durée doit être supérieure à 0"
    if (!chefProjet) newErrors.chefProjet = "Le chef de projet est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateSteps = () => {
    if (!dateDebut || !duree) return

    const totalDuration = Number.parseInt(duree)
    const totalBudget = dqe.budgetTotalHT
    const steps: CalculatedStep[] = []
    let currentDate = new Date(dateDebut)

    dqe.lots.forEach((lot, index) => {
      const pourcentage = (lot.montantHT / totalBudget) * 100

      let dureeJours: number
      if (durationMethod === "proportional") {
        // Proportional to budget with minimum 5 days
        dureeJours = Math.max(5, Math.round((lot.montantHT / totalBudget) * totalDuration))
      } else if (durationMethod === "equal") {
        // Equal duration for all steps
        dureeJours = Math.round(totalDuration / dqe.lots.length)
      } else {
        // Custom - default to proportional for now
        dureeJours = Math.max(5, Math.round((lot.montantHT / totalBudget) * totalDuration))
      }

      const dateDebut = new Date(currentDate)
      const dateFin = addDays(currentDate, dureeJours - 1)

      steps.push({
        numero: index + 1,
        nom: lot.designation,
        lotId: lot.id,
        budget: lot.montantHT,
        pourcentage,
        dureeJours,
        dateDebut,
        dateFin,
        assigneA: stepAssignments[lot.id] || "",
        dependance: index === 0 ? "Aucune (début)" : `Après ÉTAPE ${index}`,
      })

      // Next step starts the day after current step ends
      currentDate = addDays(dateFin, 1)
    })

    setCalculatedSteps(steps)
    setShowPlanning(true)
  }

  const handleNextToConfig = () => {
    if (validateForm()) {
      setCurrentStep("config")
    }
  }

  const handleBackToInfo = () => {
    setCurrentStep("info")
  }

  const handleFinalSubmit = () => {
    const projectData = {
      nomProjet,
      numeroProjet,
      typeProjet,
      description,
      client: dqe.client,
      dateDebut,
      duree: Number.parseInt(duree),
      dateFin,
      chefProjet,
      priorite,
      statut,
      budgetTotal: dqe.budgetTotalHT,
      lots: dqe.lots,
      dqeReference: dqe.reference,
      creationMode,
      durationMethod,
      steps: creationMode === "auto" ? calculatedSteps : [],
    }
    onConvert(projectData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-50 hover:scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900/20 dark:hover:scrollbar-thumb-blue-500">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {currentStep === "info" ? <FileText className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
            {currentStep === "info" ? "Convertir le DQE en Projet" : "Configuration des Étapes"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {currentStep === "info" ? (
            <>
              {/* Résumé DQE */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      {dqe.reference} - {dqe.nomProjet}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Client :</span>
                      <span className="font-medium">{dqe.client}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Budget :</span>
                      <span className="font-semibold text-primary">{formatCurrency(dqe.budgetTotalHT)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">{dqe.lots.length} lots :</p>
                    <div className="space-y-1">
                      {dqe.lots.map((lot) => (
                        <div key={lot.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            • {lot.numero} - {lot.designation}
                          </span>
                          <span className="font-medium">{formatCurrency(lot.montantHT)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2">
                      Le projet sera créé avec :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Budget = Total DQE HT</li>
                        <li>Chaque LOT devient une ÉTAPE</li>
                        <li>Le client est hérité du DQE</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Separator />

              {/* Section Informations Projet */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">📋 INFORMATIONS PROJET</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
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
                    {errors.nomProjet && <p className="text-sm text-red-500">{errors.nomProjet}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroProjet">Numéro projet</Label>
                    <div className="relative">
                      <Input id="numeroProjet" value={numeroProjet} disabled className="pr-8" />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeProjet">
                      Type de projet <span className="text-red-500">*</span>
                    </Label>
                    <Select value={typeProjet} onValueChange={setTypeProjet}>
                      <SelectTrigger className={errors.typeProjet ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typesProjets.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.typeProjet && <p className="text-sm text-red-500">{errors.typeProjet}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description du projet..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <div className="relative">
                      <Input id="client" value={dqe.client} disabled className="pr-8" />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section Planification */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">📅 PLANIFICATION</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Date début projet <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateDebut && "text-muted-foreground",
                            errors.dateDebut && "border-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateDebut} onSelect={setDateDebut} initialFocus locale={fr} />
                      </PopoverContent>
                    </Popover>
                    {errors.dateDebut && <p className="text-sm text-red-500">{errors.dateDebut}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duree">
                      Durée totale estimée <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="duree"
                        type="number"
                        value={duree}
                        onChange={(e) => setDuree(e.target.value)}
                        placeholder="120"
                        className={errors.duree ? "border-red-500" : ""}
                      />
                      <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">jours</span>
                    </div>
                    {errors.duree && <p className="text-sm text-red-500">{errors.duree}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dateFin">Date fin calculée</Label>
                    <div className="relative">
                      <Input
                        id="dateFin"
                        value={dateFin ? format(dateFin, "PPP", { locale: fr }) : ""}
                        disabled
                        placeholder="Calculée automatiquement"
                        className="pr-8"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chefProjet">
                      Chef de projet <span className="text-red-500">*</span>
                    </Label>
                    <Select value={chefProjet} onValueChange={setChefProjet}>
                      <SelectTrigger className={errors.chefProjet ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionner un chef de projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {chefsProjets.map((chef) => (
                          <SelectItem key={chef.id} value={chef.nom}>
                            {chef.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.chefProjet && <p className="text-sm text-red-500">{errors.chefProjet}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priorite">Priorité</Label>
                    <Select value={priorite} onValueChange={setPriorite}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorites.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut initial</Label>
                    <Select value={statut} onValueChange={setStatut}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuts.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Configuration Étapes Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">⚙️ CONFIGURATION ÉTAPES</h3>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Mode de création</Label>
                    <RadioGroup value={creationMode} onValueChange={setCreationMode}>
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="auto" id="auto" />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="auto" className="font-medium cursor-pointer">
                            Automatique depuis les lots DQE (recommandé)
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="manual" id="manual" />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="manual" className="font-medium cursor-pointer">
                            Manuel (créer après)
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {creationMode === "auto" && (
                    <>
                      <Separator />

                      <div className="space-y-3">
                        <Label>Méthode calcul durées</Label>
                        <RadioGroup value={durationMethod} onValueChange={setDurationMethod}>
                          <div className="flex items-start space-x-3 space-y-0">
                            <RadioGroupItem value="proportional" id="proportional" />
                            <div className="space-y-1 leading-none">
                              <Label htmlFor="proportional" className="font-medium cursor-pointer">
                                Proportionnelle au budget (recommandé)
                              </Label>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Les étapes importantes ont plus de temps
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 space-y-0">
                            <RadioGroupItem value="equal" id="equal" />
                            <div className="space-y-1 leading-none">
                              <Label htmlFor="equal" className="font-medium cursor-pointer">
                                Durées égales
                              </Label>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Toutes les étapes ont la même durée
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 space-y-0">
                            <RadioGroupItem value="custom" id="custom" />
                            <div className="space-y-1 leading-none">
                              <Label htmlFor="custom" className="font-medium cursor-pointer">
                                Personnalisée
                              </Label>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Vous définissez chaque durée manuellement
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button onClick={calculateSteps} variant="outline" className="w-full bg-transparent">
                        <FileText className="mr-2 h-4 w-4" />
                        Afficher le planning proposé
                      </Button>

                      {showPlanning && calculatedSteps.length > 0 && (
                        <Card className="border-2 border-blue-200 dark:border-blue-800">
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-lg">PLANNING AUTOMATIQUE PROPOSÉ</h4>
                              <Badge variant="secondary">{calculatedSteps.length} étapes</Badge>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              {calculatedSteps.map((step) => (
                                <Card key={step.numero} className="bg-muted/30">
                                  <CardContent className="pt-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <h5 className="font-semibold">
                                          ÉTAPE {step.numero} : {step.nom.toUpperCase()}
                                        </h5>
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="text-muted-foreground">Budget :</span>
                                          <span className="font-medium">{formatCurrency(step.budget)}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {step.pourcentage.toFixed(1)}% du total
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div className="space-y-1">
                                        <span className="text-muted-foreground">Durée :</span>
                                        <p className="font-medium">
                                          {step.dureeJours} jours ({format(step.dateDebut, "dd/MM", { locale: fr })} →{" "}
                                          {format(step.dateFin, "dd/MM", { locale: fr })})
                                        </p>
                                      </div>

                                      <div className="space-y-1">
                                        <Label htmlFor={`assign-${step.numero}`} className="text-muted-foreground">
                                          Assigné à :
                                        </Label>
                                        <Select
                                          value={stepAssignments[step.lotId] || ""}
                                          onValueChange={(value) => {
                                            setStepAssignments((prev) => ({
                                              ...prev,
                                              [step.lotId]: value,
                                            }))
                                            // Update the calculated step
                                            setCalculatedSteps((prev) =>
                                              prev.map((s) => (s.lotId === step.lotId ? { ...s, assigneA: value } : s)),
                                            )
                                          }}
                                        >
                                          <SelectTrigger id={`assign-${step.numero}`} className="h-8">
                                            <SelectValue placeholder="Sélectionner..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {responsables.map((resp) => (
                                              <SelectItem key={resp.id} value={resp.nom}>
                                                {resp.nom} ({resp.type})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Dépendance :</span>
                                      <span className="ml-2 font-medium">{step.dependance}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            <Button variant="outline" className="w-full bg-transparent" disabled>
                              ✏️ Personnaliser les étapes
                              <span className="ml-2 text-xs text-muted-foreground">(Prochainement)</span>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {creationMode === "manual" && (
                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-sm text-amber-900 dark:text-amber-100 ml-2">
                        Le projet sera créé sans étapes. Vous pourrez les ajouter manuellement après la création du
                        projet.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentStep === "info" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                ❌ Annuler
              </Button>
              <Button onClick={handleNextToConfig} className="bg-blue-600 hover:bg-blue-700">
                ➡️ Suivant : Configuration étapes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBackToInfo}>
                ← Retour
              </Button>
              <Button onClick={handleFinalSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                ✅ Créer le projet
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
