"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  Download,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import {
  useMouvementsList,
  useTresorerie,
  useTresorerieStatistiques,
} from "@/hooks/useTresorerie"
import {
  categoriesMouvementList,
  calculateSoldeTotal,
  formatCurrency,
  formatDate,
  isSoldeFaible,
  isSoldeNegatif,
  typeMouvementColors,
  typeMouvementLabels,
  typesMouvementList,
  TypeCompte,
  TypeMouvement,
} from "@/types/tresorerie"
import { TransactionFormModal } from "@/components/treasury/transaction-form-modal"
import { CreateCompteRequest } from "@/types/tresorerie"
import { useToast } from "@/components/ui/use-toast"
import { ExpenseBreakdown } from "@/components/treasury/expense-breakdown"
import { CashFlowChart } from "@/components/treasury/cash-flow-chart"
import { RecentTransactions } from "@/components/treasury/recent-transactions"

type PeriodFilter = "week" | "month" | "quarter" | "year"

const initialCompteForm = {
  nom: "",
  banque: "",
  numero: "",
  typeCompte: "Courant" as TypeCompte,
  soldeInitial: "",
}

export default function TreasuryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { canManageTresorerie } = usePermissions()
  const { toast } = useToast()

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("month")
  const [selectedCompteId, setSelectedCompteId] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<"all" | TypeMouvement>("all")
  const [selectedCategorie, setSelectedCategorie] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [compteForm, setCompteForm] = useState(initialCompteForm)
  const [reportRange, setReportRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    return {
      dateDebut: start.toISOString().slice(0, 10),
      dateFin: end.toISOString().slice(0, 10),
    }
  })

  const {
    comptes: comptesData = [],
    loadingComptes,
    errorComptes,
    refreshComptes,
    createCompte,
    loadingCompteActions,
    exporterRapportPDF,
    exporterRapportExcel,
    loadingRapport,
    errorRapport,
  } = useTresorerie()

  const comptes = Array.isArray(comptesData) ? comptesData : []

  const statsParams = useMemo(() => {
    if (!reportRange.dateDebut || !reportRange.dateFin) {
      return undefined
    }
    return {
      dateDebut: new Date(reportRange.dateDebut).toISOString(),
      dateFin: new Date(reportRange.dateFin).toISOString(),
    }
  }, [reportRange])

  const {
    stats,
    loading: loadingStats,
    error: statsError,
    refreshStats,
  } = useTresorerieStatistiques(statsParams)

  const mouvementParams = useMemo(() => {
    const end = new Date()
    const start = new Date(end)

    switch (selectedPeriod) {
      case "week":
        start.setDate(end.getDate() - 7)
        break
      case "quarter":
        start.setMonth(end.getMonth() - 3)
        break
      case "year":
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        start.setMonth(end.getMonth() - 1)
    }

    const params: {
      compteId?: number
      typeMouvement?: string
      categorie?: string
      dateDebut: string
      dateFin: string
    } = {
      dateDebut: start.toISOString(),
      dateFin: end.toISOString(),
    }

    if (selectedCompteId && selectedCompteId !== "all") {
      params.compteId = Number(selectedCompteId)
      console.log("Compte envoyé =", params.compteId);
    }else {
      console.log("Aucun compte filtré");
    }
    if (selectedType !== "all") {
      params.typeMouvement = selectedType
    }
    if (selectedCategorie !== "all") {
      params.categorie = selectedCategorie
    }

    return params
  }, [selectedPeriod, selectedCompteId, selectedType, selectedCategorie])

  const {
    mouvements,
    loading: loadingMouvements,
    error: mouvementsError,
    refreshMouvements,
  } = useMouvementsList(mouvementParams)

  useEffect(() => {
    if (user && !canManageTresorerie) {
      router.replace("/dashboard")
    }
  }, [user, canManageTresorerie, router])

  const comptesMap = useMemo(() => {
    return new Map(comptes.map((compte) => [compte.id, compte]))
  }, [comptes])

  const totalSolde = useMemo(() => {
    if (stats?.soldeTotal !== undefined) {
      return stats.soldeTotal
    }
    return calculateSoldeTotal(comptes)
  }, [stats, comptes])

  const mouvementsList = Array.isArray(mouvements) ? mouvements : []

  const displayedMouvements = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return mouvementsList
      .filter((mouvement) => {
        if (!normalizedSearch) return true
        const haystack = `${mouvement.libelle} ${mouvement.description ?? ""} ${mouvement.categorie ?? ""}`.toLowerCase()
        return haystack.includes(normalizedSearch)
      })
      .sort((a, b) => new Date(b.dateMouvement).getTime() - new Date(a.dateMouvement).getTime())
      .slice()
  }, [mouvementsList, searchTerm])

  const compteAlerts = useMemo(() => {
    return comptes.flatMap((compte) => {
      const alerts: { niveau: "Critique" | "Attention"; message: string; valeur: number }[] = []
      if (isSoldeNegatif(compte)) {
        alerts.push({
          niveau: "Critique",
          message: `Le compte ${compte.nom} est en négatif`,
          valeur: compte.soldeActuel,
        })
      } else if (isSoldeFaible(compte)) {
        alerts.push({
          niveau: "Attention",
          message: `Le compte ${compte.nom} a un solde faible`,
          valeur: compte.soldeActuel,
        })
      }
      return alerts
    })
  }, [comptes])

  const handleCreateAccount = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    const soldeInitial = Number(compteForm.soldeInitial)
    if (isNaN(soldeInitial) || soldeInitial < 0) {
      toast({
        title: "Solde invalide",
        description: "Le solde initial doit être un nombre positif.",
        variant: "destructive",
      })
      return
    }

    const payload: CreateCompteRequest = {
      nom: compteForm.nom.trim(),
      typeCompte: compteForm.typeCompte,
      banque: compteForm.banque.trim() || undefined,
      numero: compteForm.numero.trim() || undefined,
      soldeInitial,
    }

    try {
      const response = await createCompte(payload)
      if (response?.success) {
        toast({
          title: "Compte créé",
          description: `Le compte ${payload.nom} a été créé avec succès.`,
        })
        setShowAddAccount(false)
        setCompteForm(initialCompteForm)
        refreshComptes()
        refreshStats()
      } else {
        throw new Error(response?.message || "Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le compte",
        variant: "destructive",
      })
    }
  }, [compteForm, createCompte, toast, refreshComptes, refreshStats])

  const handleRefresh = useCallback(() => {
    refreshComptes()
    refreshMouvements()
    refreshStats()
  }, [refreshComptes, refreshMouvements, refreshStats])

  const handleExportPDF = useCallback(async () => {
    try {
      await exporterRapportPDF({
        dateDebut: reportRange.dateDebut,
        dateFin: reportRange.dateFin,
      })
      toast({
        title: "Export réussi",
        description: "Le rapport PDF a été téléchargé avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Impossible d'exporter le rapport",
        variant: "destructive",
      })
    }
  }, [reportRange, exporterRapportPDF, toast])

  const handleExportExcel = useCallback(async () => {
    try {
      await exporterRapportExcel({
        dateDebut: reportRange.dateDebut,
        dateFin: reportRange.dateFin,
      })
      toast({
        title: "Export réussi",
        description: "Le rapport Excel a été téléchargé avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Impossible d'exporter le rapport",
        variant: "destructive",
      })
    }
  }, [reportRange, exporterRapportExcel, toast])

  if (!user || !canManageTresorerie) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trésorerie</h1>
            <p className="text-muted-foreground">Gérez vos comptes et mouvements financiers</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingComptes || loadingMouvements}>
              <RefreshCw className={`mr-2 h-4 w-4 ${(loadingComptes || loadingMouvements) ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button size="sm" onClick={() => setShowAddTransaction(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle transaction
            </Button>
          </div>
        </div>

        {/* Alertes */}
        {compteAlerts.length > 0 && (
          <Alert variant={compteAlerts.some((a) => a.niveau === "Critique") ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {compteAlerts.map((alert, index) => (
                  <div key={index}>
                    <span className="font-semibold">{alert.niveau}:</span> {alert.message} ({formatCurrency(alert.valeur)})
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* KPIs */}
       {user && user.Role?.Nom ==="super_admin" &&  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Solde Total Card with gradient */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-100">Solde total</CardTitle>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalSolde)}</div>
              <p className="text-sm text-blue-100">{comptes.length} compte(s) actif(s)</p>
            </CardContent>
          </Card>

          {/* Entrées Card with monthly and yearly data */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Entrées du mois</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {loadingStats ? "..." : formatCurrency(stats?.entreesMois || 0)}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Depuis le début du mois</p>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  {loadingStats ? "..." : formatCurrency(stats?.entreesAnnee || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Depuis le début de l'année</p>
              </div>
            </CardContent>
          </Card>

          {/* Sorties Card with monthly and yearly data */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sorties du mois</CardTitle>
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                {loadingStats ? "..." : formatCurrency(stats?.sortiesMois || 0)}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Depuis le début du mois</p>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  {loadingStats ? "..." : formatCurrency(stats?.sortiesAnnee || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Depuis le début de l'année</p>
              </div>
            </CardContent>
          </Card>

          {/* Résultat Net Card with monthly and yearly data */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Résultat net</CardTitle>
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold mb-2 ${
                  (stats?.beneficeMois || 0) >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {loadingStats ? "..." : formatCurrency(stats?.beneficeMois || 0)}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Bénéfice du mois</p>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div
                  className={`text-lg font-semibold mb-1 ${
                    (stats?.beneficeAnnee || 0) >= 0
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {loadingStats ? "..." : formatCurrency(stats?.beneficeAnnee || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Bénéfice de l'année</p>
              </div>
            </CardContent>
          </Card>
        </div>}

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CashFlowChart dateDebut={reportRange.dateDebut} dateFin={reportRange.dateFin} />
          <ExpenseBreakdown dateDebut={reportRange.dateDebut} dateFin={reportRange.dateFin} />
        </div>

        {/* Transactions récentes et Rapports */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mouvements récents</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedPeriod} onValueChange={(value: PeriodFilter) => setSelectedPeriod(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">7 derniers jours</SelectItem>
                      <SelectItem value="month">30 derniers jours</SelectItem>
                      <SelectItem value="quarter">3 derniers mois</SelectItem>
                      <SelectItem value="year">12 derniers mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un mouvement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select
                  value={selectedCompteId}
                  onValueChange={(value) => setSelectedCompteId(value)}
                >                  
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Compte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les comptes</SelectItem>
                    {comptes.map((compte) => (
                      <SelectItem
                        key={compte.id}
                        value={compte.id?.toString()}>
                        {compte.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={(value: "all" | TypeMouvement) => setSelectedType(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {typesMouvementList.map((type) => (
                      <SelectItem key={type} value={type}>
                        {typeMouvementLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categoriesMouvementList.map((categorie) => (
                      <SelectItem key={categorie} value={categorie}>
                        {categorie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <RecentTransactions
                mouvements={displayedMouvements}
                searchTerm={searchTerm}
                loading={loadingMouvements}
                error={mouvementsError}
                comptesMap={comptesMap}
              />
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Période de rapport</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="date"
                      value={reportRange.dateDebut}
                      onChange={(e) => setReportRange((prev) => ({ ...prev, dateDebut: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={reportRange.dateFin}
                      onChange={(e) => setReportRange((prev) => ({ ...prev, dateFin: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportPDF}
                  disabled={loadingRapport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exporter en PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportExcel}
                  disabled={loadingRapport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exporter en Excel
                </Button>
              </div>

              {errorRapport && (
                <Alert variant="destructive">
                  <AlertDescription>{errorRapport}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comptes bancaires */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comptes bancaires</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddAccount(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un compte
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingComptes && (
              <p className="text-sm text-muted-foreground">Chargement des comptes...</p>
            )}
            {comptes.length === 0 && !loadingComptes ? (
              <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucun compte enregistré pour le moment.
              </div>
            ) : (
              comptes.map((compte) => (
                <div key={compte.id} className="flex flex-col justify-between gap-4 rounded border p-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold text-gray-900">{compte.nom}</p>
                      <Badge variant={compte.actif ? "default" : "secondary"}>{compte.actif ? "Actif" : "Inactif"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{compte.banque || "Banque non renseignée"}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{compte.typeCompte}</Badge>
                      {compte.numero && <span>#{compte.numero}</span>}
                      <span>Créé le {formatDate(compte.dateCreation)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Solde actuel</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(compte.soldeActuel)}</p>
                    <p className="text-xs text-muted-foreground">Solde initial: {formatCurrency(compte.soldeInitial)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Nouvelle transaction */}
      <TransactionFormModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSuccess={() => {
          refreshMouvements()
          refreshComptes()
          refreshStats()
        }}
        comptes={comptes}
        loadingComptes={loadingComptes}
        errorComptes={errorComptes}
      />

      {/* Modal Nouveau compte */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un compte</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateAccount}>
            <div className="space-y-2">
              <Label>Nom du compte</Label>
              <Input value={compteForm.nom} onChange={(event) => setCompteForm((prev) => ({ ...prev, nom: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Banque</Label>
              <Input value={compteForm.banque} onChange={(event) => setCompteForm((prev) => ({ ...prev, banque: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Numéro de compte</Label>
              <Input value={compteForm.numero} onChange={(event) => setCompteForm((prev) => ({ ...prev, numero: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Type de compte</Label>
              <Select
                value={compteForm.typeCompte}
                onValueChange={(value: TypeCompte) => setCompteForm((prev) => ({ ...prev, typeCompte: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Courant">Courant</SelectItem>
                  <SelectItem value="Epargne">Épargne</SelectItem>
                  <SelectItem value="Caisse">Caisse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Solde initial (XOF)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={compteForm.soldeInitial}
                onChange={(event) => setCompteForm((prev) => ({ ...prev, soldeInitial: event.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddAccount(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loadingCompteActions}>
                {loadingCompteActions && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Créer le compte
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}