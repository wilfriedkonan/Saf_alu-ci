"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Check, ChevronsUpDown, Package, Layers, Warehouse, Truck, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMontantStock } from "@/types/stock"

// Types dédiés
import type { Article, CreateArticleRequest, UpdateArticleRequest } from "@/types/article"
import type { Categorie, CreateCategorieRequest, UpdateCategorieRequest } from "@/types/categorie"
import type { Depot, CreateDepotRequest, UpdateDepotRequest } from "@/types/depot"
import type { Fournisseur, CreateFournisseurRequest, UpdateFournisseurRequest } from "@/types/fournisseur"

// Hooks dédiés
import { useArticlesList, useArticlesActions } from "@/hooks/useArticle"
import { useCategoriesList, useCategoriesActions } from "@/hooks/useCategorie"
import { useDepotsList, useDepotsActions } from "@/hooks/useDepot"
import { useFournisseursList, useFournisseursActions } from "@/hooks/useFournisseur"

const uniteOptions = [
  { value: "PIECE",   label: "Piece" },
  { value: "KG",      label: "Kilogramme (kg)" },
  { value: "ML",      label: "Metre lineaire (m)" },
  { value: "M2",      label: "Metre carre (m2)" },
  { value: "M3",      label: "Metre cube (m3)" },
  { value: "LITRE",   label: "Litre" },
  { value: "SAC",     label: "Sac" },
  { value: "TONNE",   label: "Tonne" },
  { value: "FORFAIT", label: "Forfait" },
  { value: "ROULEAU", label: "Rouleau" },
  { value: "BOITE",   label: "Boite" },
  { value: "UNITE",   label: "Unite" },
]

const colorPalette = [
  { value: "#dc2626", label: "Rouge" },
  { value: "#d97706", label: "Orange" },
  { value: "#2563eb", label: "Bleu" },
  { value: "#16a34a", label: "Vert" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#0891b2", label: "Cyan" },
  { value: "#be185d", label: "Rose" },
  { value: "#6b7280", label: "Gris" },
]

export default function ConfigurationPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("articles")

  // ── Search ────────────────────────────────────────────
  const [searchArticles,    setSearchArticles]    = useState("")
  const [searchCategories,  setSearchCategories]  = useState("")
  const [searchDepots,      setSearchDepots]      = useState("")
  const [searchFournisseurs, setSearchFournisseurs] = useState("")

  // ── API data ──────────────────────────────────────────
  const { items: articles,     loading: articlesLoading,     refresh: refreshArticles     } = useArticlesList({ page: 1, pageSize: 200 })
  const { createArticle,  updateArticle,  toggleActif: toggleArticleActif,  loading: articleSubmitting  } = useArticlesActions()

  const { items: categories,   loading: categoriesLoading,   refresh: refreshCategories   } = useCategoriesList({ page: 1, pageSize: 100 })
  const { createCategorie, updateCategorie, toggleActif: toggleCategorieActif, loading: categorieSubmitting } = useCategoriesActions()

  const { items: depots,       loading: depotsLoading,       refresh: refreshDepots       } = useDepotsList({ page: 1, pageSize: 100 })
  const { createDepot,    updateDepot,    toggleActif: toggleDepotActif,    loading: depotSubmitting    } = useDepotsActions()

  const { items: fournisseurs, loading: fournisseursLoading, refresh: refreshFournisseurs } = useFournisseursList({ page: 1, pageSize: 100 })
  const { createFournisseur, updateFournisseur, toggleActif: toggleFournisseurActif, loading: fournisseurSubmitting } = useFournisseursActions()

  // ── Article sheet state ───────────────────────────────
  const [articleSheetOpen,  setArticleSheetOpen]  = useState(false)
  const [editingArticle,    setEditingArticle]     = useState<Article | null>(null)
  const [articleForm,       setArticleForm]        = useState({
     reference: "", designation: "", description: "",
    categorieId: "", unite: "", prixUnitaire: 0, seuilAlerte: 0,
    fournisseurPreferentielId: "",
  })
  const [fournisseurComboOpen, setFournisseurComboOpen] = useState(false)

  // ── Categorie dialog state ────────────────────────────
  const [categorieDialogOpen, setCategorieDialogOpen] = useState(false)
  const [editingCategorie,    setEditingCategorie]    = useState<Categorie | null>(null)
  const [categorieForm,       setCategorieForm]       = useState({
    code: "", nom: "", description: "", couleur: "#2563eb",
  })

  // ── Depot sheet state ─────────────────────────────────
  const [depotSheetOpen, setDepotSheetOpen] = useState(false)
  const [editingDepot,   setEditingDepot]   = useState<Depot | null>(null)
  const [depotForm,      setDepotForm]      = useState({
    code: "", nom: "", adresse: "", responsable: "",
  })

  // ── Fournisseur sheet state ───────────────────────────
  const [fournisseurSheetOpen, setFournisseurSheetOpen] = useState(false)
  const [editingFournisseur,   setEditingFournisseur]   = useState<Fournisseur | null>(null)
  const [fournisseurForm,      setFournisseurForm]      = useState({
    code: "", nom: "", contact: "", telephone: "", email: "", adresse: "", specialites: "",
  })

  // ── Filtered data ─────────────────────────────────────
  const filteredArticles = useMemo(() => {
    if (!searchArticles) return articles
    const s = searchArticles.toLowerCase()
    return articles.filter((a) =>
      (a.reference || a.nom).toLowerCase().includes(s) ||
      a.nom.toLowerCase().includes(s)
    )
  }, [articles, searchArticles])

  const filteredCategories = useMemo(() => {
    if (!searchCategories) return categories
    const s = searchCategories.toLowerCase()
    return categories.filter((c) =>
      c.code.toLowerCase().includes(s) || c.nom.toLowerCase().includes(s)
    )
  }, [categories, searchCategories])

  const filteredDepots = useMemo(() => {
    if (!searchDepots) return depots
    const s = searchDepots.toLowerCase()
    return depots.filter((d) =>
      d.code.toLowerCase().includes(s) ||
      d.nom.toLowerCase().includes(s) ||
      (d.adresse && d.adresse.toLowerCase().includes(s))
    )
  }, [depots, searchDepots])

  const filteredFournisseurs = useMemo(() => {
    if (!searchFournisseurs) return fournisseurs
    const s = searchFournisseurs.toLowerCase()
    return fournisseurs.filter((f) =>
      f.code.toLowerCase().includes(s) ||
      f.nom.toLowerCase().includes(s) ||
      (f.email && f.email.toLowerCase().includes(s)) ||
      (f.telephone && f.telephone.toLowerCase().includes(s))
    )
  }, [fournisseurs, searchFournisseurs])

  // ── Article handlers ──────────────────────────────────
  const handleOpenArticleSheet = (article?: Article) => {
    if (article) {
      setEditingArticle(article)
      setArticleForm({
        reference:                article.reference || "",
        designation:              article.nom,
        description:              article.description || "",
        categorieId:              String(article.categorieId),
        unite:                    article.unite,
        prixUnitaire:             article.prixUnitaireMoyen,
        seuilAlerte:              article.seuilAlerte,
        fournisseurPreferentielId: article.fournisseurPreferentielId
          ? String(article.fournisseurPreferentielId)
          : "",
      })
    } else {
      setEditingArticle(null)
      setArticleForm({ reference: "", designation: "", description: "", categorieId: "", unite: "", prixUnitaire: 0, seuilAlerte: 0, fournisseurPreferentielId: "" })
    }
    setArticleSheetOpen(true)
  }

  const handleSaveArticle = async () => {
    if ( !articleForm.designation || !articleForm.categorieId || !articleForm.unite) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" })
      return
    }
    try {
      const payload: CreateArticleRequest = {
        reference:                articleForm.reference || undefined,
        nom:              articleForm.designation,
        description:              articleForm.description || undefined,
        categorieId:              Number(articleForm.categorieId),
        unite:                    articleForm.unite,
        prixUnitaireMoyen:             articleForm.prixUnitaire,
        seuilAlerte:              articleForm.seuilAlerte,
        fournisseurPreferentielId: articleForm.fournisseurPreferentielId
          ? Number(articleForm.fournisseurPreferentielId)
          : undefined,
      }
      if (editingArticle) {
        await updateArticle(editingArticle.id, payload as UpdateArticleRequest)
        toast({ title: "Succes", description: "Article modifie avec succes" })
      } else {
        await createArticle(payload)
        toast({ title: "Succes", description: "Article cree avec succes" })
      }
      setArticleSheetOpen(false)
      refreshArticles()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  const handleToggleArticleActif = async (article: Article) => {
    try {
      await toggleArticleActif(article.id, !article.actif)
      toast({ title: "Succes", description: "Statut de l'article mis a jour" })
      refreshArticles()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  // ── Categorie handlers ────────────────────────────────
  const handleOpenCategorieDialog = (categorie?: Categorie) => {
    if (categorie) {
      setEditingCategorie(categorie)
      setCategorieForm({ code: categorie.code, nom: categorie.nom, description: categorie.description || "", couleur: categorie.couleur || "#2563eb" })
    } else {
      setEditingCategorie(null)
      setCategorieForm({ code: "", nom: "", description: "", couleur: "#2563eb" })
    }
    setCategorieDialogOpen(true)
  }

  const handleSaveCategorie = async () => {
    if (!categorieForm.code || !categorieForm.nom) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" })
      return
    }
    try {
      const payload: CreateCategorieRequest = {
        code:        categorieForm.code,
        nom:         categorieForm.nom,
        description: categorieForm.description || undefined,
        couleur:     categorieForm.couleur,
      }
      if (editingCategorie) {
        await updateCategorie(editingCategorie.id, payload as UpdateCategorieRequest)
        toast({ title: "Succes", description: "Categorie modifiee avec succes" })
      } else {
        await createCategorie(payload)
        toast({ title: "Succes", description: "Categorie creee avec succes" })
      }
      setCategorieDialogOpen(false)
      refreshCategories()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  const handleToggleCategorieActif = async (categorie: Categorie) => {
    try {
      await toggleCategorieActif(categorie.id, !categorie.actif)
      toast({ title: "Succes", description: "Statut de la categorie mis a jour" })
      refreshCategories()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  // ── Depot handlers ────────────────────────────────────
  const handleOpenDepotSheet = (depot?: Depot) => {
    if (depot) {
      setEditingDepot(depot)
      setDepotForm({ code: depot.code, nom: depot.nom, adresse: depot.adresse || "", responsable: depot.responsable || "" })
    } else {
      setEditingDepot(null)
      setDepotForm({ code: "", nom: "", adresse: "", responsable: "" })
    }
    setDepotSheetOpen(true)
  }

  const handleSaveDepot = async () => {
    if (!depotForm.code || !depotForm.nom) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" })
      return
    }
    try {
      const payload: CreateDepotRequest = {
        code:        depotForm.code,
        nom:         depotForm.nom,
        adresse:     depotForm.adresse || undefined,
        responsable: depotForm.responsable || undefined,
      }
      if (editingDepot) {
        await updateDepot(editingDepot.id, payload as UpdateDepotRequest)
        toast({ title: "Succes", description: "Depot modifie avec succes" })
      } else {
        await createDepot(payload)
        toast({ title: "Succes", description: "Depot cree avec succes" })
      }
      setDepotSheetOpen(false)
      refreshDepots()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  const handleToggleDepotActif = async (depot: Depot) => {
    try {
      await toggleDepotActif(depot.id, !depot.actif)
      toast({ title: "Succes", description: "Statut du depot mis a jour" })
      refreshDepots()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  // ── Fournisseur handlers ──────────────────────────────
  const handleOpenFournisseurSheet = (fournisseur?: Fournisseur) => {
    if (fournisseur) {
      setEditingFournisseur(fournisseur)
      setFournisseurForm({
        code:       fournisseur.code,
        nom:        fournisseur.nom,
        contact:    fournisseur.contact || "",
        telephone:  fournisseur.telephone || "",
        email:      fournisseur.email || "",
        adresse:    fournisseur.adresse || "",
        specialites: (fournisseur.specialites || []).join(", "),
      })
    } else {
      setEditingFournisseur(null)
      setFournisseurForm({ code: "", nom: "", contact: "", telephone: "", email: "", adresse: "", specialites: "" })
    }
    setFournisseurSheetOpen(true)
  }

  const handleSaveFournisseur = async () => {
    if (!fournisseurForm.code || !fournisseurForm.nom) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" })
      return
    }
    try {
      const specialitesArray = fournisseurForm.specialites
        ? fournisseurForm.specialites.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined
      const payload: CreateFournisseurRequest = {
        code:       fournisseurForm.code,
        nom:        fournisseurForm.nom,
        contact:    fournisseurForm.contact || undefined,
        telephone:  fournisseurForm.telephone || undefined,
        email:      fournisseurForm.email || undefined,
        adresse:    fournisseurForm.adresse || undefined,
        specialites: specialitesArray?.length ? specialitesArray : undefined,
      }
      if (editingFournisseur) {
        await updateFournisseur(editingFournisseur.id, payload as UpdateFournisseurRequest)
        toast({ title: "Succes", description: "Fournisseur modifie avec succes" })
      } else {
        await createFournisseur(payload)
        toast({ title: "Succes", description: "Fournisseur cree avec succes" })
      }
      setFournisseurSheetOpen(false)
      refreshFournisseurs()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  const handleToggleFournisseurActif = async (fournisseur: Fournisseur) => {
    try {
      await toggleFournisseurActif(fournisseur.id, !fournisseur.actif)
      toast({ title: "Succes", description: "Statut du fournisseur mis a jour" })
      refreshFournisseurs()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  // ── Render ────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestion des parametres du module stock</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="articles" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Articles</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="depots" className="gap-2">
              <Warehouse className="h-4 w-4" />
              <span className="hidden sm:inline">Depots</span>
            </TabsTrigger>
            <TabsTrigger value="fournisseurs" className="gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Fournisseurs</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════ ARTICLES ═══════════════ */}
          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Articles</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par reference ou designation..."
                      value={searchArticles}
                      onChange={(e) => setSearchArticles(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Button onClick={() => handleOpenArticleSheet()} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvel article
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e3a5f]">
                        <TableHead className="text-white font-medium">Reference</TableHead>
                        <TableHead className="text-white font-medium">Designation</TableHead>
                        <TableHead className="text-white font-medium">Categorie</TableHead>
                        <TableHead className="text-white font-medium">Unite</TableHead>
                        <TableHead className="text-white font-medium text-right">Prix unit.</TableHead>
                        <TableHead className="text-white font-medium text-right">Seuil alerte</TableHead>
                        <TableHead className="text-white font-medium">Fournisseur pref.</TableHead>
                        <TableHead className="text-white font-medium text-center">Actif</TableHead>
                        <TableHead className="text-white font-medium text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articlesLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">Chargement...</TableCell>
                        </TableRow>
                      ) : filteredArticles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <p className="text-gray-500">{searchArticles ? `Aucun resultat pour « ${searchArticles} »` : "Aucun article"}</p>
                            {searchArticles && (
                              <Button variant="ghost" size="sm" onClick={() => setSearchArticles("")} className="mt-2">Effacer</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredArticles.map((article, index) => (
                          <TableRow key={article.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                            <TableCell className="font-mono text-sm">{article.reference }</TableCell>
                            <TableCell className="font-medium">{article.nom}</TableCell>
                            <TableCell>
                              {article.categorie ? (
                                <Badge
                                  style={{
                                    backgroundColor: `${article.categorie.couleur || "#6b7280"}20`,
                                    color: article.categorie.couleur || "#6b7280",
                                    borderColor: article.categorie.couleur || "#6b7280",
                                  }}
                                  className="border"
                                >
                                  {article.categorie.nom}
                                </Badge>
                              ) : "-"}
                            </TableCell>
                            <TableCell>{article.unite}</TableCell>
                            <TableCell className="text-right">{formatMontantStock(article.prixUnitaireMoyen)}</TableCell>
                            <TableCell className="text-right">{article.seuilAlerte}</TableCell>
                            <TableCell>{article.fournisseurPreferentiel?.nom || "-"}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={article.actif} onCheckedChange={() => handleToggleArticleActif(article)} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenArticleSheet(article)}>
                                <Pencil className="h-4 w-4" />
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
          </TabsContent>

          {/* ═══════════════ CATEGORIES ═══════════════ */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Categories</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une categorie..."
                      value={searchCategories}
                      onChange={(e) => setSearchCategories(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Button onClick={() => handleOpenCategorieDialog()} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle categorie
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e3a5f]">
                        <TableHead className="text-white font-medium">Code</TableHead>
                        <TableHead className="text-white font-medium">Nom</TableHead>
                        <TableHead className="text-white font-medium">Couleur</TableHead>
                        <TableHead className="text-white font-medium">Description</TableHead>
                        <TableHead className="text-white font-medium text-center">Actif</TableHead>
                        <TableHead className="text-white font-medium text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoriesLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">Chargement...</TableCell>
                        </TableRow>
                      ) : filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-gray-500">{searchCategories ? `Aucun resultat pour « ${searchCategories} »` : "Aucune categorie"}</p>
                            {searchCategories && (
                              <Button variant="ghost" size="sm" onClick={() => setSearchCategories("")} className="mt-2">Effacer</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map((categorie, index) => (
                          <TableRow key={categorie.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                            <TableCell className="font-mono text-sm">{categorie.code}</TableCell>
                            <TableCell className="font-medium">{categorie.nom}</TableCell>
                            <TableCell>
                              {categorie.couleur ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: categorie.couleur }} />
                                  <span className="text-sm text-gray-500">{categorie.couleur}</span>
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-gray-500">{categorie.description || "-"}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={categorie.actif} onCheckedChange={() => handleToggleCategorieActif(categorie)} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenCategorieDialog(categorie)}>
                                <Pencil className="h-4 w-4" />
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
          </TabsContent>

          {/* ═══════════════ DEPOTS ═══════════════ */}
          <TabsContent value="depots">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Depots</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un depot..."
                      value={searchDepots}
                      onChange={(e) => setSearchDepots(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Button onClick={() => handleOpenDepotSheet()} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau depot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e3a5f]">
                        <TableHead className="text-white font-medium">Code</TableHead>
                        <TableHead className="text-white font-medium">Nom</TableHead>
                        <TableHead className="text-white font-medium">Adresse</TableHead>
                        <TableHead className="text-white font-medium">Responsable</TableHead>
                        <TableHead className="text-white font-medium text-center">Actif</TableHead>
                        <TableHead className="text-white font-medium text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depotsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">Chargement...</TableCell>
                        </TableRow>
                      ) : filteredDepots.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-gray-500">{searchDepots ? `Aucun resultat pour « ${searchDepots} »` : "Aucun depot"}</p>
                            {searchDepots && (
                              <Button variant="ghost" size="sm" onClick={() => setSearchDepots("")} className="mt-2">Effacer</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDepots.map((depot, index) => (
                          <TableRow key={depot.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                            <TableCell className="font-mono text-sm">{depot.code}</TableCell>
                            <TableCell className="font-medium">{depot.nom}</TableCell>
                            <TableCell>{depot.adresse || "-"}</TableCell>
                            <TableCell>{depot.responsable || "-"}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={depot.actif} onCheckedChange={() => handleToggleDepotActif(depot)} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDepotSheet(depot)}>
                                <Pencil className="h-4 w-4" />
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
          </TabsContent>

          {/* ═══════════════ FOURNISSEURS ═══════════════ */}
          <TabsContent value="fournisseurs">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Fournisseurs</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom, code ou email..."
                      value={searchFournisseurs}
                      onChange={(e) => setSearchFournisseurs(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Button onClick={() => handleOpenFournisseurSheet()} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau fournisseur
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e3a5f]">
                        <TableHead className="text-white font-medium">Code</TableHead>
                        <TableHead className="text-white font-medium">Nom</TableHead>
                        <TableHead className="text-white font-medium">Contact</TableHead>
                        <TableHead className="text-white font-medium">Telephone</TableHead>
                        <TableHead className="text-white font-medium">Email</TableHead>
                        <TableHead className="text-white font-medium">Specialites</TableHead>
                        <TableHead className="text-white font-medium text-center">Actif</TableHead>
                        <TableHead className="text-white font-medium text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fournisseursLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">Chargement...</TableCell>
                        </TableRow>
                      ) : filteredFournisseurs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <p className="text-gray-500">{searchFournisseurs ? `Aucun resultat pour « ${searchFournisseurs} »` : "Aucun fournisseur"}</p>
                            {searchFournisseurs && (
                              <Button variant="ghost" size="sm" onClick={() => setSearchFournisseurs("")} className="mt-2">Effacer</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFournisseurs.map((fournisseur, index) => (
                          <TableRow key={fournisseur.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-[#f9fafb] dark:bg-gray-900"}>
                            <TableCell className="font-mono text-sm">{fournisseur.code}</TableCell>
                            <TableCell className="font-medium">{fournisseur.nom}</TableCell>
                            <TableCell>{fournisseur.contact || "-"}</TableCell>
                            <TableCell>{fournisseur.telephone || "-"}</TableCell>
                            <TableCell>{fournisseur.email || "-"}</TableCell>
                            <TableCell>
                              {fournisseur.specialites?.length ? (
                                <div className="flex flex-wrap gap-1">
                                  {fournisseur.specialites.map((s) => (
                                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                  ))}
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch checked={fournisseur.actif} onCheckedChange={() => handleToggleFournisseurActif(fournisseur)} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenFournisseurSheet(fournisseur)}>
                                <Pencil className="h-4 w-4" />
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
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════ DIALOG ARTICLE ═══════════════ */}
      <Dialog open={articleSheetOpen} onOpenChange={setArticleSheetOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col gap-0">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Modifier l'article" : "Creer un article"}</DialogTitle>
            <DialogDescription>
              {editingArticle ? "Modifiez les informations de l'article" : "Renseignez les informations du nouvel article"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 -mr-1">
            <div className="grid grid-cols-2 gap-4">
{/*               <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="ex: MAT-001"
                  value={articleForm.reference}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, code: e.target.value }))}
                />
              </div> */}
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input
                  placeholder="ex: REF-001"
                  value={articleForm.reference}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Input
                placeholder="Designation de l'article"
                value={articleForm.designation}
                onChange={(e) => setArticleForm(prev => ({ ...prev, designation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description optionnelle..."
                value={articleForm.description}
                onChange={(e) => setArticleForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Categorie *</Label>
              <Select value={articleForm.categorieId} onValueChange={(v) => setArticleForm(prev => ({ ...prev, categorieId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <div className="flex items-center gap-2">
                        {cat.couleur && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.couleur }} />}
                        {cat.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unite de mesure *</Label>
              <Select value={articleForm.unite} onValueChange={(v) => setArticleForm(prev => ({ ...prev, unite: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une unite" />
                </SelectTrigger>
                <SelectContent>
                  {uniteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix unitaire (F CFA)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={articleForm.prixUnitaire || ""}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, prixUnitaire: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Seuil alerte *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={articleForm.seuilAlerte || ""}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, seuilAlerte: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fournisseur preferentiel</Label>
              <Popover open={fournisseurComboOpen} onOpenChange={setFournisseurComboOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {articleForm.fournisseurPreferentielId
                      ? fournisseurs.find((f) => String(f.id) === articleForm.fournisseurPreferentielId)?.nom
                      : "Selectionner un fournisseur..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un fournisseur..." />
                    <CommandList>
                      <CommandEmpty>Aucun fournisseur trouve.</CommandEmpty>
                      <CommandGroup>
                        {fournisseurs.map((fournisseur) => (
                          <CommandItem
                            key={fournisseur.id}
                            value={fournisseur.nom}
                            onSelect={() => {
                              setArticleForm(prev => ({ ...prev, fournisseurPreferentielId: String(fournisseur.id) }))
                              setFournisseurComboOpen(false)
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", articleForm.fournisseurPreferentielId === String(fournisseur.id) ? "opacity-100" : "opacity-0")} />
                            {fournisseur.nom}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" onClick={() => setArticleSheetOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveArticle} disabled={articleSubmitting} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
              {articleSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DIALOG CATEGORIE ═══════════════ */}
      <Dialog open={categorieDialogOpen} onOpenChange={setCategorieDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategorie ? "Modifier la categorie" : "Creer une categorie"}</DialogTitle>
            <DialogDescription>
              {editingCategorie ? "Modifiez les informations de la categorie" : "Renseignez les informations de la nouvelle categorie"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                placeholder="ex: GROS_OEUVRE"
                maxLength={20}
                value={categorieForm.code}
                onChange={(e) => setCategorieForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Nom de la categorie"
                value={categorieForm.nom}
                onChange={(e) => setCategorieForm(prev => ({ ...prev, nom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Description optionnelle"
                value={categorieForm.description}
                onChange={(e) => setCategorieForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setCategorieForm(prev => ({ ...prev, couleur: color.value }))}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      categorieForm.couleur === color.value ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Apercu</Label>
              <Badge style={{ backgroundColor: `${categorieForm.couleur}20`, color: categorieForm.couleur, borderColor: categorieForm.couleur }} className="border">
                {categorieForm.nom || "Nom de la categorie"}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCategorieDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveCategorie} disabled={categorieSubmitting} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
              {categorieSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DIALOG DEPOT ═══════════════ */}
      <Dialog open={depotSheetOpen} onOpenChange={setDepotSheetOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] flex flex-col gap-0">
          <DialogHeader>
            <DialogTitle>{editingDepot ? "Modifier le depot" : "Creer un depot"}</DialogTitle>
            <DialogDescription>
              {editingDepot ? "Modifiez les informations du depot" : "Renseignez les informations du nouveau depot"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 -mr-1">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                placeholder="ex: DEP-CENTRAL"
                value={depotForm.code}
                onChange={(e) => setDepotForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Nom du depot"
                value={depotForm.nom}
                onChange={(e) => setDepotForm(prev => ({ ...prev, nom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Textarea
                placeholder="Adresse du depot..."
                value={depotForm.adresse}
                onChange={(e) => setDepotForm(prev => ({ ...prev, adresse: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Input
                placeholder="Nom du responsable"
                value={depotForm.responsable}
                onChange={(e) => setDepotForm(prev => ({ ...prev, responsable: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" onClick={() => setDepotSheetOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveDepot} disabled={depotSubmitting} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
              {depotSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DIALOG FOURNISSEUR ═══════════════ */}
      <Dialog open={fournisseurSheetOpen} onOpenChange={setFournisseurSheetOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] flex flex-col gap-0">
          <DialogHeader>
            <DialogTitle>{editingFournisseur ? "Modifier le fournisseur" : "Creer un fournisseur"}</DialogTitle>
            <DialogDescription>
              {editingFournisseur ? "Modifiez les informations du fournisseur" : "Renseignez les informations du nouveau fournisseur"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 -mr-1">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                placeholder="ex: FOUR-001"
                value={fournisseurForm.code}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Nom du fournisseur"
                value={fournisseurForm.nom}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, nom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input
                placeholder="Nom du contact"
                value={fournisseurForm.contact}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, contact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telephone</Label>
              <Input
                placeholder="+225 XX XX XX XX XX"
                value={fournisseurForm.telephone}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, telephone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@exemple.ci"
                value={fournisseurForm.email}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                placeholder="Adresse du fournisseur"
                value={fournisseurForm.adresse}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, adresse: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Specialites</Label>
              <Input
                placeholder="ex: Materiaux, Electricite, Plomberie (separees par virgule)"
                value={fournisseurForm.specialites}
                onChange={(e) => setFournisseurForm(prev => ({ ...prev, specialites: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Separez les specialites par une virgule</p>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" onClick={() => setFournisseurSheetOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveFournisseur} disabled={fournisseurSubmitting} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
              {fournisseurSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
