"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, AlertTriangle, Hammer, Euro, Eye, Trash2, Loader2 } from "lucide-react"
import { ProjectFormModal } from "@/components/projects/project-form-modal"
import {
  type Project,
  projectStatusLabels,
  projectStatusColors,
  type ProjectStatus,
} from "@/types/projet"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import { useProjetsList, useProjetActions, useProjetStatistiques } from "@/hooks/useProjet"
import { toast } from "sonner"

export default function ProjectsPage() {
  const { user } = useAuth()
  const { canManageProjects } = usePermissions()
  const router = useRouter()

  // Hooks pour les projets
  const { projets, loading: loadingProjets, error: errorProjets, refreshProjets } = useProjetsList()
  const {
    loading: actionLoading,
    error: actionError,
    deleteProjet,
    clearError
  } = useProjetActions()
  const { stats, loading: loadingStats } = useProjetStatistiques()

  // États locaux
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [showProjectForm, setShowProjectForm] = useState(false)

  // Vérification des permissions
  useEffect(() => {
    if (!user || !canManageProjects) {
      router.push("/dashboard")
      return
    }
  }, [user, router, canManageProjects])

  // Filtrage des projets
  useEffect(() => {
    let filtered = projets

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.statut === statusFilter)
    }

    setFilteredProjects(filtered)
  }, [projets, searchTerm, statusFilter])



  // Affichage des erreurs
  useEffect(() => {
    if (errorProjets) {
      toast.error(errorProjets)
    }
    if (actionError) {
      toast.error(actionError)
    }
  }, [errorProjets, actionError])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Projets en retard (basés sur la date de fin prévue)
  const getOverdueProjects = () => {
    const today = new Date()
    return projets.filter((p) => {
      if (!p.dateFinPrevue || p.statut === "Termine") return false
      const endDate = new Date(p.dateFinPrevue)
      return endDate < today && (p.statut === "EnCours" || p.statut === "Planification")
    })
  }

  const handleCreateProject = async () => {
    try {
      // La logique de création sera gérée dans le modal
      toast.success("Projet créé avec succès")
      refreshProjets()
      setShowProjectForm(false)
    } catch (error) {
      toast.error("Erreur lors de la création du projet")
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return
    }

    try {
      await deleteProjet(projectId)
      toast.success("Projet supprimé avec succès")
      refreshProjets()
    } catch (error) {
      toast.error("Erreur lors de la suppression du projet")
    }
  }

  const overdueProjects = getOverdueProjects()

  // Vérification des permissions avant rendu
  if (!user || !canManageProjects) {
    return null
  }

  // État de chargement initial
  if (loadingProjets && projets.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Projets</h1>
            <p className="text-muted-foreground">Suivez et gérez vos projets de construction</p>
          </div>
          <Button onClick={() => setShowProjectForm(true)} disabled={actionLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </div>

        {/* Overdue Projects Alert */}
        {overdueProjects.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Projets en retard ({overdueProjects.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">{project.nom}</p>
                      <p className="text-sm text-red-600">
                        Prévu jusqu'au {project.dateFinPrevue ? new Date(project.dateFinPrevue).toLocaleDateString("fr-FR") : "N/A"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/projets/${project.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détail
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total projets</CardTitle>
              <Hammer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.totalProjets
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets en cours</CardTitle>
              <Hammer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.projetEncour
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget total</CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  formatCurrency(stats.budgetTotal)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, nom ou client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Planification">Planification</SelectItem>
                  <SelectItem value="EnCours">En cours</SelectItem>
                  <SelectItem value="Suspendu">Suspendu</SelectItem>
                  <SelectItem value="Termine">Terminé</SelectItem>
                  <SelectItem value="Annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des projets ({filteredProjects.length})</CardTitle>
            <CardDescription>Gérez vos projets de construction</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProjets && projets.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun projet trouvé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell
                        onClick={() => router.push(`/projets/${project.id}`)}
                      >
                        <div>
                          <div className="font-medium">{project.nom}</div>
                          <div className="text-sm text-muted-foreground">{project.numero}</div>
                          {project.isFromDqeConversion && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Depuis DQE
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => router.push(`/projets/${project.id}`)}
                      >
                        <div>
                          <div className="font-medium">{project.client?.nom || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.villeChantier || project.client?.adresse || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => router.push(`/projets/${project.id}`)}
                      >
                        <div>
                          <div className="font-medium">{formatCurrency(project.budgetInitial)}</div>
                          <div className="text-sm text-muted-foreground">
                            Dépensé: {formatCurrency(project.coutReel)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => router.push(`/projets/${project.id}`)}
                      >
                        <div className="space-y-1">
                          <Progress value={project.pourcentageAvancement} className="h-2" />
                          <span className="text-sm text-muted-foreground">{project.pourcentageAvancement}%</span>
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => router.push(`/projets/${project.id}`)}
                      >
                        <Badge className={projectStatusColors[project.statut]}>
                          {projectStatusLabels[project.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell
                        onClick={() => router.push(`/projets/${project.id}`)}
                      >
                        <div className="text-sm">
                          <div>
                            {project.dateDebut
                              ? new Date(project.dateDebut).toLocaleDateString("fr-FR")
                              : "N/A"}
                          </div>
                          <div className="text-muted-foreground">
                            {project.dateFinPrevue
                              ? new Date(project.dateFinPrevue).toLocaleDateString("fr-FR")
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/projets/${project.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        onSuccess={() => {
          refreshProjets()
        }}
      />
    </DashboardLayout>
  )
}