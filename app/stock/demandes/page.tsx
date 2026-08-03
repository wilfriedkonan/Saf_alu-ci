"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  Eye,
  Pencil,
  Check,
  X as XIcon,
  MoreHorizontal,
  X,
  Truck,
  PackageCheck,
  PackageOpen,
} from "lucide-react"
import {
  StatutDemandeLabels,
  StatutDemandeColors,
  formatMontantStock,
  type Demande,
  type StatutDemande,
  type CreateDemandeRequest,
} from "@/types/stock"
import { useDemandesList, useDemandesActions } from "@/hooks/useStock"
import { mockProjects } from "@/lib/projects"
import { DemandeFormSheet } from "@/components/stock/demande-form-sheet"
import { LivraisonConfirmationSheet } from "@/components/stock/livraison-confirmation-sheet"
import { useAuth, usePermissions } from "@/contexts/AuthContext"

// ── Constantes ────────────────────────────────────────────────────────────────

type TabFilter = "all" | StatutDemande

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const DEFAULT_PAGE_SIZE = 20

const ALL_STATUTS: StatutDemande[] = [
  "EnAttente",           // Flux commun : création
  "EnTraitement",        // Flux commun : traitement en cours
  "LivraisonPartielle",  // Cas 2 : articles stock livrés, commandes en attente
  "AttenteValidation",   // Cas 2 & 3 : en attente de validation
  "AttenteLivraison",    // Cas 2 & 3 : livraison fournisseur en cours
  "Dotee",
  "Livree",              // Cas 2 & 3 : livrée
  // Cas 1 : tout stock livré, flux terminé
  "AttenteComptabilite", // Cas 2 & 3 : en attente comptabilité
  "Rejetee",             // Tout cas : rejetée
]

// ── Composant pagination ──────────────────────────────────────────────────────

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
}: {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  loading: boolean
}) {
  if (totalPages <= 0) return null

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const end = Math.min(currentPage * pageSize, totalItems)

  // Calcul des numéros de pages à afficher (max 7 boutons)
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

    const pages: (number | "ellipsis")[] = [1]
    const left = Math.max(2, currentPage - 1)
    const right = Math.min(totalPages - 1, currentPage + 1)

    if (left > 2) pages.push("ellipsis")
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push("ellipsis")
    pages.push(totalPages)

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-gray-50 dark:bg-gray-900">
      {/* Info + sélecteur de taille */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {loading ? "Chargement..." : `${start}–${end} sur ${totalItems} demande(s)`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Lignes :</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Numéros de pages */}
      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-0.5">
          {/* Premier */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || loading}
              aria-label="Premiere page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>

          {/* Précédent */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              aria-label="Page precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>

          {/* Numéros */}
          {getPageNumbers().map((page, i) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <Button
                  variant={page === currentPage ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 text-xs ${page === currentPage ? "bg-[#1e3a5f] hover:bg-[#15293f] text-white" : ""}`}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              </PaginationItem>
            )
          )}

          {/* Suivant */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>

          {/* Dernier */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              aria-label="Derniere page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function DemandesPage() {
  const router = useRouter()
  const { user } = useAuth() 
  const { canManageStock } = usePermissions()
  const canAccessStock = !!canManageStock()

  useEffect(() => {
    if (user && !canManageStock) {
      router.push("/dashboard")
      return
    }

  }, [user, canManageStock, router])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [selectedProjet, setSelectedProjet] = useState("all")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [isDemandeFormOpen, setIsDemandeFormOpen] = useState(false)
  const [demandeToValidate, setDemandeToValidate] = useState<Demande | null>(null)
  const [demandeToReject, setDemandeToReject] = useState<Demande | null>(null)
  const [demandeToLivraison, setDemandeToLivraison] = useState<Demande | null>(null)

  const { items, loading, totalItems, totalPages, params, setParams } = useDemandesList({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    statut: undefined,
  })
  const { createDemande, validerDemande, rejeterDemande, loading: actionLoading } = useDemandesActions()

  // Page et taille courantes (lues depuis params)
  const currentPage = params.page ?? 1
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE

  // Filtrage local : search + projet + dates (léger, sur les items de la page)
  const filteredDemandes = items.filter((d) => {
    if (selectedProjet !== "all" && String(d.projetId) !== selectedProjet) return false
    if (dateDebut && d.dateDemande < dateDebut) return false
    if (dateFin && d.dateDemande > dateFin) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        d.numero.toLowerCase().includes(s) ||
        d.nomDemandeur.toLowerCase().includes(s) ||
        (d.projetNom?.toLowerCase().includes(s) ?? false)
      )
    }
    return true
  })

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleTabChange = (value: string) => {
    const tab = value as TabFilter
    setActiveTab(tab)
    setParams({
      ...params,
      statut: tab !== "all" ? tab : undefined,
      page: 1,
    })
  }

  const handlePageChange = (page: number) => {
    setParams({ ...params, page })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePageSizeChange = (size: number) => {
    setParams({ ...params, pageSize: size, page: 1 })
  }

  const handleCreateDemande = async (data: CreateDemandeRequest) => {
    try {
      await createDemande(data)
      setIsDemandeFormOpen(false)
      setParams({ ...params, page: 1 })
    } catch {
      // géré dans le hook
    }
  }

  const confirmValidate = async () => {
    if (!demandeToValidate) return
    await validerDemande(demandeToValidate.id)
    setDemandeToValidate(null)
    setParams({ ...params })
  }

  const confirmReject = async () => {
    if (!demandeToReject) return
    await rejeterDemande(demandeToReject.id, { motifRejet: "Rejeté depuis la liste" })
    setDemandeToReject(null)
    setParams({ ...params })
  }
// Vérification des permissions avant rendu
  if (!user || !canAccessStock) {
    return null
  }
  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demandes de stock</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gerez les demandes de materiel et fournitures
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

        {/* Onglets — reset page à 1 à chaque changement */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="all" className="flex-1 min-w-[100px]">
              Toutes ({loading ? "…" : totalItems})
            </TabsTrigger>
            {ALL_STATUTS.map((s) => (
              <TabsTrigger key={s} value={s} className="flex-1 min-w-[100px]">
                {StatutDemandeLabels[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numero, demandeur, projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={selectedProjet} onValueChange={setSelectedProjet}>
                <SelectTrigger className="w-full sm:w-[200px] h-9">
                  <SelectValue placeholder="Tous les projets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 whitespace-nowrap">Periode</span>
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-[140px] h-9 text-sm"
                />
                <span className="text-gray-400">→</span>
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-[140px] h-9 text-sm"
                />
                {(dateDebut || dateFin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setDateDebut(""); setDateFin("") }}
                    className="h-9 px-2 text-sm text-gray-500"
                  >
                    <XIcon className="h-3.5 w-3.5 mr-1" />
                    Reinitialiser
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau + pagination */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              {loading
                ? "Chargement..."
                : `${filteredDemandes.length} demande(s) sur la page · ${totalItems} au total`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium">N° Demande</TableHead>
                    <TableHead className="text-white font-medium">Demandeur</TableHead>
                    <TableHead className="text-white font-medium">Poste</TableHead>
                    <TableHead className="text-white font-medium">Destination</TableHead>
                    <TableHead className="text-white font-medium">Date</TableHead>
                    <TableHead className="text-white font-medium text-center">Statut</TableHead>
                    <TableHead className="text-white font-medium text-right">Montant HT</TableHead>
                    <TableHead className="text-white font-medium">Fournisseur</TableHead>
                    <TableHead className="text-white font-medium text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-12">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredDemandes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-12">
                        Aucune demande trouvee
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDemandes.map((demande, index) => (
                      <TableRow
                        key={demande.id}
                        className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}
                      >
                        <TableCell className="font-mono text-sm font-medium">{demande.numero}</TableCell>
                        <TableCell className="font-medium">{demande.nomDemandeur}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{demande.posteDemandeur}</TableCell>
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
                        <TableCell>
                          {new Date(demande.dateDemande).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`rounded-full px-2 py-1 text-xs font-medium ${StatutDemandeColors[demande.statut]}`}>
                            {StatutDemandeLabels[demande.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMontantStock(demande.montantTotal)}
                        </TableCell>
                        <TableCell>{demande.fournisseur || "-"}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Voir le détail — toujours disponible */}
                              <DropdownMenuItem onClick={() => router.push(`/stock/demandes/${demande.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir detail
                              </DropdownMenuItem>

                              {/* EnAttente → traiter */}
                              {demande.statut === "EnAttente" && (
                                <DropdownMenuItem onClick={() => router.push(`/stock/demandes/${demande.id}`)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Traiter
                                </DropdownMenuItem>
                              )}

                              {/* EnTraitement → modifier */}
                              {demande.statut === "EnTraitement" && (
                                <DropdownMenuItem onClick={() => router.push(`/stock/demandes/${demande.id}`)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier le traitement
                                </DropdownMenuItem>
                              )}

                              {/* AttenteValidation → valider / rejeter */}
                              {demande.statut === "AttenteValidation" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDemandeToValidate(demande)}
                                    className="text-green-600"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Valider
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDemandeToReject(demande)}
                                    className="text-red-600"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* LivraisonPartielle (Cas 2) → confirmer livraison fournisseur */}
                              {demande.statut === "LivraisonPartielle" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDemandeToLivraison(demande)}
                                    className="text-amber-600"
                                  >
                                    <PackageOpen className="mr-2 h-4 w-4" />
                                    Livraison partielle
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* AttenteLivraison (Cas 2 & 3) → confirmer réceptions fournisseur */}
                              {demande.statut === "AttenteLivraison" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDemandeToLivraison(demande)}
                                    className="text-blue-600"
                                  >
                                    <Truck className="mr-2 h-4 w-4" />
                                    Confirmer livraisons
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Dotee (Cas 1) → aucune action, flux terminé */}
                              {demande.statut === "Dotee" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem disabled className="text-emerald-600 opacity-70 cursor-default">
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Dotée — flux terminé
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Barre de pagination ── */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Formulaire nouvelle demande */}
      {demandeToLivraison && (
        <LivraisonConfirmationSheet
          open={demandeToLivraison !== null}
          onOpenChange={(open) => { if (!open) setDemandeToLivraison(null) }}
          demande={demandeToLivraison}
          onRefresh={() => {
            setDemandeToLivraison(null)
            setParams({ ...params })
          }}
        />
      )}
      <DemandeFormSheet
        open={isDemandeFormOpen}
        onOpenChange={setIsDemandeFormOpen}
        onSubmit={handleCreateDemande}
      />

      {/* Dialog validation */}
      <AlertDialog open={demandeToValidate !== null} onOpenChange={() => setDemandeToValidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider la demande</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir valider la demande{" "}
              <span className="font-semibold">{demandeToValidate?.numero}</span> ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmValidate}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog rejet */}
      <AlertDialog open={demandeToReject !== null} onOpenChange={() => setDemandeToReject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir rejeter la demande{" "}
              <span className="font-semibold">{demandeToReject?.numero}</span> ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}