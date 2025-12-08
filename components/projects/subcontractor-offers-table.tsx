"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageSquare, Check, X, Plus, AlertCircle } from "lucide-react"
import type { Project, SubcontractorOffer } from "@/types/projet"
import { toast } from "sonner"

interface SubcontractorOffersTableProps {
  projet: Project
  onUpdate: () => void
}

export function SubcontractorOffersTable({ projet, onUpdate }: SubcontractorOffersTableProps) {
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      en_attente: "En attente",
      acceptee: "Acceptée",
      refusee: "Refusée",
      en_negociation: "En négociation"
    }
    return labels[status] || status
  }

  const handleAcceptOffer = (offerId: string) => {
    // TODO: Implémenter l'appel API pour accepter l'offre
    toast.success("Offre acceptée avec succès")
    onUpdate()
  }

  const handleRejectOffer = (offerId: string) => {
    // TODO: Implémenter l'appel API pour refuser l'offre
    toast.success("Offre refusée")
    onUpdate()
  }

  const handleRequestQuote = () => {
    // TODO: Ouvrir un modal pour demander des devis
    toast.info("Fonctionnalité de demande de devis à venir")
  }

  const handleContactSubcontractor = (offerName: string) => {
    toast.info(`Contacter ${offerName} - Fonctionnalité à venir`)
  }

 

  const filteredOffers =
    selectedStage !== "all"
      ? projet.etapes?.filter((etape) => etape?.id?.toString() === selectedStage)
      : projet.etapes?.filter((etape) => etape.typeResponsable === "SousTraitant")

   return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Offres de sous-traitance</CardTitle>
          <Button size="sm" onClick={handleRequestQuote}>
            <Plus className="mr-2 h-4 w-4" />
            Demander des devis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stage Filter */}
          {projet.etapes && projet.etapes.length > 0 && (
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Filtrer par étape:</label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Toutes les étapes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les étapes</SelectItem>
                  {projet.etapes?.map((etape) => (
                    <SelectItem key={etape.id} value={etape.id?.toString() || ""}>
                      {etape.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Info message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Fonctionnalité de gestion des offres
                </p>
                <p className="text-sm text-blue-700">
                  Cette section permettra de gérer les offres des sous-traitants pour chaque étape du projet.
                  Vous pourrez :
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1 ml-2">
                  <li>Demander des devis aux sous-traitants</li>
                  <li>Comparer les offres reçues</li>
                  <li>Accepter ou refuser les propositions</li>
                  <li>Négocier les prix et délais</li>
                  <li>Assigner les sous-traitants aux étapes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Offers Table */}
          {filteredOffers && filteredOffers.length > 0 ? (
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
                {filteredOffers.map((offer: any) => {
                  const etape = projet.etapes?.find((e) => e?.id?.toString() === offer.stageId)
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
                      <TableCell>{etape?.nom || "Étape inconnue"}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(offer.price)}</TableCell>
                      <TableCell>{offer.estimatedDays} jours</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(offer.rating) 
                                    ? "text-yellow-400 fill-current" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({offer.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(offer.status)}>
                          {getStatusLabel(offer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {offer.status === "en_attente" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleAcceptOffer(offer.id)}
                                title="Accepter l'offre"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectOffer(offer.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Refuser l'offre"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleContactSubcontractor(offer.subcontractorName)}
                            title="Contacter le sous-traitant"
                          >
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
            <div className="text-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <MessageSquare className="h-12 w-12 opacity-50" />
                <div>
                  <p className="font-medium">Aucune offre disponible</p>
                  <p className="text-sm mt-1">
                    {selectedStage !== "all" 
                      ? "Aucune offre pour cette étape" 
                      : "Aucune offre reçue pour ce projet"}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleRequestQuote}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Demander des devis
                </Button>
              </div>
            </div>
          )}

          {/* Étapes avec sous-traitants */}
          {projet.etapes && projet.etapes.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium">Étapes assignées à des sous-traitants</h4>
              <div className="space-y-2">
                {projet.etapes
                  .filter(etape => etape.typeResponsable === "SousTraitant")
                  .map((etape) => (
                    <div 
                      key={etape.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Étape {etape.ordre}</Badge>
                        <span className="font-medium">{etape.nom}</span>
                        <Badge variant="secondary">🏢 Sous-traitant</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Budget: {formatCurrency(etape.budgetPrevu)}
                        </span>
                      </div>
                    </div>
                  ))}
                {projet.etapes.filter(e => e.typeResponsable === "SousTraitant").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune étape assignée à un sous-traitant pour le moment
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}