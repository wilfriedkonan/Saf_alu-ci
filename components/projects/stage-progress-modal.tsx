"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Upload } from "lucide-react"
import type { Project, ProjectStage } from "@/lib/projects"
import { updateStageProgress, addStageEvaluation } from "@/lib/projects"
import { toast } from "@/hooks/use-toast"

interface StageProgressModalProps {
  stage: ProjectStage | null
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function StageProgressModal({ stage, project, open, onOpenChange, onUpdate }: StageProgressModalProps) {
  const [progress, setProgress] = useState(stage?.progress || 0)
  const [rating, setRating] = useState(stage?.evaluation?.rating || 0)
  const [comment, setComment] = useState(stage?.evaluation?.comment || "")
  const [newAssignee, setNewAssignee] = useState(stage?.assignedTo || "")
  const [changeReason, setChangeReason] = useState("")

  if (!stage) return null

  const handleSaveProgress = () => {
    const success = updateStageProgress(project.id, stage.id, progress)
    if (success) {
      onUpdate()
      toast({
        title: "Progression mise à jour",
        description: `La progression de "${stage.name}" a été mise à jour à ${progress}%`,
      })
    }
  }

  const handleSaveEvaluation = () => {
    if (rating === 0) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez donner une note avant de sauvegarder",
        variant: "destructive",
      })
      return
    }

    const success = addStageEvaluation(project.id, stage.id, {
      rating,
      comment,
      evaluatedBy: "Marie Dubois", // In real app, get from current user
    })

    if (success) {
      onUpdate()
      toast({
        title: "Évaluation enregistrée",
        description: `L'évaluation de "${stage.name}" a été enregistrée`,
      })
    }
  }

  const handleAssigneeChange = () => {
    if (newAssignee !== stage.assignedTo && changeReason.trim()) {
      // In real app, update the assignee
      toast({
        title: "Assignation modifiée",
        description: `"${stage.name}" a été réassigné à ${newAssignee}`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Progression - {stage.name}</span>
            <Badge variant="outline">{stage.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stage Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Période</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(stage.startDate).toLocaleDateString("fr-FR")} -{" "}
                {new Date(stage.endDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Progression ({progress}%)</Label>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <Button onClick={handleSaveProgress} size="sm">
              Mettre à jour la progression
            </Button>
          </div>

          {/* Evaluation */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Évaluation de l'exécutant</Label>

            <div className="space-y-2">
              <Label className="text-sm">Note (1-5 étoiles)</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                placeholder="Commentaire sur la qualité du travail..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            {stage.evaluation ? (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Évaluation existante:</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < stage.evaluation!.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    par {stage.evaluation.evaluatedBy} le{" "}
                    {new Date(stage.evaluation.evaluatedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {stage.evaluation.comment && (
                  <p className="text-sm text-muted-foreground mt-2">"{stage.evaluation.comment}"</p>
                )}
              </div>
            ) : (
              <Button onClick={handleSaveEvaluation} variant="outline" size="sm">
                Enregistrer l'évaluation
              </Button>
            )}
          </div>

          {/* Photos Upload */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Photos avant/après</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Glissez vos photos ici ou cliquez pour sélectionner</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                Choisir des fichiers
              </Button>
            </div>
          </div>

          {/* Change Assignee */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Changer l'exécutant</Label>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Nouvel exécutant</Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {project.team.workers.map((worker) => (
                      <SelectItem key={worker} value={worker}>
                        {worker}
                      </SelectItem>
                    ))}
                    {project.team.subcontractors.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Raison du changement</Label>
                <Textarea
                  placeholder="Raison..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            {newAssignee !== stage.assignedTo && (
              <Button onClick={handleAssigneeChange} variant="outline" size="sm">
                Confirmer le changement
              </Button>
            )}
          </div>

          {/* History */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Historique des modifications</Label>
            <div className="space-y-2">
              <div className="flex items-start space-x-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p>Progression mise à jour à {stage.progress}%</p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures par Marie Dubois</p>
                </div>
              </div>
              {stage.evaluation && (
                <div className="flex items-start space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p>Évaluation ajoutée ({stage.evaluation.rating} étoiles)</p>
                    <p className="text-xs text-muted-foreground">
                      Le {new Date(stage.evaluation.evaluatedAt).toLocaleDateString("fr-FR")} par{" "}
                      {stage.evaluation.evaluatedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
