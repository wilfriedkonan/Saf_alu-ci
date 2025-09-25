"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Building2, Calendar, Euro, Users, FileText, Upload } from "lucide-react"
import {
  getProjectById,
  type Project,
  projectStatusLabels,
  projectStatusColors,
  priorityLabels,
  priorityColors,
} from "@/lib/projects"
import { ProjectTimeline } from "@/components/projects/project-timeline"
import { SubcontractorOffersTable } from "@/components/projects/subcontractor-offers-table"
import { useAuth, usePermissions } from "@/contexts/AuthContext"

export default function ProjectDetailPage() {
  const {user}=useAuth();
  const {canManageProjects}=usePermissions();
  const [project, setProject] = useState<Project | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (!user || !canManageProjects) {
      router.push("/dashboard")
      return
    }

    const projectData = getProjectById(params.id as string)
    if (!projectData) {
      router.push("/projets")
      return
    }

    setProject(projectData)
  }, [user, router, params.id])

  const handleRefresh = () => {
    if (params.id) {
      const projectData = getProjectById(params.id as string)
      if(!projectData){
        return
      }
      setProject(projectData)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!user || !canManageProjects || !project) {
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
            <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
            <p className="text-muted-foreground">{project?.number}</p>
          </div>
          <div className="flex items-center space-x-2">
            {project&&<Badge className={projectStatusColors[project.status]}>{projectStatusLabels[project.status]}</Badge>}
            {project&&<Badge className={priorityColors[project.priority]}>{priorityLabels[project.priority]}</Badge>}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
              <p className="text-xs text-muted-foreground">
                Dépensé: {formatCurrency(project.actualCost)} ({Math.round((project.actualCost / project.budget) * 100)}
                %)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.progress}%</div>
              <Progress value={project.progress} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Équipe</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.team.workers.length + project.team.subcontractors.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {project.team.workers.length} ouvriers, {project.team.subcontractors.length} sous-traitants
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
                {Math.ceil(
                  (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24),
                )}{" "}
                j
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(project.startDate).toLocaleDateString("fr-FR")} -{" "}
                {new Date(project.endDate).toLocaleDateString("fr-FR")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="timeline">Planning</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="offers">Offres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{project.client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{project.client.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span>{project.client.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Adresse:</span>
                    <span>{project.client.address}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{project.description}</p>
                  {project.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm text-muted-foreground mt-1">{project.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <ProjectTimeline project={project} onUpdate={handleRefresh} />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Équipe du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Chef de projet</h4>
                  <Badge variant="outline">{project.team.projectManager}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ouvriers ({project.team.workers.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.team.workers.map((worker) => (
                      <Badge key={worker} variant="secondary">
                        {worker}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sous-traitants ({project.team.subcontractors.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.team.subcontractors.map((sub) => (
                      <Badge key={sub} variant="outline">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
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
                {project.documents.length > 0 ? (
                  <div className="space-y-3">
                    {project.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {Math.round(doc.size / 1024)} KB • Ajouté le{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun document ajouté</p>
                    <Button variant="outline" className="mt-2 bg-transparent">
                      Ajouter le premier document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <SubcontractorOffersTable project={project} onUpdate={handleRefresh} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
