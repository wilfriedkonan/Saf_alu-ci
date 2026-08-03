"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  FileDown, FileText, Star, AlertTriangle, PackageX, TrendingUp, Building2, Package, X as XIcon,
} from "lucide-react"
import {
  StatutDemandeLabels,
  StatutDemandeColors,
  formatMontantStock,
  type RapportFournisseur,
} from "@/types/stock"
import { StockService } from "@/services/stockService"
import { useDemandesList, useAlertes, useDepotsList, useStockExports } from "@/hooks/useStock"

const mockProjects = [
  { id: "proj-1", nom: "Centre Medical Abobo" },
  { id: "proj-2", nom: "Immeuble Cocody" },
  { id: "proj-3", nom: "Villa Marcory" },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  )
}

const calculateDuration = (startDate: string, endDate?: string): number => {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export default function RapportsPage() {
  const [activeTab, setActiveTab] = useState("demandes-projet")
  const [selectedProject, setSelectedProject] = useState("all")
  const [demandesDateDebut, setDemandesDateDebut] = useState("")
  const [demandesDateFin, setDemandesDateFin] = useState("")
  const [fournisseursDateDebut, setFournisseursDateDebut] = useState("")
  const [fournisseursDateFin, setFournisseursDateFin] = useState("")
  const [alertesDepotId, setAlertesDepotId] = useState("all")
  const [rapportFournisseurs, setRapportFournisseurs] = useState<RapportFournisseur[]>([])
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false)

  const { items: depots } = useDepotsList({ page: 1, pageSize: 100 })
  const { items: demandes, loading: demandesLoading } = useDemandesList({ page: 1, pageSize: 200 })
  const { alertes, loading: alertesLoading } = useAlertes()
  const {
    exportDemandesParProjetPDF, exportFournisseursPDF, exportAlertesExcel,
    loading: exportLoading,
  } = useStockExports()

  useEffect(() => {
    if (activeTab === "fournisseurs") {
      setLoadingFournisseurs(true)
      StockService.getRapportFournisseurs()
        .then(setRapportFournisseurs)
        .catch(() => {})
        .finally(() => setLoadingFournisseurs(false))
    }
  }, [activeTab])

  // Filtre demandes par projet
  const filteredDemandes = demandes.filter((d) => {
    if (d.typeDestination !== "Projet") return false
    if (selectedProject !== "all" && String(d.projetId) !== selectedProject) return false
    if (demandesDateDebut && d.dateDemande < demandesDateDebut) return false
    if (demandesDateFin && d.dateDemande > demandesDateFin) return false
    return true
  })

  // Filtre alertes par depot
  const filteredAlertes = alertes.filter((a) => {
    if (alertesDepotId !== "all" && String(a.depotId) !== alertesDepotId) return false
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports Stock</h1>
          <p className="text-gray-500 dark:text-gray-400">Analyses et exports des donnees de stock</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="demandes-projet" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Demandes par projet</span>
              <span className="sm:hidden">Par projet</span>
            </TabsTrigger>
            <TabsTrigger value="fournisseurs" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Rapport fournisseurs</span>
              <span className="sm:hidden">Fournisseurs</span>
            </TabsTrigger>
            <TabsTrigger value="alertes" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alertes & Reappro</span>
              <span className="sm:hidden">Alertes</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1 — Demandes par projet */}
          <TabsContent value="demandes-projet" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Demandes par projet
                  </CardTitle>
                  <Button variant="outline" onClick={exportDemandesParProjetPDF} disabled={exportLoading} className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full sm:w-[220px] h-9">
                      <SelectValue placeholder="Filtrer par projet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les projets</SelectItem>
                      {mockProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500 whitespace-nowrap">Periode</span>
                    <Input type="date" value={demandesDateDebut} onChange={(e) => setDemandesDateDebut(e.target.value)} className="w-[140px] h-9 text-sm" />
                    <span className="text-gray-400">→</span>
                    <Input type="date" value={demandesDateFin} onChange={(e) => setDemandesDateFin(e.target.value)} className="w-[140px] h-9 text-sm" />
                    {(demandesDateDebut || demandesDateFin) && (
                      <Button variant="ghost" size="sm" onClick={() => { setDemandesDateDebut(""); setDemandesDateFin("") }} className="h-9 px-2 text-sm text-gray-500">
                        <XIcon className="h-3.5 w-3.5 mr-1" />Reinitialiser
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1e3a5f]">
                      <TableHead className="text-white font-medium">N Demande</TableHead>
                      <TableHead className="text-white font-medium">Projet</TableHead>
                      <TableHead className="text-white font-medium">Etape</TableHead>
                      <TableHead className="text-white font-medium text-center">Statut</TableHead>
                      <TableHead className="text-white font-medium text-center">Articles</TableHead>
                      <TableHead className="text-white font-medium text-right">Montant HT</TableHead>
                      <TableHead className="text-white font-medium">Fournisseur</TableHead>
                      <TableHead className="text-white font-medium text-center">Duree (j)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demandesLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">Chargement...</TableCell></TableRow>
                    ) : filteredDemandes.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">Aucune demande trouvee</TableCell></TableRow>
                    ) : filteredDemandes.map((d, i) => (
                      <TableRow key={d.id} className={i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                        <TableCell className="font-mono text-sm font-medium">{d.numero}</TableCell>
                        <TableCell className="font-medium">{d.projetNom || "-"}</TableCell>
                        <TableCell>{d.etapeNom || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`rounded-full px-2 py-1 text-xs font-medium ${StatutDemandeColors[d.statut]}`}>
                            {StatutDemandeLabels[d.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{d.articles.length}</TableCell>
                        <TableCell className="text-right font-medium">{formatMontantStock(d.montantTotal)}</TableCell>
                        <TableCell>{d.fournisseur || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {calculateDuration(d.dateDemande, d.dateLivraisonReelle || d.dateValidation)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredDemandes.length > 0 && (
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-6 text-sm">
                    <div><span className="text-gray-500">Total demandes:</span> <span className="font-semibold">{filteredDemandes.length}</span></div>
                    <div><span className="text-gray-500">Montant total HT:</span> <span className="font-semibold">{formatMontantStock(filteredDemandes.reduce((acc, d) => acc + d.montantTotal, 0))}</span></div>
                    <div>
                      <span className="text-gray-500">Duree moyenne:</span>{" "}
                      <span className="font-semibold">
                        {Math.round(filteredDemandes.reduce((acc, d) => acc + calculateDuration(d.dateDemande, d.dateLivraisonReelle || d.dateValidation), 0) / filteredDemandes.length)} jours
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2 — Rapport fournisseurs */}
          <TabsContent value="fournisseurs" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Rapport fournisseurs
                  </CardTitle>
                  <Button variant="outline" onClick={exportFournisseursPDF} disabled={exportLoading} className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500 whitespace-nowrap">Periode</span>
                  <Input type="date" value={fournisseursDateDebut} onChange={(e) => setFournisseursDateDebut(e.target.value)} className="w-[140px] h-9 text-sm" />
                  <span className="text-gray-400">→</span>
                  <Input type="date" value={fournisseursDateFin} onChange={(e) => setFournisseursDateFin(e.target.value)} className="w-[140px] h-9 text-sm" />
                  {(fournisseursDateDebut || fournisseursDateFin) && (
                    <Button variant="ghost" size="sm" onClick={() => { setFournisseursDateDebut(""); setFournisseursDateFin("") }} className="h-9 px-2 text-sm text-gray-500">
                      <XIcon className="h-3.5 w-3.5 mr-1" />Reinitialiser
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1e3a5f]">
                      <TableHead className="text-white font-medium">Nom</TableHead>
                      <TableHead className="text-white font-medium text-center">Commandes</TableHead>
                      <TableHead className="text-white font-medium text-right">Total HT</TableHead>
                      <TableHead className="text-white font-medium text-right">Moy./Cmd.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingFournisseurs ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">Chargement...</TableCell></TableRow>
                    ) : rapportFournisseurs.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">Aucune donnee</TableCell></TableRow>
                    ) : rapportFournisseurs.map((f, i) => (
                      <TableRow key={f.fournisseurId} className={i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                        <TableCell className="font-medium">{f.fournisseurNom}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="font-semibold">{f.totalCommandes}</Badge></TableCell>
                        <TableCell className="text-right font-medium">{formatMontantStock(f.montantTotal)}</TableCell>
                        <TableCell className="text-right">{f.totalCommandes > 0 ? formatMontantStock(Math.round(f.montantTotal / f.totalCommandes)) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3 — Alertes */}
          <TabsContent value="alertes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Alertes & Reapprovisionnement
                  </CardTitle>
                  <Button variant="outline" onClick={exportAlertesExcel} disabled={exportLoading} className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Exporter alertes Excel
                  </Button>
                </div>
                <Select value={alertesDepotId} onValueChange={setAlertesDepotId}>
                  <SelectTrigger className="w-56 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Tous les depots" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les depots</SelectItem>
                    {depots.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.code} — {d.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-amber-500" />
                      <div>
                        <p className="text-2xl font-bold text-amber-700">{filteredAlertes.filter(a => a.statut === "Critique").length}</p>
                        <p className="text-sm text-amber-600">Articles critiques</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
                    <div className="flex items-center gap-3">
                      <PackageX className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold text-red-700">{filteredAlertes.filter(a => a.statut === "Rupture").length}</p>
                        <p className="text-sm text-red-600">Articles en rupture</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold text-blue-700">{filteredAlertes.length}</p>
                        <p className="text-sm text-blue-600">Total alertes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1e3a5f]">
                      <TableHead className="text-white font-medium">Code</TableHead>
                      <TableHead className="text-white font-medium">Article</TableHead>
                      <TableHead className="text-white font-medium">Depot</TableHead>
                      <TableHead className="text-white font-medium text-right">Stock</TableHead>
                      <TableHead className="text-white font-medium text-right">Seuil min</TableHead>
                      <TableHead className="text-white font-medium text-right">A commander</TableHead>
                      <TableHead className="text-white font-medium text-center">Priorite</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertesLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Chargement...</TableCell></TableRow>
                    ) : filteredAlertes.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Aucune alerte</TableCell></TableRow>
                    ) : filteredAlertes
                      .sort((a, b) => (a.statut === "Rupture" && b.statut !== "Rupture" ? -1 : 1))
                      .map((alerte, i) => {
                        const manquant = Math.max(0, alerte.seuilAlerte - alerte.quantiteDisponible)
                        const isRupture = alerte.statut === "Rupture"
                        return (
                          <TableRow key={`${alerte.articleId}-${alerte.depotId}`} className={isRupture ? "bg-red-50 dark:bg-red-900/10" : i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                            <TableCell className="font-mono text-sm">{alerte.articleCode}</TableCell>
                            <TableCell className="font-medium">{alerte.articleDesignation}</TableCell>
                            <TableCell>{alerte.depotNom || "-"}</TableCell>
                            <TableCell className="text-right">
                              <span className={isRupture ? "text-red-600 font-semibold" : ""}>{alerte.quantiteDisponible}</span>
                            </TableCell>
                            <TableCell className="text-right">{alerte.seuilAlerte}</TableCell>
                            <TableCell className="text-right font-medium text-amber-600">{manquant}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`rounded-full px-2 py-1 text-xs font-medium ${isRupture ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                                {isRupture ? "Urgent" : "Moyen"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
