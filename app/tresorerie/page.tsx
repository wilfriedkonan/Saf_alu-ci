"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  Download,
  History,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
import { ScrollArea } from "@/components/ui/scroll-area"
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
import type { Compte, MouvementFinancier } from "@/types/tresorerie"
import { cn } from "@/lib/utils"

type PeriodFilter = "week" | "month" | "quarter" | "year"

// ── Modale historique complet ─────────────────────────────────

function HistoriqueMouvementsModal({
  open, onOpenChange, comptes,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  comptes: Compte[]
}) {
  const [filtreCompte, setFiltreCompte] = useState("all")
  const [dateDebut, setDateDebut] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString().slice(0, 10)
  })
  const [dateFin, setDateFin] = useState(() => new Date().toISOString().slice(0, 10))
  const [filtreType, setFiltreType] = useState<"all" | TypeMouvement>("all")
  const [recherche, setRecherche] = useState("")

  const mouvementParams = useMemo(() => ({
    compteId: filtreCompte !== "all" ? Number(filtreCompte) : undefined,
    typeMouvement: filtreType !== "all" ? filtreType : undefined,
    dateDebut: dateDebut ? new Date(dateDebut).toISOString() : undefined,
    dateFin: dateFin ? (() => { const d = new Date(dateFin); d.setHours(23, 59, 59, 999); return d.toISOString() })() : undefined,
  }), [filtreCompte, filtreType, dateDebut, dateFin])

  const { mouvements, loading } = useMouvementsList(mouvementParams)

  const compteSelectionne = filtreCompte !== "all"
    ? comptes.find(c => c.id === Number(filtreCompte)) ?? null
    : null

  const liste = useMemo(() => {
    const raw = Array.isArray(mouvements) ? mouvements : []
    const q = recherche.trim().toLowerCase()
    return raw
      .filter(m => !q || `${m.libelle} ${m.description ?? ""} ${m.categorie ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.dateMouvement).getTime() - new Date(a.dateMouvement).getTime())
  }, [mouvements, recherche])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[96vw] !max-w-[96vw] h-[96vh] max-h-[96vh] flex flex-col p-0 gap-0">

        {/* En-tête */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2.5 text-lg">
              <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <History className="h-4 w-4 text-primary" />
              </div>
              Historique complet des mouvements
            </DialogTitle>
            {/* Barre de recherche dans le header */}
            <div className="relative w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher…"
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </DialogHeader>

        {/* Filtres */}
        <div className="px-6 py-3 border-b shrink-0 bg-muted/20">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Compte</p>
              <Select value={filtreCompte} onValueChange={setFiltreCompte}>
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue placeholder="Tous les comptes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {comptes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Type</p>
              <Select value={filtreType} onValueChange={(v) => setFiltreType(v as "all" | TypeMouvement)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {typesMouvementList.map(t => (
                    <SelectItem key={t} value={t}>{typeMouvementLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Du</p>
              <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="w-[145px] h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Au</p>
              <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="w-[145px] h-9" />
            </div>

            {/* Solde du compte sélectionné — inline dans la barre de filtres */}
            {compteSelectionne && (
              <div className="ml-auto flex items-center gap-4 rounded-lg border bg-background px-4 py-2">
                <div>
                  <p className="font-semibold text-sm leading-tight">{compteSelectionne.nom}</p>
                  <p className="text-xs text-muted-foreground">{compteSelectionne.banque || "Banque non renseignée"} · {compteSelectionne.typeCompte}</p>
                </div>
                <div className="text-right border-l pl-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Solde actuel</p>
                  <p className={cn("text-lg font-bold leading-tight", compteSelectionne.soldeActuel >= 0 ? "text-green-600" : "text-red-600")}>
                    {formatCurrency(compteSelectionne.soldeActuel)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tableau */}
        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : liste.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <History className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Aucun mouvement trouvé</p>
              <p className="text-xs">Modifiez les filtres ou la période</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[105px] pl-6">Date</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="w-[160px]">Catégorie</TableHead>
                  <TableHead className="w-[110px]">Mode</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  {filtreCompte === "all" && <TableHead className="w-[200px]">Compte</TableHead>}
                  <TableHead className="text-right w-[140px] pr-6">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liste.map(m => {
                  const raw = m as any
                  const couleur: string = raw.couleur ?? (m.typeMouvement === "Entree" ? "#10b981" : m.typeMouvement === "Sortie" ? "#ef4444" : "#3b82f6")
                  const signe = m.typeMouvement === "Entree" ? "+" : m.typeMouvement === "Sortie" ? "−" : ""
                  const compteNom: string = raw.compte?.nom ?? "—"
                  const modePaiement: string | null = raw.modePaiement ?? null
                  const reference: string | null = raw.reference ?? null
                  return (
                    <TableRow key={m.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-6">
                        <p className="text-sm font-medium">{formatDate(m.dateMouvement)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(raw.dateSaisie ?? m.dateMouvement).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-sm leading-tight">{m.libelle}</p>
                        {m.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[320px]">{m.description}</p>
                        )}
                        {reference && (
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Réf. {reference}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {m.categorie ? (
                          <Badge variant="outline" className="text-xs font-normal">{m.categorie}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {modePaiement ? (
                          <Badge variant="secondary" className="text-xs font-normal">{modePaiement}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", typeMouvementColors[m.typeMouvement as TypeMouvement])}>
                          {typeMouvementLabels[m.typeMouvement as TypeMouvement] ?? m.typeMouvement}
                        </Badge>
                      </TableCell>
                      {filtreCompte === "all" && (
                        <TableCell className="text-sm text-muted-foreground">{compteNom}</TableCell>
                      )}
                      <TableCell className="text-right pr-6">
                        <span className="font-bold text-sm" style={{ color: couleur }}>
                          {signe}{formatCurrency(m.montant)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {/* Pied */}
        <div className="px-6 py-3 border-t shrink-0 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          {loading ? (
            <span className="text-sm text-muted-foreground">Chargement…</span>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-muted-foreground">{liste.length} mouvement{liste.length !== 1 ? "s" : ""}</span>
              <span className="text-sm font-medium text-green-600">
                + {formatCurrency(liste.filter(m => m.typeMouvement === "Entree").reduce((s, m) => s + m.montant, 0))}
              </span>
              <span className="text-sm font-medium text-red-500">
                − {formatCurrency(liste.filter(m => m.typeMouvement === "Sortie").reduce((s, m) => s + m.montant, 0))}
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Fermer</Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

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
  const [showHistorique, setShowHistorique] = useState(false)
  const [editingMouvement, setEditingMouvement] = useState<MouvementFinancier | null>(null)
  const [deletingMouvement, setDeletingMouvement] = useState<MouvementFinancier | null>(null)
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
    deleteMouvement,
    loadingMouvementActions,
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

  const openEditMouvementModal = useCallback((mouvement: MouvementFinancier) => {
    setEditingMouvement(mouvement)
    setShowAddTransaction(true)
  }, [])

  const handleDeleteMouvement = useCallback(async () => {
    if (!deletingMouvement) return
    try {
      await deleteMouvement(deletingMouvement.id)
      toast({
        title: "Mouvement supprimé",
        description: `Le mouvement "${deletingMouvement.libelle}" a été supprimé.`,
      })
      setDeletingMouvement(null)
      refreshMouvements()
      refreshStats()
      refreshComptes()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le mouvement",
        variant: "destructive",
      })
    }
  }, [deletingMouvement, deleteMouvement, toast, refreshMouvements, refreshStats, refreshComptes])

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
                onEdit={openEditMouvementModal}
                onDelete={setDeletingMouvement}
                user={user}
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

              <div className="space-y-2 border-t pt-3">
                <p className="text-sm font-medium">Actions rapides</p>
                <div className="space-y-2">
                  {displayedMouvements.slice(0, 3).map((mouvement) => (
                    <div key={mouvement.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{mouvement.libelle}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(mouvement.montant)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEditMouvementModal(mouvement)} title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user?.Role?.Nom === "super_admin" || user?.Role?.Nom === "admin" && <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => setDeletingMouvement(mouvement)} title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>}
                      </div>
                    </div>
                  ))}
                  {displayedMouvements.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun mouvement à afficher.</p>
                  )}
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

              <div className="border-t pt-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowHistorique(true)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Historique complet
                </Button>
              </div>
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
        onClose={() => {
          setShowAddTransaction(false)
          setEditingMouvement(null)
        }}
        onSuccess={() => {
          refreshMouvements()
          refreshComptes()
          refreshStats()
        }}
        mode={editingMouvement ? "edit" : "create"}
        editMouvement={editingMouvement}
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

      <Dialog open={Boolean(deletingMouvement)} onOpenChange={(open) => !open && setDeletingMouvement(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer le mouvement{" "}
            <span className="font-medium text-foreground">{deletingMouvement?.libelle}</span> ?
            Cette action est irreversible.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeletingMouvement(null)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteMouvement} disabled={loadingMouvementActions}>
              {loadingMouvementActions && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal historique complet */}
      {showHistorique && (
        <HistoriqueMouvementsModal
          open={showHistorique}
          onOpenChange={setShowHistorique}
          comptes={comptes}
        />
      )}
    </DashboardLayout>
  )
}