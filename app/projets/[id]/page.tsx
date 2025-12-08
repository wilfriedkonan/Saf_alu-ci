"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Euro,
  Users,
  FileText,
  Upload,
  Loader2,
  MapPin,
  User,
  Briefcase,
  Edit
} from "lucide-react"
import {
  type Project,
  projectStatusLabels,
  projectStatusColors,
} from "@/types/projet"
import { ProjectTimeline } from "@/components/projects/project-timeline"
import { SubcontractorOffersTable } from "@/components/projects/subcontractor-offers-table"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import { ProjectDQELinkBanner } from "@/components/projects/project-dqe-link-banner"
import { ProjectFormModal } from "@/components/projects/project-form-modal"
import { useProjet } from "@/hooks/useProjet"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const { user } = useAuth()
  const { canManageProjects } = usePermissions()
  const router = useRouter()
  const params = useParams()

  const projectId = params.id ? parseInt(params.id as string) : null
  const { projet, loading, error, refreshProjet } = useProjet(projectId)

  const [showEditModal, setShowEditModal] = useState(false)
  // ✅ État pour préserver l'onglet actif lors du refresh
  const [activeTab, setActiveTab] = useState("overview")

  const totalDepenseProjet = projet?.depenseProjet
    ?.filter((mvt) => mvt.typeMouvement === "Sortie")
    ?.reduce((sum, mvt) => sum + mvt.montant, 0) ?? 0;


  // Redirection si projet non trouvé
  useEffect(() => {
    if (!loading && !projet && projectId) {
      toast.error("Projet non trouvé")
      router.push("/projets")
    }
  }, [loading, projet, projectId, router])

  const handleRefresh = () => {
    refreshProjet()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateBudgetPercentage = (actual: number, total: number) => {
    if (total === 0) return 0
    return Math.round((actual / total) * 100)
  }
  const totalDepenses = projet ? projet.etapes
    ?.reduce((sum, etape) => sum + (etape.depense || 0), 0) : 0;

  // États de chargement et permissions
  if (!user || !canManageProjects) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!projet) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/projets")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux projets
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{projet.nom}</h1>
            <p className="text-muted-foreground">{projet.numero}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Badge className={projectStatusColors[projet.statut]}>
              {projectStatusLabels[projet.statut]}
            </Badge>
            {projet.typeProjet && (
              <Badge
                variant="outline"
                style={{
                  borderColor: projet.typeProjet.couleur,
                  color: projet.typeProjet.couleur
                }}
              >
                {projet.typeProjet.nom}
              </Badge>
            )}
          </div>
        </div>

        {/* DQE Link Banner */}
        {projet.isFromDqeConversion && (
          <ProjectDQELinkBanner
            project={{
              linkedDqeId: projet.linkedDqeId?.toString() || null,
              linkedDqeReference: projet.linkedDqeReference || "",
              linkedDqeName: projet.linkedDqeName || "",
              linkedDqeBudgetHT: projet.linkedDqeBudgetHT || 0,
              clientName: projet.client?.nom || "",
              convertedAt: projet.dqeConvertedAt || "",
              convertedByName: projet.dqeConvertedBy ?
                `${projet.dqeConvertedBy.prenom} ${projet.dqeConvertedBy.nom}` : "",
            }}
          />
        )}

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(projet.budgetInitial)}</div>
              <p className="text-xs text-muted-foreground">
                Coût réel: {formatCurrency(projet.coutReel)}
              </p>
              <p className="text-xs text-muted-foreground">
                Dépensé : {formatCurrency(totalDepenses ?? 0)}
                {" "}(
                {calculateBudgetPercentage(totalDepenses ?? 0, projet.coutReel)}%
                )
              </p>
              <p className="text-xs text-muted-foreground">
                Marge: {formatCurrency(projet.budgetInitial - projet.coutReel)}
              </p>
              {projet.budgetRevise !== projet.budgetInitial && (
                <p className="text-xs text-amber-600 mt-1">
                  Révisé: {formatCurrency(projet.budgetRevise)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projet.pourcentageAvancement}%</div>
              <Progress value={projet.pourcentageAvancement} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Étapes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projet.etapes?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {projet.etapes?.filter(e => e.statut === "Termine").length || 0} terminées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateDuration(projet.dateDebut, projet.dateFinPrevue)} j
              </div>
              <p className="text-xs text-muted-foreground">
                {projet.dateDebut
                  ? new Date(projet.dateDebut).toLocaleDateString("fr-FR")
                  : "Non défini"} - {projet.dateFinPrevue
                    ? new Date(projet.dateFinPrevue).toLocaleDateString("fr-FR")
                    : "Non défini"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="timeline">Planning</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="location">Localisation</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="offers">Offres</TabsTrigger>
            <TabsTrigger value="depenses">Dépenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projet.client ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{projet.client.nom}</span>
                      </div>
                      {projet.client.email && (
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground text-sm">Email:</span>
                          <span className="text-sm">{projet.client.email}</span>
                        </div>
                      )}
                      {projet.client.telephone && (
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground text-sm">Téléphone:</span>
                          <span className="text-sm">{projet.client.telephone}</span>
                        </div>
                      )}
                      {projet.client.adresse && (
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground text-sm">Adresse:</span>
                          <span className="text-sm">{projet.client.adresse}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Aucune information client disponible</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {projet.description || "Aucune description disponible"}
                  </p>

                  {/* Informations supplémentaires */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Créé le:</span>
                      <span>{new Date(projet.dateCreation).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dernière modification:</span>
                      <span>{new Date(projet.dateModification).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {projet.typeProjet && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type de projet:</span>
                        <Badge variant="outline">{projet.typeProjet.nom}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Budget initial</span>
                    <span className="font-medium">{formatCurrency(projet.budgetInitial)}</span>
                  </div>
                  {projet.budgetRevise !== projet.budgetInitial && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget révisé</span>
                      <span className="font-medium">{formatCurrency(projet.budgetRevise)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coût réel</span>
                    <span className="font-medium">{formatCurrency(projet.coutReel)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Budget restant</span>
                    <span className={`font-medium ${(projet.budgetRevise - projet.coutReel) < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                      {formatCurrency(projet.budgetRevise - projet.coutReel)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <ProjectTimeline projet={projet} onUpdate={handleRefresh} />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Équipe du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chef de projet */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Chef de projet
                  </h4>
                  {projet.chefProjet ? (
                    <Badge variant="outline">
                      {projet.chefProjet.prenom} {projet.chefProjet.nom}
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non assigné</p>
                  )}
                </div>

                {/* Étapes et responsables */}
                {projet.etapes && projet.etapes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Responsables d'étapes
                    </h4>
                    <div className="space-y-2">
                      {projet.etapes
                        .filter(etape => etape.idSousTraitant)
                        .map((etape) => (
                          <div
                            key={etape.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <span className="text-sm">{etape.nom}</span>
                            <Badge variant="secondary">
                              <div className="items-center justify-between text-xs">
                                {etape.typeResponsable === "Interne" ? "Interne" : etape?.sousTraitant?.nom}
                                <div className="flex flex-col">
                                  {etape.typeResponsable === "Interne" ? "Interne" : etape?.sousTraitant?.telephone}
                                </div>
                              </div>

                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation du chantier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projet.adresseChantier || projet.villeChantier ? (
                  <>
                    {projet.adresseChantier && (
                      <div>
                        <span className="text-sm text-muted-foreground">Adresse:</span>
                        <p className="font-medium">{projet.adresseChantier}</p>
                      </div>
                    )}
                    <div className="flex gap-4">
                      {projet.codePostalChantier && (
                        <div>
                          <span className="text-sm text-muted-foreground">Code postal:</span>
                          <p className="font-medium">{projet.codePostalChantier}</p>
                        </div>
                      )}
                      {projet.villeChantier && (
                        <div>
                          <span className="text-sm text-muted-foreground">Ville:</span>
                          <p className="font-medium">{projet.villeChantier}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Aucune localisation spécifiée pour ce chantier
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Documents du projet</CardTitle>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Ajouter document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fonctionnalité de gestion des documents à venir</p>
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Ajouter le premier document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <SubcontractorOffersTable projet={projet} onUpdate={handleRefresh} />
          </TabsContent>
          <TabsContent value="depenses" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Titre */}
                  <Label className="text-base font-medium flex items-center gap-2">
                    Historique des dépenses du projet
                  </Label>

                  {/* 🔥 LISTE DES MOUVEMENTS FINANCIERS 🔥 */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Mouvements financiers</h3>

                    {/* Si aucun mouvement */}
                    {(!projet?.depenseProjet || projet.depenseProjet.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun mouvement enregistré pour le moment
                      </p>
                    )}

                    {/* Liste */}
                    <div className="space-y-3">
                      {projet?.depenseProjet?.map((mvt) => (
                        <div
                          key={mvt.id}
                          className="flex items-start justify-between border rounded-lg p-3 bg-muted/30"
                        >
                          <div className="flex items-start space-x-3">
                            {/* Pastille */}
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

                          {/* Montant */}
                          <p
                            className={`font-semibold ${mvt.typeMouvement === "Sortie" ? "text-red-600" : "text-green-700"
                              }`}
                          >
                            {mvt.typeMouvement === "Sortie" ? "-" : "+"}
                            {mvt.montant.toLocaleString("fr-FR")} F
                          </p>
                        </div>
                      ))}
                          <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-medium flex items-center gap-2">
                      Total dépense projet :
                      <span className="text-red-600 font-bold">
                        {totalDepenseProjet.toLocaleString("fr-FR")} F
                      </span>
                    </p>
                  </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de modification du projet */}
      <ProjectFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        projet={projet}
        onSuccess={() => {
          refreshProjet()
          toast.success("Le projet a été mis à jour")
        }}
      />
    </DashboardLayout>
  )
}