"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, Play, Plus, Loader2 } from "lucide-react"
import type { Project, ProjectStage } from "@/types/projet"
import { StageProgressModal } from "./stage-progress-modal"
import { useProjetEtapes } from "@/hooks/useProjet"
import { toast } from "sonner"

interface ProjectTimelineProps {
  projet: Project
  onUpdate: () => void
}

export function ProjectTimeline({ projet, onUpdate }: ProjectTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null)
  const { etapes, loading, addEtape, refreshEtapes } = useProjetEtapes(projet.id)

  const getStageIcon = (stage: ProjectStage) => {
    switch (stage.statut) {
      case "Termine":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "EnCours":
        return <Play className="h-5 w-5 text-blue-600" />
      case "Suspendu":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStageColor = (stage: ProjectStage) => {
    switch (stage.statut) {
      case "Termine":
        return "border-green-200 bg-green-50"
      case "EnCours":
        return "border-blue-200 bg-blue-50"
      case "Suspendu":
        return "border-amber-200 bg-amber-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getStageStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      NonCommence: "Non commencé",
      EnCours: "En cours",
      Termine: "Terminé",
      Suspendu: "Suspendu"
    }
    return labels[statut] || statut
  }

  const handleStageClick = (stage: ProjectStage) => {
    setSelectedStage(stage)
  }

  const handleModalClose = () => {
    setSelectedStage(null)
    // ✅ Ne pas appeler onUpdate() ici car cela déclenche un refresh complet
    // onUpdate() sera appelé uniquement après une modification réussie dans le modal
  }

  const handleStageUpdate = () => {
    // ✅ Rafraîchir uniquement les étapes localement (plus rapide et ne perturbe pas la page)
    refreshEtapes()
    // ✅ Rafraîchir aussi les données du projet pour mettre à jour les statistiques
    // (progression globale, budget, etc.) mais de manière non-bloquante
    onUpdate()
  }

  // Utiliser les étapes du hook ou celles du projet
  const stages = etapes.length > 0 ? etapes : (projet.etapes || [])

  // Trier les étapes par ordre
  const sortedStages = [...stages]

  const getNiveauProgress = (niveau: ProjectStage["niveau"]) => {
    if (niveau === undefined || niveau === null) return 0
    const niveauStages = sortedStages.filter((stage) => stage.niveau === niveau && !stage.linkedDqeLotName )
    if (niveauStages.length === 0) return 0
    const total = niveauStages.reduce((sum, stage) => sum + (stage.pourcentageAvancement || 0), 0)
    return total / niveauStages.length
  }

  if (loading && stages.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }
  let linkedStageCounter = 0
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Planning du projet</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedStages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune étape définie pour ce projet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => toast.info("Pour la fonctionnalité d'ajout rendez vous en modification")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer la première étape
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedStages.map((stage, index) => {
                const linkedOrder = stage.linkedDqeLotName ? null : ++linkedStageCounter
                return (
                  <div key={stage.id} className="relative">
                    {/* Timeline line */}
                  {index < sortedStages.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                  )}

                    <div
                      className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getStageColor(stage)}`}
                      onClick={linkedOrder !== null ? () => handleStageClick(stage) : undefined}
                  >
                    <div className="flex-shrink-0 mt-1">{getStageIcon(stage)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{stage.nom}</h4>
                          {linkedOrder !== null && (
                            <Badge variant="outline" className="text-xs">
                              Étape {linkedOrder}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stage.linkedDqeLotName
                            ? getNiveauProgress(stage.niveau)
                            : stage.pourcentageAvancement}
                          %
                        </Badge>
                      </div>

                      {stage.description && (
                        <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                      )}

                      <div className="space-y-2">
                        <Progress
                          value={
                            stage.linkedDqeLotName
                              ? getNiveauProgress(stage.niveau)
                              : stage.pourcentageAvancement
                          }
                          className="h-2"
                        />

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {linkedOrder !== null && <div className="flex items-center gap-4">
                            {stage.typeResponsable && (
                              <span>
                                Type: {stage.typeResponsable === "Interne" ? "👨‍💼 Interne " : "🏢 Sous-traitant"}
                                
                              </span>
                            )}
                            <div>
                              {stage.sousTraitant?.nom ?? ""} </div>

                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              {getStageStatusLabel(stage.statut)}
                            </Badge>

                          </div>}
                          {linkedOrder !== null && <span>
                            {stage.dateDebut && stage.dateFinPrevue ? (
                              <>
                                {new Date(stage.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                                {new Date(stage.dateFinPrevue).toLocaleDateString("fr-FR")}
                              </>
                            ) : (
                              "Dates non définies"
                            )}
                          </span>}
                        </div>

                        {/* Budget de l'étape */}
                        {linkedOrder !== null &&   <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Budget: {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "XOF",
                              minimumFractionDigits: 0,
                            }).format(stage.budgetPrevu)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">
                              Coût réel: {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                                minimumFractionDigits: 0,
                              }).format(stage.coutReel)}
                            </span>
                            <span className="text-muted-foreground">
                              Marge: {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                                minimumFractionDigits: 0,
                              }).format(stage.budgetPrevu - stage.coutReel)}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            Dépensé: {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "XOF",
                              minimumFractionDigits: 0,
                            }).format(stage.depense)}
                          </span>
                        </div>}

                        {/* Lien DQE si présent */}
                        {stage.linkedDqeLotCode && (
                          <div className="flex items-center gap-2 text-xs pt-2 border-t">
                            <Badge variant="outline" className="text-xs">
                              DQE: {stage.linkedDqeLotCode}
                            </Badge>
                            {stage.linkedDqeLotName && (
                              <span className="text-muted-foreground">
                                {stage.linkedDqeLotName}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Évaluation si présente */}
                        {stage.evaluation && (
                          <div className="flex items-center space-x-2 text-xs pt-2 border-t">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${i < stage.evaluation!.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-muted-foreground">
                              Évalué par {stage.evaluation.evaluatedBy}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {linkedOrder !== null && <Button variant="ghost" size="sm" className="flex-shrink-0">
                      Détails
                    </Button>}
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStage && (
        <StageProgressModal
          stage={selectedStage as ProjectStage}
          projet={projet}
          open={!!selectedStage}
          onOpenChange={(open) => {
            if (!open) {
              handleModalClose()
            }
          }}
          onUpdate={handleStageUpdate}
        />
      )}
    </>
  )
}