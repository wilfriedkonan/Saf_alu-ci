"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { type Subcontractor, addEvaluation } from "@/lib/subcontractors"
import { getProjects } from "@/lib/projects"
import { toast } from "@/hooks/use-toast"

interface EvaluationModalProps {
  subcontractor: Subcontractor
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function EvaluationModal({ subcontractor, open, onOpenChange, onUpdate }: EvaluationModalProps) {
  const [projectId, setProjectId] = useState("")
  const [overallRating, setOverallRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [timelinessRating, setTimelinessRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [professionalismRating, setProfessionalismRating] = useState(0)
  const [comment, setComment] = useState("")

  const projects = getProjects()

  const handleSubmit = () => {
    if (!projectId || overallRating === 0) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un projet et donner une note globale",
        variant: "destructive",
      })
      return
    }

    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const success = addEvaluation(subcontractor.id, {
      projectId,
      projectName: project.name,
      rating: overallRating,
      comment,
      evaluatedBy: "Marie Dubois", // In real app, get from current user
      criteria: {
        quality: qualityRating || overallRating,
        timeliness: timelinessRating || overallRating,
        communication: communicationRating || overallRating,
        professionalism: professionalismRating || overallRating,
      },
    })

    if (success) {
      onUpdate()
      onOpenChange(false)
      resetForm()
      toast({
        title: "Évaluation enregistrée",
        description: `L'évaluation de ${subcontractor.name} a été enregistrée`,
      })
    }
  }

  const resetForm = () => {
    setProjectId("")
    setOverallRating(0)
    setQualityRating(0)
    setTimelinessRating(0)
    setCommunicationRating(0)
    setProfessionalismRating(0)
    setComment("")
  }

  const renderStarRating = (rating: number, setRating: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const starClassName =
            star <= rating
              ? "text-2xl text-yellow-400 hover:text-yellow-400 transition-colors"
              : "text-2xl text-gray-300 hover:text-yellow-400 transition-colors"

          return (
            <button key={star} type="button" onClick={() => setRating(star)} className={starClassName}>
              <Star className="h-6 w-6 fill-current" />
            </button>
          )
        })}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Évaluer {subcontractor.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label>Projet concerné</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overall Rating */}
          {renderStarRating(overallRating, setOverallRating, "Note globale *")}

          {/* Detailed Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderStarRating(qualityRating, setQualityRating, "Qualité du travail")}
            {renderStarRating(timelinessRating, setTimelinessRating, "Respect des délais")}
            {renderStarRating(communicationRating, setCommunicationRating, "Communication")}
            {renderStarRating(professionalismRating, setProfessionalismRating, "Professionnalisme")}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Commentaire</Label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Commentaire sur la prestation..."
              className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Enregistrer l'évaluation
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
