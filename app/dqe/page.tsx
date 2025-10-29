"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Plus,
  FileDown,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  ArrowUpRight,
} from "lucide-react"
import {
  mockDQEs,
  getStatutLabel,
  getStatutColor,
  getConversionStateLabel,
  getConversionStateColor,
  formatCurrency,
  type DQE,
} from "@/lib/dqe"
import { useAuth, usePermissions } from "@/contexts/AuthContext"

export default function DQEPage() {

  const [dqes, setDqes] = useState<DQE[]>(mockDQEs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statutFilter, setStatutFilter] = useState<string>("tous")
  const [conversionFilter, setConversionFilter] = useState<string>("tous")
  const [selectedDQEs, setSelectedDQEs] = useState<string[]>([])

  const router = useRouter()
  const { user } = useAuth() 
  const { canManageDqe } = usePermissions()
  const canAccesDqe = !!canManageDqe()

    // Vérification des permissions
    useEffect(() => {
      if (!user || !canAccesDqe) {
        router.push("/dashboard")
        return
      }  
    }, [user, canAccesDqe, router])

  const filteredDQEs = dqes.filter((dqe) => {
    const matchesSearch =
      dqe.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dqe.nomProjet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dqe.client.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatut = statutFilter === "tous" || dqe.statut === statutFilter

    const matchesConversion = conversionFilter === "tous" || dqe.conversionState === conversionFilter

    return matchesSearch && matchesStatut && matchesConversion
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDQEs(filteredDQEs.map((dqe) => dqe.id))
    } else {
      setSelectedDQEs([])
    }
  }

  const handleSelectDQE = (dqeId: string, checked: boolean) => {
    if (checked) {
      setSelectedDQEs([...selectedDQEs, dqeId])
    } else {
      setSelectedDQEs(selectedDQEs.filter((id) => id !== dqeId))
    }
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatutFilter("tous")
    setConversionFilter("tous")
  }

  const handleExport = () => {
    console.log("Exporting DQEs to Excel...")
  }

  const handleConvertToProject = (dqeId: string) => {
    console.log("Converting DQE to project:", dqeId)
  }

  const handleViewProject = (projectRef: string) => {
    console.log("Viewing project:", projectRef)
  }

  const handleViewDetails = (dqeId: string) => {
    router.push(`/dqe/${dqeId}`)
  }
  
// Vérification des permissions avant rendu
  if (!user || !canAccesDqe) {
    return null
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des DQE</h1>
            <p className="text-muted-foreground">Décomposition Quantitative Estimative des projets</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleResetFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exporter Excel
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau DQE
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher (réf, projet, client)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut DQE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="validé">Validé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={conversionFilter} onValueChange={setConversionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="État conversion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les états</SelectItem>
                  <SelectItem value="converted">Convertis</SelectItem>
                  <SelectItem value="convertible">Convertibles</SelectItem>
                  <SelectItem value="not_convertible">Non convertibles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total DQE</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dqes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convertis</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dqes.filter((d) => d.conversionState === "converted").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convertibles</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dqes.filter((d) => d.conversionState === "convertible").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dqes.reduce((sum, d) => sum + d.budgetTotalHT, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table - Desktop */}
        <Card className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDQEs.length === filteredDQEs.length && filteredDQEs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Budget HT</TableHead>
                <TableHead>État Conversion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDQEs.map((dqe) => (
                <TableRow key={dqe.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDQEs.includes(dqe.id)}
                      onCheckedChange={(checked) => handleSelectDQE(dqe.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{dqe.reference}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{dqe.nomProjet}</div>
                      <div className="text-sm text-muted-foreground">{dqe.client}</div>
                      <div className="text-xs text-muted-foreground">
                        {dqe.dateCreation.toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatutColor(dqe.statut)}>{getStatutLabel(dqe.statut)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(dqe.budgetTotalHT)}</div>
                      <div className="text-xs text-muted-foreground">
                        {dqe.nombreLots} lot{dqe.nombreLots > 1 ? "s" : ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getConversionStateColor(dqe.conversionState)}>
                        {getConversionStateLabel(dqe.conversionState)}
                      </Badge>
                      {dqe.conversionState === "converted" && dqe.projetReference && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {dqe.projetReference}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dqe.projetStatut} - {dqe.projetAvancement}%
                          </div>
                        </div>
                      )}
                      {dqe.conversionState === "not_convertible" && (
                        <div className="text-xs text-muted-foreground">Validez le DQE pour le convertir</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(dqe.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        {dqe.conversionState === "convertible" && (
                          <DropdownMenuItem onClick={() => handleConvertToProject(dqe.id)}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Convertir en projet
                          </DropdownMenuItem>
                        )}
                        {dqe.conversionState === "converted" && dqe.projetReference && (
                          <DropdownMenuItem onClick={() => handleViewProject(dqe.projetReference!)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir projet
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Cards - Mobile */}
        <div className="grid gap-4 md:hidden">
          {filteredDQEs.map((dqe) => (
            <Card key={dqe.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{dqe.reference}</CardTitle>
                    <p className="text-sm text-muted-foreground">{dqe.nomProjet}</p>
                  </div>
                  <Checkbox
                    checked={selectedDQEs.includes(dqe.id)}
                    onCheckedChange={(checked) => handleSelectDQE(dqe.id, checked as boolean)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{dqe.client}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Statut:</span>
                  <Badge className={getStatutColor(dqe.statut)}>{getStatutLabel(dqe.statut)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget HT:</span>
                  <span className="font-medium">{formatCurrency(dqe.budgetTotalHT)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lots:</span>
                  <span>{dqe.nombreLots}</span>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Badge className={getConversionStateColor(dqe.conversionState)}>
                    {getConversionStateLabel(dqe.conversionState)}
                  </Badge>
                  {dqe.conversionState === "converted" && dqe.projetReference && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {dqe.projetReference}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dqe.projetStatut} - {dqe.projetAvancement}%
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleViewProject(dqe.projetReference!)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir projet
                      </Button>
                    </div>
                  )}
                  {dqe.conversionState === "convertible" && (
                    <Button size="sm" className="w-full" onClick={() => handleConvertToProject(dqe.id)}>
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Convertir en projet
                    </Button>
                  )}
                  {dqe.conversionState === "not_convertible" && (
                    <div className="text-xs text-muted-foreground">Validez le DQE pour le convertir</div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleViewDetails(dqe.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDQEs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucun DQE trouvé</p>
              <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres ou créez un nouveau DQE</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
