"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  FileDown,
  Plus,
  Minus,
  ArrowLeftRight,
  MoreHorizontal,
  PackageX,
  Layers,
} from "lucide-react"
import { PaginationBar } from "@/components/stock/pagination-bar"
import { EntreeStockSheet } from "@/components/stock/entree-stock-sheet"
import { SortieStockSheet } from "@/components/stock/sortie-stock-sheet"
import { TransfertStockSheet } from "@/components/stock/transfert-stock-sheet"
import { DetailsInventaireModal } from "@/components/stock/details-inventaire-modal"
import {
  StatutStockLabels,
  StatutStockColors,
  formatMontantStock,
  type InventaireItem,
  ItemInventaire,
} from "@/types/stock"
import { useInventaire, useDepotsList, useStockExports } from "@/hooks/useStock"

// ── Constantes ─────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20

// ── Page principale ─────────────────────────────────────────────────────────

export default function InventairePage() {
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepot, setSelectedDepot] = useState("all")
  const [alertesSeulement, setAlertesSeulement] = useState(
    searchParams.get("alertes") === "true"
  )
  const [entreeOpen,   setEntreeOpen]   = useState(false)
  const [sortieOpen,   setSortieOpen]   = useState(false)
  const [transfertOpen, setTransfertOpen] = useState(false)
  const [detailsOpen,  setDetailsOpen]  = useState(false)
  const [selectedStock, setSelectedStock] = useState<ItemInventaire | null>(null)
  const [selectedDetailStock, setSelectedDetailStock] = useState<ItemInventaire | null>(null)

  const { items: depots } = useDepotsList({ page: 1, pageSize: 100 })

  const {
    items: inventaire,
    loading,
    totalItems,
    totalPages,
    params,
    setParams,
    refresh,
  } = useInventaire({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    statut: searchParams.get("alertes") === "true" ? "Critique,Rupture" : undefined,
  })

  const { exportEtatStocksPDF, exportEtatStocksExcel, loading: exportLoading } =
    useStockExports()

  const currentPage = params.page ?? 1
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setParams({ ...params, search: value || undefined, page: 1 })
  }

  const handleDepotChange = (value: string) => {
    setSelectedDepot(value)
    setParams({ ...params, depotId: value !== "all" ? Number(value) : undefined, page: 1 })
  }

  const handleAlertesToggle = (checked: boolean) => {
    setAlertesSeulement(checked)
    setParams({ ...params, statut: checked ? "Critique,Rupture" : undefined, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setParams({ ...params, page })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePageSizeChange = (size: number) => {
    setParams({ ...params, pageSize: size, page: 1 })
  }

  const handleOpenEntree = (stock: ItemInventaire) => {
    setSelectedStock(stock)
    setEntreeOpen(true)
  }

  const handleOpenSortie = (stock: ItemInventaire) => {
    setSelectedStock(stock)
    setSortieOpen(true)
  }

  const handleOpenTransfert = (stock: ItemInventaire) => {
    setSelectedStock(stock)
    setTransfertOpen(true)
  }

  const handleOpenDetails = (stock: ItemInventaire) => {
    setSelectedDetailStock(stock)
    setDetailsOpen(true)
  }

  const getRowBgClass = (statut: string, index: number) => {
    if (statut === "Rupture") return "bg-red-50 dark:bg-red-950/20"
    if (statut === "Critique") return "bg-amber-50 dark:bg-amber-950/20"
    return index % 2 === 0
      ? "bg-white dark:bg-gray-950"
      : "bg-[#f9fafb] dark:bg-gray-900"
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inventaire / État des stocks
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Consultez et gérez les stocks de tous les dépôts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportEtatStocksPDF} disabled={exportLoading}>
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportEtatStocksExcel} disabled={exportLoading}>
              <FileDown className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un article…"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={selectedDepot} onValueChange={handleDepotChange}>
                <SelectTrigger className="w-full lg:w-[200px] h-9">
                  <SelectValue placeholder="Tous les dépôts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les dépôts</SelectItem>
                  {depots.map((depot) => (
                    <SelectItem key={depot.id} value={String(depot.id)}>
                      {depot.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  id="alertes"
                  checked={alertesSeulement}
                  onCheckedChange={handleAlertesToggle}
                />
                <Label htmlFor="alertes" className="whitespace-nowrap text-sm">
                  Alertes seulement
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              {loading
                ? "Chargement…"
                : `${totalItems} article(s) trouvé(s)`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium">Référence</TableHead>
                    <TableHead className="text-white font-medium">Article</TableHead>
                    <TableHead className="text-white font-medium">Catégorie</TableHead>
                    <TableHead className="text-white font-medium">Dépôt</TableHead>
                    <TableHead className="text-white font-medium">Unité</TableHead>
                    <TableHead className="text-white font-medium text-right">Qté Dispo</TableHead>
                    <TableHead className="text-white font-medium text-right">Qté Réservée</TableHead>
                    <TableHead className="text-white font-medium text-right">Qté Libre</TableHead>
                    <TableHead className="text-white font-medium text-right">Seuil Min</TableHead>
                    <TableHead className="text-white font-medium text-right">Valeur Stock</TableHead>
                    <TableHead className="text-white font-medium text-center">Statut</TableHead>
                    <TableHead className="text-white font-medium text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 12 }).map((__, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : inventaire.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <PackageX className="h-10 w-10 opacity-40" />
                          <p className="text-sm font-medium">
                            {alertesSeulement
                              ? "Aucune alerte de stock détectée"
                              : searchTerm
                              ? `Aucun article trouvé pour « ${searchTerm} »`
                              : "Aucun article en stock"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventaire.map((stock, index) => (
                      <TableRow
                        key={`${stock.articleId}-${stock.depotId}`}
                        className={getRowBgClass(stock.statut, index)}
                      >
                        <TableCell className="font-mono text-sm">
                          {stock?.reference ||"—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {stock.articleNom ||"—"}
                        </TableCell>
                        <TableCell>
                          {stock.categorieNom ? (
                            <Badge
                              className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: stock.categorieCouleur
                                  ? `${stock.categorieCouleur}20`
                                  : undefined,
                                color: stock.categorieCouleur ?? undefined,
                              }}
                            >
                              {stock.categorieNom}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>{stock?.depotNom ?? "—"}</TableCell>
                        <TableCell>{stock.unite}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {stock.quantiteDisponible}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-amber-600">
                          {stock.quantiteReservee > 0 ? stock.quantiteReservee : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {stock.quantiteLibre}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-gray-500">
                          {stock.seuilMinimum ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMontantStock(stock.valeurStock)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${StatutStockColors[stock.niveauAlerte as keyof typeof StatutStockColors]}`}
                          >
                            {StatutStockLabels[stock.niveauAlerte as keyof typeof StatutStockLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenDetails(stock)}
                                className="font-medium text-[#1e3a5f]"
                              >
                                <Layers className="mr-2 h-4 w-4" />
                                Détail FIFO
                              </DropdownMenuItem>
                              <div className="my-1 h-px bg-gray-100" />
                              <DropdownMenuItem onClick={() => handleOpenEntree(stock)}>
                                <Plus className="mr-2 h-4 w-4 text-green-600" />
                                Entrée manuelle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenSortie(stock)}>
                                <Minus className="mr-2 h-4 w-4 text-red-600" />
                                Sortie manuelle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenTransfert(stock)}>
                                <ArrowLeftRight className="mr-2 h-4 w-4 text-blue-600" />
                                Transfert inter-dépôts
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              itemLabel="article(s)"
            />
          </CardContent>
        </Card>
      </div>

      {/* Sheets */}
      <EntreeStockSheet
        open={entreeOpen}
        onOpenChange={setEntreeOpen}
        preselectedStock={selectedStock}
        onSuccess={refresh}
      />
      <SortieStockSheet
        open={sortieOpen}
        onOpenChange={setSortieOpen}
        preselectedStock={selectedStock}
        onSuccess={refresh}
      />
      <TransfertStockSheet
        open={transfertOpen}
        onOpenChange={setTransfertOpen}
        preselectedStock={selectedStock}
        onSuccess={refresh}
      />

      {/* Modal Détail FIFO */}
      {selectedDetailStock && (
        <DetailsInventaireModal
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          articleId={selectedDetailStock.articleId}
          depotId={selectedDetailStock.depotId}
          articleNom={selectedDetailStock.articleNom}
          depotNom={selectedDetailStock.depotNom ?? ""}
        />
      )}
    </DashboardLayout>
  )
}