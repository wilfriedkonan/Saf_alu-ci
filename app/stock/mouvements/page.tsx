"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PaginationBar } from "@/components/stock/pagination-bar"
import {
  FileDown,
  Check,
  ChevronsUpDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  RotateCcw,
  X,
  History,
  PackagePlus,
  PackageMinus,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  TypeMouvementLabels,
  TypeMouvementColors,
  type TypeMouvement,
} from "@/types/stock"
import { useMouvementsList, useArticlesList, useDepotsList, useStockExports } from "@/hooks/useStock"

const DEFAULT_PAGE_SIZE = 20

const typeIcons: Record<TypeMouvement, React.ReactNode> = {
  Entree: <ArrowDownRight className="h-4 w-4 text-green-600" />,
  Sortie: <ArrowUpRight className="h-4 w-4 text-red-600" />,
  Transfert: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
  Ajustement: <RotateCcw className="h-4 w-4 text-purple-600" />,
}

export default function MouvementsPage() {
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [articleId, setArticleId] = useState<number | null>(null)
  const [depotId, setDepotId] = useState("all")
  const [typeMouvement, setTypeMouvement] = useState("all")
  const [articleOpen, setArticleOpen] = useState(false)

  const { items: mouvements, loading, totalItems, totalPages, params, setParams } = useMouvementsList({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const { items: articles } = useArticlesList({ page: 1, pageSize: 200 })
  const { items: depots } = useDepotsList({ page: 1, pageSize: 100 })
  const { exportHistoriquePDF, exportHistoriqueExcel, loading: exportLoading } = useStockExports()

  const selectedArticle = articles.find((a) => a.id === articleId)
  const currentPage = params.page ?? 1
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
  // Filet de sécurité : si l'API ne renvoie pas totalPages (ou 0) alors qu'il y a des résultats,
  // on le recalcule à partir de totalItems pour ne jamais masquer la pagination à tort.
  const effectiveTotalPages = totalPages > 0 ? totalPages : (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0)

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleTypeChange = (value: string) => {
    setTypeMouvement(value)
    setParams({ ...params, type: value !== "all" ? value : undefined, page: 1 })
  }

  const handleDepotChange = (value: string) => {
    setDepotId(value)
    setParams({ ...params, depotId: value !== "all" ? Number(value) : undefined, page: 1 })
  }

  const handleArticleSelect = (id: number | null) => {
    setArticleId(id)
    setParams({ ...params, articleId: id ?? undefined, page: 1 })
    setArticleOpen(false)
  }

  const handleDateDebutChange = (value: string) => {
    setDateDebut(value)
    setParams({ ...params, page: 1 })
  }

  const handleDateFinChange = (value: string) => {
    setDateFin(value)
    setParams({ ...params, page: 1 })
  }

  const handleResetFilters = () => {
    setDateDebut("")
    setDateFin("")
    setArticleId(null)
    setDepotId("all")
    setTypeMouvement("all")
    setParams({ page: 1, pageSize: DEFAULT_PAGE_SIZE })
  }

  const handlePageChange = (page: number) => {
    setParams({ ...params, page })
  }

  const handlePageSizeChange = (size: number) => {
    setParams({ ...params, pageSize: size, page: 1 })
  }

  const hasActiveFilters = dateDebut || dateFin || articleId || depotId !== "all" || typeMouvement !== "all"

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historique des mouvements</h1>
            <p className="text-muted-foreground">
              Consultez l&apos;historique complet des entrées, sorties et transferts de stock
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/stock/mouvements/bordereau-entree">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <PackagePlus className="mr-2 h-4 w-4" />
                Bordereau d'entrée
              </Button>
            </Link>
            <Link href="/stock/mouvements/bordereau-sortie">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <PackageMinus className="mr-2 h-4 w-4" />
                Bordereau de sortie
              </Button>
            </Link>
            <Button variant="outline" onClick={exportHistoriquePDF} disabled={exportLoading}>
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportHistoriqueExcel} disabled={exportLoading}>
              <FileDown className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date début */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Date début</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => handleDateDebutChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Date fin */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Date fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFin}
                    onChange={(e) => handleDateFinChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Article */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Article</Label>
                <Popover open={articleOpen} onOpenChange={setArticleOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={articleOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedArticle ? (
                        <span className="truncate text-sm">
                          {selectedArticle.Nom || selectedArticle.reference || selectedArticle.reference}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Tous</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un article..." />
                      <CommandList className="max-h-[264px] overflow-y-auto">
                        <CommandEmpty>Aucun article trouvé.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="__all__" onSelect={() => handleArticleSelect(null)}>
                            <Check className={cn("mr-2 h-4 w-4", !articleId ? "opacity-100" : "opacity-0")} />
                            Tous les articles
                          </CommandItem>
                          {articles.map((article) => (
                            <CommandItem
                              key={article.id}
                              value={`${article.reference } ${article.Nom}`}
                              onSelect={() => handleArticleSelect(article.id)}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", articleId === article.id ? "opacity-100" : "opacity-0")}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{article.Nom}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {article.reference }
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Dépôt */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Dépôt</Label>
                <Select value={depotId} onValueChange={handleDepotChange}>
                  <SelectTrigger>
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
              </div>

              {/* Type mouvement */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={typeMouvement} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Entree">Entrée</SelectItem>
                    <SelectItem value="Sortie">Sortie</SelectItem>
                    <SelectItem value="Transfert">Transfert</SelectItem>
                    <SelectItem value="Ajustement">Ajustement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-muted-foreground">
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              {loading
                ? "Chargement..."
                : `${totalItems} mouvement${totalItems !== 1 ? "s" : ""} trouvé${totalItems !== 1 ? "s" : ""}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium">Date</TableHead>
                    <TableHead className="text-white font-medium">Type</TableHead>
                    <TableHead className="text-white font-medium">Référence</TableHead>
                    <TableHead className="text-white font-medium">Article</TableHead>
                    <TableHead className="text-white font-medium">Catégorie</TableHead>
                    <TableHead className="text-white font-medium">Dépôt</TableHead>
                    <TableHead className="text-white font-medium text-right">Entrée</TableHead>
                    <TableHead className="text-white font-medium text-right">Sortie</TableHead>
                    <TableHead className="text-white font-medium text-right">Stock après</TableHead>
                    <TableHead className="text-white font-medium">Projet / Demande</TableHead>
                    <TableHead className="text-white font-medium">Opérateur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : mouvements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <History className="h-10 w-10 opacity-30" />
                          <p className="font-medium">
                            {hasActiveFilters
                              ? "Aucun mouvement ne correspond aux filtres sélectionnés"
                              : "Aucun mouvement enregistré"}
                          </p>
                          {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                              Réinitialiser les filtres
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mouvements.map((mvt, index) => (
                      <TableRow
                        key={mvt.mouvementId}
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                      >
                        <TableCell className="font-medium tabular-nums whitespace-nowrap">
                          {formatDate(mvt.dateMouvement)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {typeIcons[mvt.typeMouvement]}
                            <Badge
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                
                              )}
                            >
                              {mvt.typeMouvement}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm tabular-nums">
                          {mvt.articleReference}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {mvt.articleNom}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {mvt.articleNom || mvt.articleReference}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            variant="outline"
                          >
                            {mvt.categorieNom|| "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{mvt.articleNom}</span>
                            {mvt.typeMouvement === "Transfert" && mvt.depotDestinationNom && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ArrowLeftRight className="h-3 w-3" />
                                { mvt.depotDestinationNom  || "-"  }
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {mvt.typeMouvement === 'Entree' ?   (
                            <span className="text-green-600 font-medium">+{mvt.quantite}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {mvt.typeMouvement === 'Sortie'? (
                            <span className="text-red-600 font-medium">-{mvt.quantite}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {mvt.quantiteApres}
                        </TableCell>
                        <TableCell>
                          {mvt.projetNom && (
                            <div className="text-sm font-medium">{mvt.projetNom}</div>
                          )}
                          {mvt.demandeNumero && (
                            <Link
                              href={`/stock/demandes/${mvt.demandeId}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {mvt.demandeNumero}
                            </Link>
                          )}
                          {!mvt.projetNom && !mvt.demandeNumero && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{mvt.operateurNom || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              itemLabel="mouvement(s)"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
