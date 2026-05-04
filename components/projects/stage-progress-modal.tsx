"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Euro,
  User,
  Star,
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  History,
  Play,
  Pause,
  RotateCcw,
  Ban,
  DollarSignIcon,
  Coins,
  Wallet,
  PiggyBank,
  Banknote
} from "lucide-react"
import type { Project, ProjectStage, SousTraitantEtapeJoin } from "@/types/projet"
import { useProjetEtapes } from "@/hooks/useProjet"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { useSousTraitantEvaluations } from "@/hooks/useSoustraitant"

interface StageProgressModalProps {
  stage: ProjectStage | null
  projet: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function StageProgressModal({ stage, projet, open, onOpenChange, onUpdate }: StageProgressModalProps) {
  const { user } = useAuth()
  const { updateEtape, loading } = useProjetEtapes(projet.id)

  const toJoinList = (s: typeof stage): SousTraitantEtapeJoin[] => {
    if (s?.sousTraitants?.length) return s.sousTraitants
    if (s?.sousTraitant) {
      return [{
        id: -1,
        etapeProjetId: s.id ?? 0,
        sousTraitantId: s.sousTraitant.id,
        sousTraitant: s.sousTraitant as any,
      }]
    }
    return []
  }

  const sousTraitantsList = toJoinList(stage)

  const [selectedSousTraitantId, setSelectedSousTraitantId] = useState<number | undefined>(
    sousTraitantsList[0]?.sousTraitantId
  )

  const {
    createEvaluation,
    loading: evaluationLoading,
  } = useSousTraitantEvaluations(selectedSousTraitantId)

  const selectedSousTraitant = sousTraitantsList.find(st => st.sousTraitantId === selectedSousTraitantId)

  // Données d'affichage issues directement du stage (pas d'appel API supplémentaire)
  const noteMoyenne = selectedSousTraitant?.sousTraitant?.noteMoyenne ?? 0
  const totalEvaluations = selectedSousTraitant?.sousTraitant?.nombreEvaluations ?? 0
  const evaluations = selectedSousTraitant?.sousTraitant?.evaluations ?? []

  const [progression, setProgression] = useState(0)
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  const [currentStatut, setCurrentStatut] = useState<string>("")

  const [criteresEvaluation, setCriteresEvaluation] = useState({
    qualite: 0,
    delais: 0,
    communication: 0,
    professionnalisme: 0,
    proprete: 0
  })

  const totalDepenseEtape = stage?.depenseProjet
    ?.filter((mvt) => mvt.typeMouvement === "Sortie")
    ?.reduce((sum, mvt) => sum + mvt.montant, 0) ?? 0;

  // ✅ CORRECTION: Charger les données de l'étape et réinitialiser l'évaluation
  useEffect(() => {
    if (stage && open) {
      setProgression(stage.pourcentageAvancement)
      setCurrentStatut(stage.statut)
      setNote(0)
      setCommentaire("")
      setCriteresEvaluation({
        qualite: 0,
        delais: 0,
        communication: 0,
        professionnalisme: 0,
        proprete: 0
      })
      const list = toJoinList(stage)
      setSelectedSousTraitantId(list[0]?.sousTraitantId ?? undefined)
    }
  }, [stage, open])

  // ✅ NOTE: Le hook useSousTraitantEvaluations charge automatiquement les évaluations 
  // quand sousTraitantId change via son useEffect interne

  const handleChangeStatut = async (newStatut: string) => {
    if (!stage) return

    // Validation des transitions de statut
    const confirmMessages: Record<string, string> = {
      EnCours: "Voulez-vous démarrer cette étape ?",
      Suspendu: "Voulez-vous suspendre cette étape ?",
      Termine: "Voulez-vous marquer cette étape comme terminée ?",
      Annule: "Voulez-vous annuler cette étape ? Cette action est définitive.",
    }

    if (confirmMessages[newStatut] && !confirm(confirmMessages[newStatut])) {
      return
    }

    try {
      const updateData: Partial<ProjectStage> = {
        statut: newStatut as any,
      }

      // Logique automatique selon le statut
      if (newStatut === "EnCours" && stage.pourcentageAvancement === 0) {
        updateData.pourcentageAvancement = 1 // Initialiser à 1% au démarrage
        setProgression(1)
      } else if (newStatut === "Termine") {
        updateData.pourcentageAvancement = 100
        updateData.dateFinReelle = new Date().toISOString()
        setProgression(100)
      }

      if (!stage.id) {
        toast.error("Impossible de mettre à jour l'étape: ID manquant")
        return
      }

      await updateEtape(stage.id, updateData)
      setCurrentStatut(newStatut)
      toast.success(`Étape ${getStatusLabel(newStatut).toLowerCase()}`)
      // ✅ Appeler onUpdate() seulement après une modification réussie
      onUpdate()
      // Ne pas fermer le modal, laisser l'utilisateur continuer à travailler
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  // ✅ CORRECTION: Implémenter correctement la fonction de sauvegarde d'évaluation
  const handleSaveEvaluation = async () => {
    // Validation
    if (!selectedSousTraitantId) {
      toast.error("Aucun sous-traitant sélectionné")
      return
    }

    if (note === 0) {
      toast.error("Veuillez attribuer une note (1 à 5 étoiles)")
      return
    }

    if (!stage) {
      toast.error("Étape non trouvée")
      return
    }

    if (!stage.id) {
      toast.error("Impossible d'évaluer: l'étape n'a pas d'ID")
      return
    }

    try {
      // Préparer les données d'évaluation selon CreateEvaluationRequest
      const evaluationData = {
        sousTraitantId: selectedSousTraitantId,
        projetId: projet.id,
        etapeProjetId: stage.id,
        note: note,
        commentaire: commentaire.trim() || null,
        criteres: Object.values(criteresEvaluation).some(v => v > 0) ? criteresEvaluation : undefined
      }

      // Créer l'évaluation via le service
      const response = await createEvaluation(selectedSousTraitantId, evaluationData)

      if (response.message) {
        toast.success("Évaluation enregistrée avec succès")
        // Réinitialiser les champs
        setNote(0)
        setCommentaire("")
        setCriteresEvaluation({
          qualite: 0,
          delais: 0,
          communication: 0,
          professionnalisme: 0,
          proprete: 0
        })
        // Rafraîchir les données du projet (les notes seront mises à jour via le refresh)
        onUpdate()
      } else {
        toast.error(response.error || "Erreur lors de l'enregistrement de l'évaluation")
      }
    } catch (error: any) {
      console.error("Erreur lors de la création de l'évaluation:", error)
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement de l'évaluation")
    }
  }

  const canEditProgress = () => {
    // On ne peut modifier la progression que si l'étape est en cours
    return currentStatut === "EnCours"
  }

  const getAvailableActions = () => {
    const actions = []

    switch (currentStatut) {
      case "Planification":
      case "NonCommence":
        actions.push({
          label: "Démarrer",
          icon: Play,
          color: "bg-blue-600 hover:bg-blue-700",
          statut: "EnCours"
        })
        actions.push({
          label: "Annuler",
          icon: Ban,
          color: "bg-red-600 hover:bg-red-700",
          statut: "Annule"
        })
        break

      case "EnCours":
        actions.push({
          label: "Terminer",
          icon: CheckCircle,
          color: "bg-green-600 hover:bg-green-700",
          statut: "Termine"
        })
        actions.push({
          label: "Suspendre",
          icon: Pause,
          color: "bg-amber-600 hover:bg-amber-700",
          statut: "Suspendu"
        })
        actions.push({
          label: "Annuler",
          icon: Ban,
          color: "bg-red-600 hover:bg-red-700",
          statut: "Annule"
        })
        break

      case "Suspendu":
        actions.push({
          label: "Reprendre",
          icon: RotateCcw,
          color: "bg-blue-600 hover:bg-blue-700",
          statut: "EnCours"
        })
        actions.push({
          label: "Annuler",
          icon: Ban,
          color: "bg-red-600 hover:bg-red-700",
          statut: "Annule"
        })
        break

      case "Termine":
      case "Annule":
        // Aucune action disponible pour les étapes terminées ou annulées
        break
    }

    return actions
  }

  const handleSave = async () => {
    if (!stage) return

    if (!stage.id) {
      toast.error("Impossible de sauvegarder: l'étape n'a pas d'ID")
      return
    }

    // Vérifier si on peut modifier la progression
    if (!canEditProgress() && progression !== stage.pourcentageAvancement) {
      toast.error("Vous ne pouvez modifier la progression que si l'étape est en cours")
      return
    }

    try {
      const updateData: Partial<ProjectStage> = {
        pourcentageAvancement: progression,
      }

      // ✅ NOTE: L'évaluation est gérée séparément via handleSaveEvaluation
      // On ne sauvegarde plus l'évaluation ici, seulement la progression

      // Mettre à jour le statut automatiquement selon la progression
      if (progression === 100 && currentStatut !== "Termine" && currentStatut === "EnCours") {
        updateData.statut = "Termine"
        updateData.dateFinReelle = new Date().toISOString()
        setCurrentStatut("Termine")
      } else if (progression > 0 && progression < 100 && currentStatut === "NonCommence") {
        updateData.statut = "EnCours"
        setCurrentStatut("EnCours")
      }

      await updateEtape(stage.id, updateData)

      toast.success("Étape mise à jour avec succès")
      // ✅ Appeler onUpdate() seulement après une modification réussie
      onUpdate()
      // Ne pas fermer automatiquement le modal, laisser l'utilisateur le fermer manuellement
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      toast.error("Erreur lors de la mise à jour de l'étape")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "Termine":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "EnCours":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "Suspendu":
        return <XCircle className="h-5 w-5 text-amber-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      Planification: "Planification",
      NonCommence: "Non commencé",
      EnCours: "En cours",
      Termine: "Terminé",
      Suspendu: "Suspendu",
      Annule: "Annulé"
    }
    return labels[statut] || statut
  }
const getSousTraitantItemNom = (item: any) =>
  item?.nom ?? item?.sousTraitant?.nom ?? "Sous-traitant"

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      Planification: "bg-gray-100 text-gray-800",
      NonCommence: "bg-gray-100 text-gray-800",
      EnCours: "bg-blue-100 text-blue-800",
      Termine: "bg-green-100 text-green-800",
      Suspendu: "bg-amber-100 text-amber-800",
      Annule: "bg-red-100 text-red-800"
    }
    return colors[statut] || "bg-gray-100 text-gray-800"
  }

  if (!stage) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(currentStatut)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {stage.nom}
                <Badge className={getStatusColor(currentStatut)}>{getStatusLabel(currentStatut)}</Badge>
              </div>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Étape {stage.ordre} - {projet.nom}
              </p>
            </div>
          </DialogTitle>

          {/* Boutons de gestion de statut */}
          {getAvailableActions().length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground w-full mb-2">Actions disponibles :</p>
              {getAvailableActions().map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.statut}
                    onClick={() => handleChangeStatut(action.statut)}
                    disabled={loading}
                    size="sm"
                    className={`${action.color} text-white`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                )
              })}
            </div>
          )}

          {(currentStatut === "Termine" || currentStatut === "Annule") && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {currentStatut === "Termine"
                  ? "✅ Cette étape est terminée. Aucune modification n'est possible."
                  : "❌ Cette étape est annulée. Aucune modification n'est possible."}
              </p>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="progress">Progression</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="evaluation">Évaluation</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="depenses"> Dépenses</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {!canEditProgress() && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ La progression ne peut être modifiée que lorsque l'étape est "En cours"
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {currentStatut === "Planification" || currentStatut === "NonCommence"
                    ? "Veuillez d'abord démarrer l'étape."
                    : currentStatut === "Suspendu"
                      ? "Veuillez d'abord reprendre l'étape."
                      : "Cette étape ne peut plus être modifiée."}
                </p>
              </div>
            )}

            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Progression actuelle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Progression actuelle</Label>
                    <span className="text-2xl font-bold">{progression}%</span>
                  </div>
                  <Progress value={progression} className="h-3" />
                </div>

                {/* Slider de progression */}
                <div className="space-y-3">
                  <Label htmlFor="progress-slider">Mettre à jour la progression</Label>
                  <Slider
                    id="progress-slider"
                    value={[progression]}
                    onValueChange={(value) => setProgression(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                    disabled={loading || !canEditProgress()}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Input direct */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="progress-input" className="whitespace-nowrap">
                    Ou saisir directement:
                  </Label>
                  <Input
                    id="progress-input"
                    type="number"
                    value={progression}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        setProgression(val)
                      }
                    }}
                    min={0}
                    max={100}
                    disabled={loading || !canEditProgress()}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>

                {/* Alerte si terminé */}
                {progression === 100 && stage.statut !== "Termine" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <p className="font-medium">Cette étape sera marquée comme terminée</p>
                    </div>
                  </div>
                )}

                {/* Alerte si démarré */}
                {progression > 0 && progression < 100 && stage.statut === "NonCommence" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="h-5 w-5" />
                      <p className="font-medium">Cette étape sera marquée comme en cours</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Description */}
                {stage.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de début
                    </Label>
                    <p className="text-sm font-medium">
                      {stage.dateDebut
                        ? new Date(stage.dateDebut).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                        : "Non définie"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de fin prévue
                    </Label>
                    <p className="text-sm font-medium">
                      {stage.dateFinPrevue
                        ? new Date(stage.dateFinPrevue).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                        : "Non définie"}
                    </p>
                  </div>
                </div>

                {/* Date de fin réelle si terminé */}
                {stage.dateFinReelle && (
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Date de fin réelle
                    </Label>
                    <p className="text-sm font-medium text-green-600">
                      {new Date(stage.dateFinReelle).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                )}

                {/* Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Budget prévu
                    </Label>
                    <p className="text-sm font-medium">{formatCurrency(stage.budgetPrevu)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Coût réel
                    </Label>
                    <p className={`text-sm font-medium ${stage.coutReel > stage.budgetPrevu ? "text-red-600" : "text-green-600"
                      }`}>
                      {formatCurrency(stage.coutReel)}
                    </p>
                  </div>
                </div>

                {/* Budget restant */}
                <div className="space-y-1">
                  <Label className="text-sm flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Budget restant
                  </Label>
                  <p className={`text-sm font-medium ${(stage.budgetPrevu - stage.coutReel) < 0 ? "text-red-600" : "text-green-600"
                    }`}>
                    {formatCurrency(stage.budgetPrevu - stage.coutReel)}
                  </p>
                </div>

                {/* Responsable */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Type de responsable
                  </Label>
                  <Badge variant="outline" className="w-fit">
                    {stage.typeResponsable === "Interne" ? "👨‍💼 Interne" : "🏢 Sous-traitant"}
                  </Badge>
                  {sousTraitantsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {sousTraitantsList.map((st) => (
                        <Badge key={st.sousTraitantId ?? st.id} variant="secondary" className="text-xs">
                          {st.sousTraitant?.nom ?? "Sous-traitant"}
                          {st.sousTraitant?.telephone ? ` • ${st.sousTraitant.telephone}` : ""}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lien DQE */}
                {stage.linkedDqeLotCode && (
                  <div className="space-y-1 pt-3 border-t">
                    <Label className="text-sm font-medium">Origine DQE</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stage.linkedDqeLotCode}</Badge>
                      {stage.linkedDqeLotName && (
                        <span className="text-sm text-muted-foreground">
                          {stage.linkedDqeLotName}
                        </span>
                      )}
                    </div>
                    {stage.linkedDqeReference && (
                      <p className="text-xs text-muted-foreground">
                        Référence: {stage.linkedDqeReference}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluation" className="space-y-4">
            {sousTraitantsList.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {stage.typeResponsable === "Interne"
                        ? "Cette étape est gérée en interne. L'évaluation n'est disponible que pour les sous-traitants."
                        : "Aucun sous-traitant n'est assigné à cette étape."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Notes de tous les sous-traitants */}
                <div className="space-y-3">
                  {sousTraitantsList.map((st) => {
                    const stEvaluations = st.sousTraitant?.evaluations ?? []
                    const stNombre = st.sousTraitant?.nombreEvaluations ?? stEvaluations.length
                    const stNote = st.sousTraitant?.noteMoyenne ?? 0
                    return (
                      <Card key={st.sousTraitantId ?? st.id}>
                        <CardContent className="pt-4 pb-4 space-y-3">
                          {/* En-tête : nom + note */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{st.sousTraitant?.nom ?? "Sous-traitant"}</p>
                              <p className="text-xs text-muted-foreground">
                                {stNombre} évaluation{stNombre > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <span
                                    key={s}
                                    className={`text-xl ${s <= Math.round(stNote) ? "text-yellow-400" : "text-gray-200"}`}
                                  >★</span>
                                ))}
                              </div>
                              <span className="font-bold text-sm">
                                {stNote > 0 ? stNote.toFixed(1) : "—"}<span className="text-muted-foreground font-normal">/5</span>
                              </span>
                            </div>
                          </div>

                          {/* Historique des évaluations */}
                          {stEvaluations.length > 0 && (
                            <div className="space-y-2 border-t pt-3">
                              {stEvaluations.map((ev, i) => {
                                let criteresParsed: Record<string, number> | null = null
                                if (ev.criteres) {
                                  try {
                                    criteresParsed = typeof ev.criteres === "string"
                                      ? JSON.parse(ev.criteres)
                                      : ev.criteres
                                  } catch { /* ignore */ }
                                }
                                return (
                                  <div key={ev.id ?? i} className="bg-muted/50 rounded-md px-3 py-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, idx) => (
                                          <span key={idx} className={`text-sm ${idx < ev.note ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                                        ))}
                                        <span className="text-xs font-medium ml-1">{ev.note}/5</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(ev.dateEvaluation).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                      </span>
                                    </div>
                                    {ev.commentaire && (
                                      <p className="text-xs text-muted-foreground italic mt-1">"{ev.commentaire}"</p>
                                    )}
                                    {criteresParsed && Object.keys(criteresParsed).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(criteresParsed).map(([key, val]) => (
                                          <Badge key={key} variant="outline" className="text-xs px-1.5 py-0">{key}: {val}/5</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Formulaire d'ajout d'évaluation */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Nouvelle évaluation
                    </Label>

                    {/* Sélecteur de prestataire si plusieurs */}
                    {sousTraitantsList.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {sousTraitantsList.map((st) => (
                          <button
                            key={st.sousTraitantId ?? st.id}
                            type="button"
                            onClick={() => setSelectedSousTraitantId(st.sousTraitantId)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              selectedSousTraitantId === st.sousTraitantId
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-input hover:bg-muted"
                            }`}
                          >
                            {st.sousTraitant?.nom ?? "Sous-traitant"}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Étoiles */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNote(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="text-4xl transition-colors focus:outline-none disabled:opacity-50"
                          disabled={evaluationLoading}
                        >
                          <span className={star <= (hoveredStar || note) ? "text-yellow-400" : "text-gray-300"}>★</span>
                        </button>
                      ))}
                      {note > 0 && <span className="ml-1 text-lg font-medium">{note}/5</span>}
                    </div>

                    {/* Commentaire */}
                    <div className="space-y-1">
                      <Label htmlFor="comment" className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        Commentaire (optionnel)
                      </Label>
                      <Textarea
                        id="comment"
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Ajoutez vos remarques..."
                        rows={3}
                        disabled={evaluationLoading}
                      />
                    </div>

                    <Button
                      onClick={handleSaveEvaluation}
                      disabled={evaluationLoading || note === 0}
                      className="w-full"
                    >
                      {evaluationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {evaluationLoading ? "Enregistrement..." : "Enregistrer l'évaluation"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des modifications
                  </Label>

                  <div className="space-y-3">
                    {/* Historique de progression */}
                    <div className="flex items-start space-x-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Progression actuelle: {stage.pourcentageAvancement}%</p>
                        <p className="text-xs text-muted-foreground">
                          Statut: {getStatusLabel(stage.statut)}
                        </p>
                      </div>
                    </div>

                    {/* Évaluations */}
                    {evaluations.length > 0 && (
                      <div className="flex items-start space-x-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {evaluations.length} évaluation{evaluations.length > 1 ? "s" : ""} enregistrée{evaluations.length > 1 ? "s" : ""}
                            {noteMoyenne > 0 && ` (Moyenne: ${noteMoyenne.toFixed(1)}/5)`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dernière évaluation le {new Date(evaluations[0].dateEvaluation).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date de fin réelle */}
                    {stage.dateFinReelle && (
                      <div className="flex items-start space-x-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Étape terminée</p>
                          <p className="text-xs text-muted-foreground">
                            Le {new Date(stage.dateFinReelle).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Message si aucun historique */}
                    {evaluations.length === 0 && !stage.dateFinReelle && stage.pourcentageAvancement === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune modification enregistrée pour le moment
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="depenses" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">

                  {/* Titre */}
                  <Label className="text-base font-medium flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des dépenses
                  </Label>

                  {/* 🔥 LISTE DES MOUVEMENTS FINANCIERS 🔥 */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Mouvements financiers</h3>

                    {/* Si aucun mouvement */}
                    {(!stage?.depenseProjet || stage.depenseProjet.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun mouvement enregistré pour le moment
                      </p>
                    )}

                    {/* Liste */}
                    <div className="space-y-3">
                      {stage?.depenseProjet?.map((mvt) => (
                        <div
                          key={mvt.id}
                          className="flex items-start justify-between border rounded-lg p-3 bg-muted/30"
                        >
                          <div className="flex items-start space-x-3">

                            <div
                              className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${mvt.typeMouvement === "Sortie" ? "bg-red-500" : "bg-green-500"
                                }`}
                            />

                            <div>
                              <p className="font-medium">{mvt.libelle}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(mvt.dateMouvement).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>

                          <p
                            className={`font-semibold ${mvt.typeMouvement === "Sortie" ? "text-red-600" : "text-green-700"
                              }`}
                          >
                            {mvt.typeMouvement === "Sortie" ? "-" : "+"}
                            {mvt.montant.toLocaleString("fr-FR")} F
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 🔷 TOTAL DÉPENSE ÉTAPE */}
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-medium flex items-center gap-2">
                      Total dépense étape :
                      <span className="text-red-600 font-bold">
                        {totalDepenseEtape.toLocaleString("fr-FR")} F
                      </span>
                    </p>
                  </div>

                  {/* 🔷 Progression & Infos */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">
                          Progression actuelle: {stage.pourcentageAvancement}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Statut: {getStatusLabel(stage.statut)}
                        </p>
                      </div>
                    </div>

                    {/* évaluations */}
                    {evaluations.length > 0 && (
                      <div className="flex items-start space-x-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {evaluations.length} évaluation{evaluations.length > 1 ? "s" : ""} enregistrée{evaluations.length > 1 ? "s" : ""}
                            {noteMoyenne > 0 && ` (Moyenne: ${noteMoyenne.toFixed(1)}/5)`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dernière évaluation le{" "}
                            {new Date(evaluations[0].dateEvaluation).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* étape finie */}
                    {stage.dateFinReelle && (
                      <div className="flex items-start space-x-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Étape terminée</p>
                          <p className="text-xs text-muted-foreground">
                            Le {new Date(stage.dateFinReelle).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          {(currentStatut !== "Termine" && currentStatut !== "Annule") && (
            <Button
              onClick={handleSave}
              disabled={loading || (!canEditProgress() && progression !== stage.pourcentageAvancement)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}