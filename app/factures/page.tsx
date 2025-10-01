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
import { Plus, Search, Receipt, Euro, AlertTriangle, TrendingUp, Trash2, Loader2 } from "lucide-react"
import { useInvoices, useInvoiceStats } from "@/hooks/useInvoices"
import type { InvoiceStatus, InvoiceType } from "@/lib/invoices"
import { invoiceStatusLabels, invoiceStatusColors, invoiceTypeLabels } from "@/lib/invoices"
import { InvoiceActions } from "@/components/invoices/invoice-actions"
import { InvoiceFormModal } from "@/components/invoices/invoice-form-modal"
import { useAuth, usePermissions } from "@/contexts/AuthContext"

export default function InvoicesPage() {
  const { user } = useAuth()
  const { canManageFinances } = usePermissions()
  const canAccessFinances = !!canManageFinances()
  const router = useRouter()

  // Hook principal pour les factures
  const {
    invoices,
    overdueInvoices,
    loading,
    error,
    getAll,
    getOverdue,
    create,
    remove,
    refresh,
    clearError,
  } = useInvoices(false) // Chargement manuel

  // Hook pour les statistiques
  const { stats } = useInvoiceStats(new Date().getFullYear())

  // États locaux pour les filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "all">("all")
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)

  // Vérifier les permissions
  useEffect(() => {
    if (!user || !canAccessFinances) {
      router.push("/dashboard")
      return
    }
    // Charger les données au montage
    getAll()
    getOverdue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, canAccessFinances, router])

  // Appliquer les filtres
  useEffect(() => {
    getAll({
      search: searchTerm,
      status: statusFilter,
      type: typeFilter,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, typeFilter])

  // Auto-dismiss des erreurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Gestion de la création
  const handleCreateInvoice = async (invoiceData: any) => {
    const newInvoice = await create(invoiceData)
    if (newInvoice) {
      setIsInvoiceFormOpen(false)
      refresh()
    }
  }

  // Gestion de la suppression
  const handleDeleteInvoice = async (id: string, number: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${number} ?`)) {
      const success = await remove(id)
      if (success) {
        refresh()
      }
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

  // Protection de la route
  if (!user || !canAccessFinances) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Factures</h1>
            <p className="text-muted-foreground">Créez, gérez et suivez vos factures clients</p>
          </div>
          <Button onClick={() => setIsInvoiceFormOpen(true)} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>

        {/* Alertes factures en retard */}
        {overdueInvoices.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Factures en retard ({overdueInvoices.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">
                        {invoice.number} - {invoice.clientName}
                      </p>
                      <p className="text-sm text-red-600">
                        Échéance: {new Date(invoice.dueDate).toLocaleDateString("fr-FR")} •{" "}
                        {formatCurrency(invoice.remainingAmount)}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </Badge>
                  </div>
                ))}
                {overdueInvoices.length > 3 && (
                  <p className="text-sm text-red-600">
                    Et {overdueInvoices.length - 3} autre(s) facture(s) en retard...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total factures</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total?stats.total:0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En retard</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdue?stats.overdue:0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impayées</CardTitle>
                <Euro className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalUnpaid?stats.totalUnpaid:0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus encaissés</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue?stats.totalRevenue:0)}</div>
              </CardContent>
            </Card>
          </div>
        )}

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
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "all")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoyee">Envoyée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                  <SelectItem value="partiellement_payee">Partiellement payée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as InvoiceType | "all")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="facture_devis">Facture Devis</SelectItem>
                  <SelectItem value="facture_sous_traitant">Facture Sous-traitant</SelectItem>
                  <SelectItem value="avoir">Avoir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Affichage des erreurs */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <Button variant="outline" size="sm" onClick={clearError}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des factures */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des factures ({invoices.length})</CardTitle>
            <CardDescription>Gérez vos factures avec suivi des paiements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune facture trouvée</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Projet</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Payé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoiceTypeLabels[invoice.type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.clientName}</div>
                          <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 truncate" title={invoice.projectTitle}>
                          {invoice.projectTitle}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</div>
                          {invoice.remainingAmount > 0 && (
                            <div className="text-sm text-red-600">Reste: {formatCurrency(invoice.remainingAmount)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[invoice.status]}>
                          {invoiceStatusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</div>
                          {invoice.remindersSent > 0 && (
                            <div className="text-xs text-muted-foreground">{invoice.remindersSent} relance(s)</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <InvoiceActions invoice={invoice} onUpdate={refresh} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id, invoice.number)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal de création */}
      <InvoiceFormModal
        isOpen={isInvoiceFormOpen}
        onClose={() => setIsInvoiceFormOpen(false)}
        onSubmit={handleCreateInvoice}
      />
    </DashboardLayout>
  )
}