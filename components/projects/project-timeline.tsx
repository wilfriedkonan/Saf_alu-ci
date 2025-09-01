"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, Play } from "lucide-react"
import type { Project, ProjectStage } from "@/lib/projects"
import { StageProgressModal } from "./stage-progress-modal"

interface ProjectTimelineProps {
  project: Project
  onUpdate: () => void
}

export function ProjectTimeline({ project, onUpdate }: ProjectTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null)

  const getStageIcon = (stage: ProjectStage) => {
    switch (stage.status) {
      case "termine":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "en_cours":
        return <Play className="h-5 w-5 text-blue-600" />
      case "en_retard":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStageColor = (stage: ProjectStage) => {
    switch (stage.status) {
      case "termine":
        return "border-green-200 bg-green-50"
      case "en_cours":
        return "border-blue-200 bg-blue-50"
      case "en_retard":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Planning du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.stages.map((stage, index) => (
              <div key={stage.id} className="relative">
                {/* Timeline line */}
                {index < project.stages.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />}

                <div
                  className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer hover:shadow-md hover:border-[var(--hover-green)]/30 transition-all ${getStageColor(stage)}`}
                  onClick={() => setSelectedStage(stage)}
                >
                  <div className="flex-shrink-0 mt-1">{getStageIcon(stage)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{stage.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {stage.progress}%
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>

                    <div className="space-y-2">
                      <Progress value={stage.progress} className="h-2" />

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Assigné à: {stage.assignedTo}</span>
                        <span>
                          {new Date(stage.startDate).toLocaleDateString("fr-FR")} -{" "}
                          {new Date(stage.endDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {stage.evaluation && (
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${i < stage.evaluation!.rating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-muted-foreground">Évalué par {stage.evaluation.evaluatedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    Détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StageProgressModal
        stage={selectedStage}
        project={project}
        open={!!selectedStage}
        onOpenChange={(open) => !open && setSelectedStage(null)}
        onUpdate={onUpdate}
      />
    </>
  )
}
