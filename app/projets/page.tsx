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
import { Plus, Search, AlertTriangle, Hammer, Euro, Eye, Trash2 } from "lucide-react"
import { ProjectFormModal } from "@/components/projects/project-form-modal"
import {
  getProjects,
  getOverdueProjects,
  type Project,
  projectStatusLabels,
  projectStatusColors,
  priorityLabels,
  priorityColors,
  type ProjectStatus,
} from "@/lib/projects"
import { useAuth, usePermissions } from "@/contexts/AuthContext"

export default function ProjectsPage() {
  const {user}=useAuth();
  const {canManageProjects}=usePermissions();
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [showProjectForm, setShowProjectForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user || !canManageProjects) {
      router.push("/dashboard")
      return
    }

    const projectsData = getProjects()
    setProjects(projectsData)
    setFilteredProjects(projectsData)
  }, [user, router])

  useEffect(() => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getProjectStats = () => {
    const total = projects.length
    const active = projects.filter((p) => p.status === "en_cours").length
    const overdue = projects.filter((p) => p.status === "en_retard").length
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)

    return { total, active, overdue, totalBudget }
  }

  const handleCreateProject = (projectData: any) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setProjects([...projects, newProject])
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      setProjects(projects.filter((project) => project.id !== projectId))
    }
  }

  const overdueProjects = getOverdueProjects()
  const stats = getProjectStats()

  if (!user || !canManageProjects) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Projets</h1>
            <p className="text-muted-foreground">Suivez et gérez vos projets de construction</p>
          </div>
          <Button onClick={() => setShowProjectForm(true)}>
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
                      <p className="font-medium text-red-800">{project.name}</p>
                      <p className="text-sm text-red-600">
                        Prévu jusqu'au {new Date(project.endDate).toLocaleDateString("fr-FR")}
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
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
              <Hammer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget total</CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
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
                  <SelectItem value="planification">Planification</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.client.name}</div>
                        <div className="text-sm text-muted-foreground">{project.client.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(project.budget)}</div>
                        <div className="text-sm text-muted-foreground">
                          Dépensé: {formatCurrency(project.actualCost)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={project.progress} className="h-2" />
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={projectStatusColors[project.status]}>
                        {projectStatusLabels[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[project.priority]}>{priorityLabels[project.priority]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(project.startDate).toLocaleDateString("fr-FR")}</div>
                        <div className="text-muted-foreground">
                          {new Date(project.endDate).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/projets/${project.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal open={showProjectForm} onOpenChange={setShowProjectForm} onSubmit={handleCreateProject} />
    </DashboardLayout>
  )
}
