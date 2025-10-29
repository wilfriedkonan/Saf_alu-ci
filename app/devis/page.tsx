// pages/devis/page.tsx
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
import { Plus, Search, FileText, Euro, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DevisListItem, 
  DevisStatut, 
  DevisStatutLabels, 
  DevisStatutColors,
  Devis
} from "@/types/devis"
import { useDevisList, useDevisStatistiques, useDevisActions } from "@/hooks/useDevis"
import { QuoteActions } from "@/components/quotes/quote-actions"
import { QuoteFormModal } from "@/components/quotes/quote-form-modal"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { useDevisService } from "@/services/devisService"

export default function DevisPage() {
  const [filteredDevis, setFilteredDevis] = useState<DevisListItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DevisStatut | "all">("all")
  const [showDevisForm, setShowDevisForm] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth() 
  const { canManageQuotes } = usePermissions()
  const canAccessQuotes = !!canManageQuotes()
  
  // Hooks personnalisés
  const { devis, loading: devisLoading, error: devisError, refreshDevis } = useDevisList()
  const { stats, loading: statsLoading, refreshStats } = useDevisStatistiques()
  const { createDevis, updateDevis, loading: actionLoading } = useDevisActions()
  const { getDevisById } = useDevisService()

  // Vérification des permissions
  useEffect(() => {
    if (!user || !canAccessQuotes) {
      router.push("/dashboard")
      return
    }
    console.log('stat verification:',stats)

  }, [user, canAccessQuotes, router])

  // Filtrage des devis
  useEffect(() => {
    let filtered = devis

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (devis) =>
          devis.numero.toLowerCase().includes(searchLower) ||
          devis.titre.toLowerCase().includes(searchLower) ||
          devis.client?.nom.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((devis) => devis.statut === statusFilter)
    }

    setFilteredDevis(filtered)
    console.log('valeur devis de filtered:',filtered)
  }, [devis, searchTerm, statusFilter])

  // État devis en édition
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null)

  // Gestionnaire création/modification
  const handleSubmitDevis = async (newDevisData: any) => {
    try {
      const response = editingDevis
        ? await updateDevis(editingDevis.id, newDevisData)
        : await createDevis(newDevisData)
      toast({
        title: editingDevis ? "Devis modifié" : "Devis créé",
        description: response.message || (editingDevis ? "Le devis a été modifié avec succès" : "Le devis a été créé avec succès"),
      })
      refreshDevis()
      refreshStats()
      setShowDevisForm(false)
      setEditingDevis(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : (editingDevis ? "Erreur lors de la modification du devis" : "Erreur lors de la création du devis"),
        variant: "destructive",
      })
    }
  }

  // Ouvrir modal en mode édition
  const handleEditDevis = async (item: any) => {
    try {
      const theOne = await getDevisById(item.id)
      setEditingDevis(theOne)
      setShowDevisForm(true)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger le devis",
        variant: "destructive",
      })
    }
  }

  // Formatage de la devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Vérification des permissions avant rendu
  if (!user || !canAccessQuotes) {
    return null
  }

  // Affichage du loader principal
  if (devisLoading && devis.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Devis</h1>
            <p className="text-muted-foreground">Créez, gérez et suivez vos devis clients</p>
          </div>
          <Button 
            onClick={() => { setEditingDevis(null); setShowDevisForm(true) }}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Nouveau devis
          </Button>
        </div>

        {/* Affichage des erreurs */}
        {devisError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{devisError}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total devis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.total}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.envoye + stats.enNegociation}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.valide}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur validée</CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(stats.montantValide)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
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
                    placeholder="Rechercher par numéro, client ou projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as DevisStatut | "all")}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Brouillon">Brouillon</SelectItem>
                  <SelectItem value="Envoye">Envoyé</SelectItem>
                  <SelectItem value="EnNegociation">En négociation</SelectItem>
                  <SelectItem value="Valide">Validé</SelectItem>
                  <SelectItem value="Refuse">Refusé</SelectItem>
                  <SelectItem value="Expire">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table des devis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liste des devis ({filteredDevis.length})</CardTitle>
              <CardDescription>Gérez vos devis avec toutes les actions disponibles</CardDescription>
            </div>
            {devisLoading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </CardHeader>
          <CardContent>
            {devisLoading && devis.length === 0 ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredDevis.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun devis trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Aucun devis ne correspond à vos critères de recherche."
                    : "Commencez par créer votre premier devis."
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setShowDevisForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un devis
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Projet</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Valide jusqu'au</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevis.map((devis) => (
                    <TableRow key={devis.id}>
                      <TableCell className="font-medium">{devis.numero}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{devis.client?.nom || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 truncate" title={devis.titre}>
                          {devis.titre}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(devis.montantTTC)}</TableCell>
                      <TableCell>
                        <Badge className={DevisStatutColors[devis.statut]}>
                          {DevisStatutLabels[devis.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(devis.dateCreation).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        {devis.dateValidite 
                          ? new Date(devis.dateValidite).toLocaleDateString("fr-FR")
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <QuoteActions 
                          devis={devis} 
                          onUpdate={() => {
                            refreshDevis()
                            refreshStats()
                          }}
                          onEdit={handleEditDevis}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de création de devis */}
      <QuoteFormModal 
        open={showDevisForm} 
        onOpenChange={(open) => { if (!open) setEditingDevis(null); setShowDevisForm(open) }} 
        onSubmit={handleSubmitDevis}
        devis={editingDevis || undefined}
        loading={actionLoading}
      />
    </DashboardLayout>
  )
}