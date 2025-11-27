"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, FileText, Download, Edit, Trash2, Eye, Briefcase, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DQEFormModal } from "@/components/dqe/dqe-form-modal"
import { useDqe, useDqeStats, useDqeExport } from "@/hooks/useDqe"
import { 
  formatCurrency, 
  formatDate,
  DQE_STATUT_LABELS, 
  DQE_STATUT_COLORS,
  isDQEConvertible,
  getConversionStatus,
  type DQE,
  type DQEStatut
} from "@/types/dqe"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function DQEListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DQEStatut | "all">("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDQE, setEditingDQE] = useState<DQE | null>(null)

  // Hooks personnalisés
  const { dqes, loading, error, fetchDQE, deleteDQE, validateDQE } = useDqe()
  const { stats, loading: statsLoading } = useDqeStats()
  const { exportExcel, exportPDF, loading: exportLoading } = useDqeExport()

  // Charger les DQE au montage du composant
  useEffect(() => {
    if (statusFilter === "all") {
      fetchDQE()
    } else {
      fetchDQE({ statut: statusFilter })
    }
  }, [statusFilter, fetchDQE])

  // Filtrer les DQE selon la recherche
  const filteredDQEs = dqes.filter((dqe) => {
    const matchesSearch = 
      dqe.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dqe.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dqe.client?.nom.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleView = (id: number) => {
    router.push(`/dqe/${id}`)
  }

  const handleEdit = (dqe: DQE) => {
    setEditingDQE(dqe)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce DQE ?")) {
      await deleteDQE(id)
    }
  }

  const handleValidate = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir valider ce DQE ?")) {
      await validateDQE(id)
    }
  }

  const handleConvert = (id: number) => {
    router.push(`/dqe/${id}?action=convert`)
  }

  const handleExportExcel = async (id: number) => {
    await exportExcel(id)
  }

  const handleExportPDF = async (id: number) => {
    await exportPDF(id)
  }

  const getStatusBadgeColor = (statut: DQEStatut) => {
    const colors = DQE_STATUT_COLORS[statut]
    return colors
  }

  const getConversionBadge = (dqe: DQE) => {
    const status = getConversionStatus(dqe)
    
    if (status === 'converted') {
      return <Badge className="bg-purple-500">Converti</Badge>
    } else if (status === 'convertible') {
      return <Badge className="bg-emerald-500">Convertible</Badge>
    }
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">DQE (Décomposition Quantitative Estimative)</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos DQE et convertissez-les en projets
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau DQE
          </Button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total DQE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.totalBudgetHT)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Convertibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.convertible}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.budgetConvertible)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Convertis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.converti}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.tauxConversion.toFixed(1)}% de conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En brouillon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.brouillon}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  En cours de création
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence, nom ou client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as DQEStatut | "all")}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="validé">Validé</SelectItem>
                  <SelectItem value="refusé">Refusé</SelectItem>
                  <SelectItem value="archivé">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <Button onClick={() => fetchDQE()} className="mt-4">
                  Réessayer
                </Button>
              </div>
            ) : filteredDQEs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun DQE trouvé</p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier DQE
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Conversion</TableHead>
                      <TableHead className="text-right">Budget HT</TableHead>
                      <TableHead>Date création</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDQEs.map((dqe) => (
                      <TableRow key={dqe.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell 
                          className="font-medium"
                          onClick={() => handleView(dqe.id)}
                        >
                          {dqe.reference}
                        </TableCell>
                        <TableCell onClick={() => handleView(dqe.id)}>
                          {dqe.nom}
                        </TableCell>
                        <TableCell onClick={() => handleView(dqe.id)}>
                          {dqe.client?.nom || '-'}
                        </TableCell>
                        <TableCell onClick={() => handleView(dqe.id)}>
                          <Badge className={getStatusBadgeColor(dqe.statut)}>
                            {DQE_STATUT_LABELS[dqe.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleView(dqe.id)}>
                          {getConversionBadge(dqe)}
                        </TableCell>
                        <TableCell 
                          className="text-right font-semibold"
                          onClick={() => handleView(dqe.id)}
                        >
                          {formatCurrency(dqe.totalRevenueHT)}
                        </TableCell>
                        <TableCell onClick={() => handleView(dqe.id)}>
                          {formatDate(dqe.dateCreation)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(dqe.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              
                              {!dqe.isConverted && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(dqe)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  
                                  {dqe.statut === 'brouillon' && (
                                    <DropdownMenuItem onClick={() => handleValidate(dqe.id)}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Valider
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {isDQEConvertible(dqe) && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleConvert(dqe.id)}
                                        className="text-emerald-600"
                                      >
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Convertir en projet
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleExportPDF(dqe.id)}
                                disabled={exportLoading}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Export PDF
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => handleExportExcel(dqe.id)}
                                disabled={exportLoading}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export Excel
                              </DropdownMenuItem>
                              
                              {!dqe.isConverted && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(dqe.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de création/édition */}
      <DQEFormModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open)
          if (!open) setEditingDQE(null)
        }}
        editData={editingDQE}
        onSubmit={async () => {
          const params = statusFilter === "all" ? undefined : { statut: statusFilter }
          await fetchDQE(params)
          setShowCreateModal(false)
          setEditingDQE(null)
        }}
      />
    </DashboardLayout>
  )
}