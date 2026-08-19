"use client"

import type React from "react"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Search, Loader2, CheckCircle2, AlertTriangle, XCircle, Building2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useArticlesAll, useArticlesActions } from "@/hooks/useArticle"
import { ArticleService } from "@/services/articleService"
import { useCategoriesAll } from "@/hooks/useCategorie"
import { useDepotsList } from "@/hooks/useDepot"
import { useFournisseursList } from "@/hooks/useFournisseur"
import { useProjetsList } from "@/hooks/useProjet"
import { useMouvementsActions, useInventaire } from "@/hooks/useStock"
import { useComptesList, useMouvementActions } from "@/hooks/useTresorerie"
import type { Article } from "@/types/article"
import type {
  BordereauEntreeRequest,
  BordereauSortieRequest,
  BordereauEntreeResultDTO,
  BordereauSortieResultDTO,
} from "@/types/stock"

export type BordereauType = "entree" | "sortie"

interface LigneForm {
  key: string
  articleId: string
  quantite: string
  prixUnitaire: string
  notes: string
}

const createEmptyLigne = (): LigneForm => ({
  key: Math.random().toString(36).slice(2),
  articleId: "",
  quantite: "",
  prixUnitaire: "",
  notes: "",
})

const formatFCFA = (amount: number) =>
  `${Math.round(amount || 0).toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`

interface BordereauFormProps {
  type: BordereauType
}

function ArticleAutocomplete({
  articles,
  loading,
  value,
  onSelect,
}: {
  articles: Article[]
  loading: boolean
  value: string
  onSelect: (article: Article) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selected = useMemo(() => articles.find((a) => String(a.id) === value), [articles, value])

  const filtered = useMemo(() => {
    if (!search.trim()) return articles
    const q = search.trim().toLowerCase()
    return articles.filter(
      (a) => a.nom.toLowerCase().includes(q) || (a.reference || "").toLowerCase().includes(q)
    )
  }, [articles, search])

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
        >
          <span className="truncate">
            {loading ? "Chargement..." : selected ? selected.nom : "Sélectionner un article..."}
          </span>
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="h-9"
          />
        </div>
        <ScrollArea className="h-[220px]">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Aucun article trouvé.</p>
          ) : (
            <div className="p-1">
              {filtered.map((article) => (
                <button
                  type="button"
                  key={article.id}
                  onClick={() => {
                    onSelect(article)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm hover:bg-accent",
                    String(article.id) === value && "bg-accent"
                  )}
                >
                  <span className="font-medium">{article.nom}</span>
                  {article.reference && (
                    <span className="text-xs text-muted-foreground">Réf: {article.reference}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

const uniteOptions = [
  { value: "PIECE",   label: "Pièce" },
  { value: "KG",      label: "Kilogramme (kg)" },
  { value: "ML",      label: "Mètre linéaire (m)" },
  { value: "M2",      label: "Mètre carré (m2)" },
  { value: "M3",      label: "Mètre cube (m3)" },
  { value: "LITRE",   label: "Litre" },
  { value: "SAC",     label: "Sac" },
  { value: "TONNE",   label: "Tonne" },
  { value: "FORFAIT", label: "Forfait" },
  { value: "ROULEAU", label: "Rouleau" },
  { value: "BOITE",   label: "Boîte" },
  { value: "UNITE",   label: "Unité" },
]

interface QuickCreateArticleForm {
  reference: string
  nom: string
  categorieId: string
  unite: string
  prixUnitaireMoyen: string
  seuilAlerte: string
}

const initialQuickCreateArticleForm: QuickCreateArticleForm = {
  reference: "",
  nom: "",
  categorieId: "",
  unite: "",
  prixUnitaireMoyen: "",
  seuilAlerte: "",
}

function QuickCreateArticleDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (article: Article) => void
}) {
  const { toast } = useToast()
  const { items: categories, loading: loadingCategories } = useCategoriesAll()
  const { createArticle, loading: creating } = useArticlesActions()
  const [form, setForm] = useState<QuickCreateArticleForm>(initialQuickCreateArticleForm)

  useEffect(() => {
    if (!open) setForm(initialQuickCreateArticleForm)
  }, [open])

  const handleChange = (field: keyof QuickCreateArticleForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    if (!form.nom.trim() || !form.categorieId || !form.unite) {
      toast({
        title: "Champs manquants",
        description: "Veuillez renseigner la désignation, la catégorie et l'unité.",
        variant: "destructive",
      })
      return
    }
    try {
      const response = await createArticle({
        reference: form.reference || undefined,
        nom: form.nom.trim(),
        categorieId: Number(form.categorieId),
        unite: form.unite,
        prixUnitaireMoyen: Number(form.prixUnitaireMoyen) || 0,
        seuilAlerte: Number(form.seuilAlerte) || 0,
      })

      toast({ title: "Article créé", description: `"${form.nom.trim()}" a été créé avec succès.` })

      let created = response?.data

      // Si l'API ne renvoie pas l'article créé, on le retrouve via la liste fraîche
      // pour pouvoir quand même le sélectionner automatiquement.
      if (!created) {
        try {
          const freshList = await ArticleService.getArticles({ actif: true })
          const nomSaisi = form.nom.trim()
          const candidats = freshList.filter((a) => a.nom === nomSaisi)
          created =
            candidats.find((a) => (form.reference ? a.reference === form.reference : true)) ??
            candidats.sort((a, b) => b.id - a.id)[0]
        } catch {
          // ignore — la création a réussi, seule la sélection automatique échoue
        }
      }

      if (created) {
        onCreated(created)
      }
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de créer l'article",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Nouvel article</DialogTitle>
          <DialogDescription>Créez rapidement un article de stock qui n'existe pas encore.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Référence</Label>
            <Input
              placeholder="ex: REF-001"
              value={form.reference}
              onChange={(e) => handleChange("reference", e.target.value)}
            />
          </div>
          <div>
            <Label>Désignation *</Label>
            <Input
              placeholder="Désignation de l'article"
              value={form.nom}
              onChange={(e) => handleChange("nom", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Catégorie *</Label>
              <Select value={form.categorieId} onValueChange={(v) => handleChange("categorieId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Chargement..." : "Sélectionner"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unité *</Label>
              <Select value={form.unite} onValueChange={(v) => handleChange("unite", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {uniteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prix unitaire (F CFA)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.prixUnitaireMoyen}
                onChange={(e) => handleChange("prixUnitaireMoyen", e.target.value)}
              />
            </div>
            <div>
              <Label>Seuil alerte</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.seuilAlerte}
                onChange={(e) => handleChange("seuilAlerte", e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" onClick={handleCreate} disabled={creating} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BordereauForm({ type }: BordereauFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEntree = type === "entree"
  const accent = isEntree ? "green" : "orange"

  const { items: articles, loading: loadingArticles } = useArticlesAll()
  const { items: depots, loading: loadingDepots } = useDepotsList({ page: 1, pageSize: 100 })
  const { items: fournisseurs, loading: loadingFournisseurs } = useFournisseursList({ page: 1, pageSize: 100 })
  const { projets, loading: loadingProjets } = useProjetsList()
  const { bordereauEntree, bordereauSortie, loading: submittingBordereau } = useMouvementsActions()
  const { createMouvement } = useMouvementActions()
  const { comptes, loading: loadingComptes } = useComptesList()
  const { items: inventaireItems, setParams: setInventaireParams } = useInventaire({ page: 1, pageSize: 500 })

  const [depotId, setDepotId] = useState("")
  const [reference, setReference] = useState("")
  const [dateMouvement, setDateMouvement] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")
  const [fournisseurId, setFournisseurId] = useState("")
  const [motifSortie, setMotifSortie] = useState("")
  const [projetId, setProjetId] = useState("")
  const [lignes, setLignes] = useState<LigneForm[]>([createEmptyLigne()])
  const [agirDansLaCaisse, setAgirDansLaCaisse] = useState(false)
  const [creatingMouvementFinancier, setCreatingMouvementFinancier] = useState(false)

  // Articles créés à la volée depuis une ligne, affichés immédiatement le temps que la liste se rafraîchisse
  const [extraArticles, setExtraArticles] = useState<Article[]>([])
  const [createArticleLigneKey, setCreateArticleLigneKey] = useState<string | null>(null)

  const comboArticles = useMemo(() => {
    const knownIds = new Set(articles.map((a) => a.id))
    const pending = extraArticles.filter((a) => !knownIds.has(a.id))
    return [...pending, ...articles]
  }, [articles, extraArticles])

  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    result: BordereauEntreeResultDTO | BordereauSortieResultDTO | null
    mouvementFinancierCree: boolean
  }>({ open: false, result: null, mouvementFinancierCree: false })

  // Charge le stock disponible du dépôt sélectionné (utile côté sortie uniquement)
  useEffect(() => {
    if (!isEntree && depotId) {
      setInventaireParams((prev) => ({ ...prev, depotId: Number(depotId), page: 1, pageSize: 500 }))
    }
  }, [isEntree, depotId, setInventaireParams])

  const loadingRefData = loadingArticles || loadingDepots

  // Montant total du bordereau, calculé à partir du prix unitaire saisi sur chaque ligne
  // (entrée comme sortie).
  const montantTotal = useMemo(() => {
    return lignes.reduce((sum, l) => {
      const q = Number(l.quantite) || 0
      const pu = Number(l.prixUnitaire) || 0
      return sum + q * pu
    }, 0)
  }, [lignes])

  const hasAnyPrix = lignes.some((l) => Number(l.prixUnitaire) > 0)

  // Côté entrée : champ Projet non modifiable, dérivé des projets liés au dépôt sélectionné
  const projetsAssocies = useMemo(() => {
    if (!depotId) return []
    return projets.filter((p) => p.depotId === Number(depotId))
  }, [projets, depotId])

  // Projet qui pilote le mouvement financier automatique : dérivé du dépôt côté entrée
  // (premier projet associé disposant d'un CompteId valide), sélectionné manuellement côté sortie.
  const projetPourMouvement = useMemo(() => {
    if (isEntree) {
      return projetsAssocies.find((p) => p.compteId && comptes.some((c) => c.id === p.compteId))
    }
    if (!projetId) return undefined
    const p = projets.find((pr) => String(pr.id) === projetId)
    return p?.compteId && comptes.some((c) => c.id === p.compteId) ? p : undefined
  }, [isEntree, projetsAssocies, projetId, projets, comptes])

  const compteAuto = useMemo(() => {
    if (!projetPourMouvement?.compteId) return undefined
    return comptes.find((c) => c.id === projetPourMouvement.compteId)
  }, [projetPourMouvement, comptes])

  // Côté entrée, le projet est déduit automatiquement du dépôt : le switch peut donc suivre
  // la détection du compte sans action de l'utilisateur.
  // Côté sortie, le projet est choisi manuellement : l'activation reste manuelle, on se contente
  // de désactiver le switch si le compte détecté n'est plus valable.
  useEffect(() => {
    if (isEntree) {
      setAgirDansLaCaisse(!!compteAuto)
    } else if (!compteAuto) {
      setAgirDansLaCaisse(false)
    }
  }, [isEntree, compteAuto?.id])

  const stockDisponible = (articleId: string) => {
    if (!articleId) return undefined
    return inventaireItems.find((i) => i.articleId === Number(articleId))?.quantiteDisponible
  }

  const handleLigneChange = (key: string, field: keyof LigneForm, value: string) => {
    setLignes((prev) => prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)))
  }

  const handleSelectArticleForLigne = (key: string, article: Article) => {
    setLignes((prev) => prev.map((l) => (l.key === key ? { ...l, articleId: String(article.id) } : l)))
  }

  const handleArticleCreatedForLigne = (article: Article) => {
    if (!createArticleLigneKey) return
    setExtraArticles((prev) => [article, ...prev.filter((a) => a.id !== article.id)])
    handleSelectArticleForLigne(createArticleLigneKey, article)
    setCreateArticleLigneKey(null)
  }

  const handleAddLigne = () => setLignes((prev) => [...prev, createEmptyLigne()])

  const handleRemoveLigne = (key: string) => {
    setLignes((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)))
  }

  const resetForm = () => {
    setDepotId("")
    setReference("")
    setDateMouvement(new Date())
    setNotes("")
    setFournisseurId("")
    setMotifSortie("")
    setProjetId("")
    setLignes([createEmptyLigne()])
    setAgirDansLaCaisse(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!depotId) {
      toast({ title: "Dépôt requis", description: "Veuillez sélectionner un dépôt.", variant: "destructive" })
      return
    }

    const lignesValides = lignes.filter((l) => l.articleId && Number(l.quantite) > 0)
    if (lignesValides.length === 0) {
      toast({
        title: "Ligne manquante",
        description: "Ajoutez au moins une ligne avec un article et une quantité.",
        variant: "destructive",
      })
      return
    }

    try {
      let result: BordereauEntreeResultDTO | BordereauSortieResultDTO

      if (isEntree) {
        const payload: BordereauEntreeRequest = {
          depotId: Number(depotId),
          reference: reference.trim() || undefined,
          fournisseurId: fournisseurId ? Number(fournisseurId) : undefined,
          notes: notes.trim() || undefined,
          dateMouvement: dateMouvement.toISOString(),
          lignes: lignesValides.map((l) => ({
            articleId: Number(l.articleId),
            quantite: Number(l.quantite),
            prixUnitaire: l.prixUnitaire ? Number(l.prixUnitaire) : undefined,
            notes: l.notes.trim() || undefined,
          })),
        }
        result = await bordereauEntree(payload)
      } else {
        const payload: BordereauSortieRequest = {
          depotId: Number(depotId),
          reference: reference.trim() || undefined,
          projetId: projetId ? Number(projetId) : undefined,
          motifSortie: motifSortie.trim() || undefined,
          notes: notes.trim() || undefined,
          dateMouvement: dateMouvement.toISOString(),
          lignes: lignesValides.map((l) => ({
            articleId: Number(l.articleId),
            quantite: Number(l.quantite),
            notes: l.notes.trim() || undefined,
          })),
        }
        result = await bordereauSortie(payload)
      }

      let mouvementFinancierCree = false
      const montantMouvement = isEntree
        ? (result as BordereauEntreeResultDTO).montantTotalEntre
        : montantTotal

      if (agirDansLaCaisse && montantMouvement > 0) {
        if (!compteAuto) {
          toast({
            title: "Mouvement financier non créé",
            description: "Le stock a bien été enregistré, mais aucun compte lié au projet n'a été trouvé.",
          })
        } else {
          try {
            setCreatingMouvementFinancier(true)
            const response = await createMouvement({
              compteId: compteAuto.id,
              typeMouvement: isEntree ? "Sortie" : "Entree",
              categorie: "Fournitures",
              montant: montantMouvement,
              libelle: `${isEntree ? "Entrée" : "Sortie"} stock ${reference || ""}`.trim(),
              reference: reference.trim() || undefined,
              description: notes.trim() || undefined,
              projetId: projetPourMouvement?.id,
            })
            if (response && response.success === false) {
              throw new Error(response.message || "Échec de la création du mouvement financier")
            }
            mouvementFinancierCree = true
          } catch (err) {
            toast({
              title: "Mouvement financier non créé",
              description: "Le stock a bien été enregistré, mais le mouvement de caisse associé a échoué.",
            })
          } finally {
            setCreatingMouvementFinancier(false)
          }
        }
      }

      setResultDialog({ open: true, result, mouvementFinancierCree })
    } catch (err) {
      toast({
        title: "Échec de l'enregistrement",
        description:
          err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement du bordereau.",
        variant: "destructive",
      })
    }
  }

  if (loadingRefData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const totalLignesResult = resultDialog.result?.nbLignesTotal ?? 0
  const succesLignesResult = resultDialog.result?.nbLignesReussies ?? 0
  const succesTotalResult = totalLignesResult > 0 && succesLignesResult === totalLignesResult

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card className={cn(isEntree ? "border-green-200" : "border-orange-200")}>
          <CardHeader>
            <CardTitle className="text-base">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Référence bordereau</Label>
                <Input
                  placeholder={isEntree ? "Ex: BL-2026-0042" : "Ex: BS-2026-0012"}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              <div>
                <Label>Dépôt *</Label>
                <Select value={depotId} onValueChange={setDepotId} disabled={loadingDepots}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDepots ? "Chargement..." : "Sélectionner un dépôt"} />
                  </SelectTrigger>
                  <SelectContent>
                    {depots.map((depot) => (
                      <SelectItem key={depot.id} value={String(depot.id)}>
                        {depot.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date du mouvement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateMouvement && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateMouvement ? format(dateMouvement, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateMouvement}
                      onSelect={(date) => date && setDateMouvement(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {isEntree ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fournisseur (optionnel)</Label>
                  <Select value={fournisseurId} onValueChange={setFournisseurId} disabled={loadingFournisseurs}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {fournisseurs.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Projet</Label>
                  <div className="flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2 text-sm min-h-[38px] justify-center">
                    {loadingProjets ? (
                      <span className="text-muted-foreground">Chargement...</span>
                    ) : !depotId ? (
                      <span className="text-muted-foreground">Sélectionnez d'abord un dépôt</span>
                    ) : projetsAssocies.length === 0 ? (
                      <span className="text-muted-foreground">Aucun projet associé à ce dépôt</span>
                    ) : (
                      projetsAssocies.map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{p.numero} - {p.nom}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Déduit automatiquement du dépôt sélectionné (non modifiable)
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Motif de sortie</Label>
                  <Input
                    placeholder="Ex: Consommation chantier"
                    value={motifSortie}
                    onChange={(e) => setMotifSortie(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Projet (optionnel)</Label>
                  <Select value={projetId} onValueChange={setProjetId} disabled={loadingProjets}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projets.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.numero} - {p.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label>Notes globales</Label>
              <Textarea
                rows={2}
                placeholder="Notes optionnelles sur ce bordereau..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lignes */}
        <Card className={cn(isEntree ? "border-green-200" : "border-orange-200")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Lignes du bordereau</CardTitle>
            <Badge variant="secondary">
              {lignes.length} ligne{lignes.length > 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className={lignes.length > 8 ? "h-[420px]" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Article</TableHead>
                      <TableHead className="w-28 text-right">Quantité</TableHead>
                      <TableHead className="hidden md:table-cell w-36 text-right">Prix unitaire</TableHead>
                      <TableHead className="hidden md:table-cell w-36 text-right">Montant</TableHead>
                      {!isEntree && <TableHead className="hidden md:table-cell w-32">Stock dispo</TableHead>}
                      <TableHead className="hidden md:table-cell">Notes</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lignes.map((ligne, index) => {
                      const montantLigne = (Number(ligne.quantite) || 0) * (Number(ligne.prixUnitaire) || 0)
                      const dispo = !isEntree ? stockDisponible(ligne.articleId) : undefined

                      return (
                        <Fragment key={ligne.key}>
                          <TableRow className="align-top">
                            <TableCell className="text-muted-foreground pt-3">{index + 1}</TableCell>
                            <TableCell className="pt-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <ArticleAutocomplete
                                    articles={comboArticles}
                                    loading={loadingArticles}
                                    value={ligne.articleId}
                                    onSelect={(article) => handleSelectArticleForLigne(ligne.key, article)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  title="Créer un nouvel article"
                                  onClick={() => setCreateArticleLigneKey(ligne.key)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="pt-3">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={ligne.quantite}
                                onChange={(e) => handleLigneChange(ligne.key, "quantite", e.target.value)}
                                className="text-right"
                              />
                            </TableCell>
                            <TableCell className="hidden md:table-cell pt-3">
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={ligne.prixUnitaire}
                                onChange={(e) => handleLigneChange(ligne.key, "prixUnitaire", e.target.value)}
                                className="text-right"
                              />
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-right font-medium pt-3">
                              {montantLigne > 0 ? formatFCFA(montantLigne) : "-"}
                            </TableCell>
                            {!isEntree && (
                              <TableCell className="hidden md:table-cell pt-3">
                                {dispo !== undefined ? (
                                  <Badge variant={dispo <= 0 ? "destructive" : "secondary"}>{dispo}</Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="hidden md:table-cell pt-3">
                              <Input
                                placeholder="Note (optionnel)"
                                value={ligne.notes}
                                onChange={(e) => handleLigneChange(ligne.key, "notes", e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="pt-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={lignes.length <= 1}
                                onClick={() => handleRemoveLigne(ligne.key)}
                                title="Supprimer la ligne"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* Sous-ligne mobile : prix/stock + notes */}
                          <TableRow className="md:hidden">
                            <TableCell colSpan={99} className="pt-0 pb-3">
                              <div className="flex flex-wrap gap-3">
                                <div className="flex-1 min-w-[120px]">
                                  <Label className="text-xs text-muted-foreground">Prix unitaire</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={ligne.prixUnitaire}
                                    onChange={(e) => handleLigneChange(ligne.key, "prixUnitaire", e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                                {!isEntree && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Stock dispo</Label>
                                    <div className="pt-1">
                                      {dispo !== undefined ? (
                                        <Badge variant={dispo <= 0 ? "destructive" : "secondary"}>{dispo}</Badge>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div className="flex-1 min-w-[160px]">
                                  <Label className="text-xs text-muted-foreground">Notes</Label>
                                  <Input
                                    placeholder="Note (optionnel)"
                                    value={ligne.notes}
                                    onChange={(e) => handleLigneChange(ligne.key, "notes", e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                                {montantLigne > 0 && (
                                  <div className="text-xs text-muted-foreground self-end pb-2">
                                    Montant: <span className="font-medium text-foreground">{formatFCFA(montantLigne)}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handleAddLigne} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
          </CardContent>
        </Card>

        {/* Total + mouvement financier */}
        <Card className={cn(isEntree ? "border-green-200" : "border-orange-200")}>
          <CardContent className="pt-6 space-y-4">
            {hasAnyPrix && (
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Total bordereau</span>
                <span className="text-lg font-bold">{formatFCFA(montantTotal)}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={agirDansLaCaisse}
                  onCheckedChange={setAgirDansLaCaisse}
                  disabled={!compteAuto}
                />
                <div>
                  <p className="text-sm font-medium">Agir dans la caisse du projet</p>
                  <p className="text-xs text-muted-foreground">
                    {compteAuto
                      ? isEntree
                        ? "Un mouvement financier sera créé automatiquement sur le compte du projet"
                        : "Activez pour créer un mouvement financier sur le compte du projet"
                      : isEntree
                        ? "Activé automatiquement dès qu'un compte lié au projet est trouvé"
                        : "Sélectionnez un projet disposant d'un compte pour pouvoir l'activer"}
                  </p>
                </div>
              </div>
              {loadingComptes || loadingProjets ? (
                <Badge variant="outline" className="font-normal text-muted-foreground shrink-0">
                  Chargement...
                </Badge>
              ) : !compteAuto ? (
                <Badge variant="outline" className="font-normal text-muted-foreground shrink-0">
                  Aucun compte de projet trouvé
                </Badge>
              ) : agirDansLaCaisse ? (
                <Badge variant="secondary" className="font-normal shrink-0">
                  {isEntree
                    ? `Sortie caisse — ${compteAuto.nom}`
                    : `Entrée caisse — ${compteAuto.nom}`}
                </Badge>
              ) : (
                <Badge variant="outline" className="font-normal text-muted-foreground shrink-0">
                  Aucun mouvement financier ne sera créé
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.push("/stock/mouvements")}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={submittingBordereau || creatingMouvementFinancier}
            className={cn(
              isEntree ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700",
              "text-white"
            )}
          >
            {(submittingBordereau || creatingMouvementFinancier) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer le bordereau
          </Button>
        </div>
      </form>

      {/* Dialog de résultat */}
      <Dialog open={resultDialog.open} onOpenChange={(open) => setResultDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col gap-0">
          <DialogHeader>
            <DialogTitle
              className={cn("flex items-center gap-2", succesTotalResult ? "text-green-700" : "text-orange-700")}
            >
              {succesTotalResult ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {succesTotalResult ? "Bordereau enregistré" : "Bordereau partiellement enregistré"}
            </DialogTitle>
            <DialogDescription>{resultDialog.result?.message}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Avant</TableHead>
                    <TableHead className="text-right">Après</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultDialog.result?.lignes.map((ligne, idx) => (
                    <TableRow key={idx} className={ligne.succes ? "" : "bg-red-50"}>
                      <TableCell>
                        <div className="font-medium">{ligne.articleNom}</div>
                        {ligne.articleReference && (
                          <div className="text-xs text-muted-foreground">Réf: {ligne.articleReference}</div>
                        )}
                        {!ligne.succes && ligne.erreur && (
                          <div className="text-xs text-red-600 mt-0.5">{ligne.erreur}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{ligne.quantite}</TableCell>
                      <TableCell className="text-right">{ligne.quantiteAvant ?? "-"}</TableCell>
                      <TableCell className="text-right">{ligne.quantiteApres ?? "-"}</TableCell>
                      <TableCell className="text-center">
                        {ligne.succes ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {isEntree && (
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Montant total</span>
                <span className="font-semibold">
                  {formatFCFA((resultDialog.result as BordereauEntreeResultDTO)?.montantTotalEntre ?? 0)}
                </span>
              </div>
            )}

            {resultDialog.mouvementFinancierCree && (
              <Badge variant="secondary" className="font-normal">
                Mouvement financier créé
              </Badge>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            {succesTotalResult ? (
              <>
                <Button variant="outline" onClick={() => router.push("/stock/mouvements")}>
                  Voir l'historique
                </Button>
                <Button
                  onClick={() => {
                    setResultDialog({ open: false, result: null, mouvementFinancierCree: false })
                    resetForm()
                  }}
                  className={cn(isEntree ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700", "text-white")}
                >
                  Nouveau bordereau
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResultDialog({ open: false, result: null, mouvementFinancierCree: false })}
                >
                  Fermer
                </Button>
                <Button onClick={() => setResultDialog((prev) => ({ ...prev, open: false }))}>
                  Corriger et réessayer
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuickCreateArticleDialog
        open={createArticleLigneKey !== null}
        onOpenChange={(open) => !open && setCreateArticleLigneKey(null)}
        onCreated={handleArticleCreatedForLigne}
      />
    </>
  )
}
