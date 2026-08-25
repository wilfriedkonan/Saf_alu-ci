"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  BarChart3,
  AlertTriangle,
  PackageX,
  ClipboardList,
  Plus,
  Eye,
  ArrowRight,
} from "lucide-react"
import {
  StatutDemandeLabels,
  StatutDemandeColors,
  formatMontantStock,
} from "@/types/stock"
import { useStockStatistiques, useAlertes, useDemandesList } from "@/hooks/useStock"
import { DemandeFormSheet } from "@/components/stock/demande-form-sheet"

export default function StockDashboardPage() {
  const router = useRouter()
  const [isDemandeFormOpen, setIsDemandeFormOpen] = useState(false)

  const { stats, loading: statsLoading } = useStockStatistiques()
  const { alertes, loading: alertesLoading } = useAlertes()
  const { items: demandes, loading: demandesLoading } = useDemandesList({ page: 1, pageSize: 20 })

  const demandesEnCours = demandes.filter(
    (d) => d.statut !== "Livree" && d.statut !== "Rejetee"
  )

  const handleCreateDemande = (data: Record<string, unknown>) => {
    console.log("Nouvelle demande:", data)
    setIsDemandeFormOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tableau de bord Stock
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Vue d&apos;ensemble de la gestion des stocks
            </p>
          </div>
          <Button
            onClick={() => setIsDemandeFormOpen(true)}
            className="bg-[#1e3a5f] hover:bg-[#15293f] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Valeur totale du stock
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? "..." : formatMontantStock(stats?.valeurTotaleStock ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.totalArticles ?? 0} articles en stock
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border shadow-sm hover:shadow-md transition-shadow ${(stats?.articlesEnAlerte ?? 0) > 0 ? "border-amber-300 dark:border-amber-700" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Articles en alerte
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${(stats?.articlesEnAlerte ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
                    {statsLoading ? "..." : stats?.articlesEnAlerte ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Sous le seuil minimum</p>
                </div>
                <div className={`p-3 rounded-full ${(stats?.articlesEnAlerte ?? 0) > 0 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <AlertTriangle className={`h-6 w-6 ${(stats?.articlesEnAlerte ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-500"}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border shadow-sm hover:shadow-md transition-shadow ${(stats?.articlesEnRupture ?? 0) > 0 ? "border-red-300 dark:border-red-700" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Articles en rupture
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${(stats?.articlesEnRupture ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                    {statsLoading ? "..." : stats?.articlesEnRupture ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Stock epuise</p>
                </div>
                <div className={`p-3 rounded-full ${(stats?.articlesEnRupture ?? 0) > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <PackageX className={`h-6 w-6 ${(stats?.articlesEnRupture ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Demandes en attente
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? "..." : (stats?.demandesEnAttente ?? 0) + (stats?.demandesEnTraitement ?? 0) + (stats?.demandesAttenteValidation ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">A traiter</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes stock minimum */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Alertes stock minimum</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/stock/inventaire?alertes=true")}
              className="text-[#2563eb] hover:text-[#1e3a5f]"
            >
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium">Reference</TableHead>
                    <TableHead className="text-white font-medium">Article</TableHead>
                    <TableHead className="text-white font-medium text-right">Stock actuel</TableHead>
                    <TableHead className="text-white font-medium text-right">Seuil min</TableHead>
                    <TableHead className="text-white font-medium text-right">Manquant</TableHead>
                    <TableHead className="text-white font-medium">Depot</TableHead>
                    <TableHead className="text-white font-medium text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : alertes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Aucune alerte de stock
                      </TableCell>
                    </TableRow>
                  ) : (
                    alertes.map((alerte, index) => {
                      const seuilAlerte = Number(alerte.seuilAlerte) || 0
                      const quantiteDisponible = Number(alerte.quantiteDisponible) || 0
                      const manquant = Math.max(0, seuilAlerte - quantiteDisponible)
                      return (
                        <TableRow
                          key={`${alerte.articleId}-${alerte.depotId}`}
                          className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}
                        >
                          <TableCell className="font-mono text-sm">{alerte.articleCode}</TableCell>
                          <TableCell className="font-medium">{alerte.articleDesignation}</TableCell>
                          <TableCell className="text-right">{quantiteDisponible}</TableCell>
                          <TableCell className="text-right">{seuilAlerte}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{manquant}</TableCell>
                          <TableCell>{alerte.depotNom || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                alerte.statut === "Rupture"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}
                            >
                              {alerte.statut}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Demandes en cours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Demandes en cours</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/stock/demandes")}
              className="text-[#2563eb] hover:text-[#1e3a5f]"
            >
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium">N Demande</TableHead>
                    <TableHead className="text-white font-medium">Demandeur</TableHead>
                    <TableHead className="text-white font-medium">Destination</TableHead>
                    <TableHead className="text-white font-medium">Date</TableHead>
                    <TableHead className="text-white font-medium text-center">Statut</TableHead>
                    <TableHead className="text-white font-medium text-right">Montant HT</TableHead>
                    <TableHead className="text-white font-medium text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demandesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">Chargement...</TableCell>
                    </TableRow>
                  ) : demandesEnCours.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Aucune demande en cours
                      </TableCell>
                    </TableRow>
                  ) : (
                    demandesEnCours.map((demande, index) => (
                      <TableRow
                        key={demande.id}
                        className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}
                      >
                        <TableCell className="font-mono text-sm font-medium">{demande.numero}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{demande.nomDemandeur}</p>
                            <p className="text-xs text-gray-500">{demande.posteDemandeur}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {demande.typeDestination === "Administration" ? (
                            <span>Administration</span>
                          ) : (
                            <div>
                              <p className="font-medium">{demande.projetNom}</p>
                              {demande.etapeNom && (
                                <p className="text-xs text-gray-500">{demande.etapeNom}</p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{new Date(demande.dateDemande).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`rounded-full px-2 py-1 text-xs font-medium ${StatutDemandeColors[demande.statut]}`}>
                            {StatutDemandeLabels[demande.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatMontantStock(demande.montantTotal)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/stock/demandes/${demande.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <DemandeFormSheet
        open={isDemandeFormOpen}
        onOpenChange={setIsDemandeFormOpen}
        onSubmit={handleCreateDemande}
      /> */}
    </DashboardLayout>
  )
}
