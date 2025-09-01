"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageSquare, Check, X, Plus } from "lucide-react"
import type { Project } from "@/lib/projects"
import { toast } from "@/hooks/use-toast"

interface SubcontractorOffersTableProps {
  project: Project
  onUpdate: () => void
}

export function SubcontractorOffersTable({ project, onUpdate }: SubcontractorOffersTableProps) {
  const [selectedStage, setSelectedStage] = useState<string>("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "acceptee":
        return "bg-green-100 text-green-800"
      case "refusee":
        return "bg-red-100 text-red-800"
      case "en_negociation":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAcceptOffer = (offerId: string) => {
    toast({
      title: "Offre acceptée",
      description: "L'offre du sous-traitant a été acceptée",
    })
  }

  const handleRejectOffer = (offerId: string) => {
    toast({
      title: "Offre refusée",
      description: "L'offre du sous-traitant a été refusée",
    })
  }

  const filteredOffers =
    selectedStage !== "all"
      ? project.subcontractorOffers.filter((offer) => offer.stageId === selectedStage)
      : project.subcontractorOffers

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Offres Sous-traitance</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Demander devis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stage Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Filtrer par étape:</label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Toutes les étapes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les étapes</SelectItem>
                {project.stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Offers Table */}
          {filteredOffers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sous-traitant</TableHead>
                  <TableHead>Étape</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Délai</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const stage = project.stages.find((s) => s.id === offer.stageId)
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{offer.subcontractorName}</div>
                          <div className="text-sm text-muted-foreground">
                            Soumis le {new Date(offer.submittedAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{stage?.name || "Étape inconnue"}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(offer.price)}</TableCell>
                      <TableCell>{offer.estimatedDays} jours</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(offer.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({offer.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(offer.status)}>
                          {offer.status === "acceptee"
                            ? "Acceptée"
                            : offer.status === "refusee"
                              ? "Refusée"
                              : offer.status === "en_negociation"
                                ? "En négociation"
                                : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {offer.status === "en_attente" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleAcceptOffer(offer.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectOffer(offer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune offre pour {selectedStage !== "all" ? "cette étape" : "ce projet"}</p>
              <Button variant="outline" className="mt-2 bg-transparent">
                Demander des devis
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
