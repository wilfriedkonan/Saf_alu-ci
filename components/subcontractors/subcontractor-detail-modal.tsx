"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Building2, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react"
import { type Subcontractor, statusLabels, statusColors, specialtyLabels } from "@/lib/subcontractors"

interface SubcontractorDetailModalProps {
  subcontractor: Subcontractor
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function SubcontractorDetailModal({
  subcontractor,
  open,
  onOpenChange,
  onUpdate,
}: SubcontractorDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating})</span>
      </div>
    )
  }

  const getProjectStatusBadgeClass = (status: string) => {
    if (status === "termine") return "bg-green-100 text-green-800"
    if (status === "en_cours") return "bg-blue-100 text-blue-800"
    return "bg-red-100 text-red-800"
  }

  const getProjectStatusLabel = (status: string) => {
    if (status === "termine") return "Terminé"
    if (status === "en_cours") return "En cours"
    return "Annulé"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{subcontractor.name}</span>
            <Badge className={statusColors[subcontractor.status]}>{statusLabels[subcontractor.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{subcontractor.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{subcontractor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{subcontractor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{subcontractor.address}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Spécialités:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {subcontractor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialtyLabels[specialty]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Membre depuis:</span>
                    <span className="ml-2">{new Date(subcontractor.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{subcontractor.averageRating || "N/A"}</div>
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                  {subcontractor.averageRating > 0 && renderStars(Math.round(subcontractor.averageRating))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{subcontractor.totalProjects}</div>
                  <p className="text-sm text-muted-foreground">Projets total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{subcontractor.completedProjects}</div>
                  <p className="text-sm text-muted-foreground">Projets terminés</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{subcontractor.onTimeDelivery}%</div>
                  <p className="text-sm text-muted-foreground">Livraison à temps</p>
                  <Progress value={subcontractor.onTimeDelivery} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {subcontractor.documents.length > 0 ? (
                <div className="space-y-3">
                  {subcontractor.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • Ajouté le {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                            {doc.expiryDate && ` • Expire le ${new Date(doc.expiryDate).toLocaleDateString("fr-FR")}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={doc.isValid ? "default" : "destructive"}>
                        {doc.isValid ? "Valide" : "Expiré"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Aucun document ajouté</p>
              )}
            </CardContent>
          </Card>

          {/* Project History */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des projets</CardTitle>
            </CardHeader>
            <CardContent>
              {subcontractor.projectHistory.length > 0 ? (
                <div className="space-y-3">
                  {subcontractor.projectHistory.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{project.projectName}</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatCurrency(project.amount)}</span>
                            {project.rating && renderStars(project.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.role}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(project.startDate).toLocaleDateString("fr-FR")} -{" "}
                              {new Date(project.endDate).toLocaleDateString("fr-FR")}
                            </span>
                          </span>
                          <Badge variant="outline" className={getProjectStatusBadgeClass(project.status)}>
                            {getProjectStatusLabel(project.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Aucun projet dans l'historique</p>
              )}
            </CardContent>
          </Card>

          {/* Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle>Évaluations récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {subcontractor.evaluations.length > 0 ? (
                <div className="space-y-4">
                  {subcontractor.evaluations.slice(0, 3).map((evaluation) => (
                    <div key={evaluation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{evaluation.projectName}</p>
                        {renderStars(evaluation.rating)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">"{evaluation.comment}"</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Qualité:</span>
                          <div className="flex items-center space-x-1">{renderStars(evaluation.criteria.quality)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ponctualité:</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(evaluation.criteria.timeliness)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Communication:</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(evaluation.criteria.communication)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Professionnalisme:</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(evaluation.criteria.professionalism)}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Évalué par {evaluation.evaluatedBy} le{" "}
                        {new Date(evaluation.evaluatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Aucune évaluation disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {subcontractor.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{subcontractor.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
