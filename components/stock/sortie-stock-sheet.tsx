"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, LogOut, AlertCircle, X as XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useInventaire, useDepotsList, useMouvementsActions } from "@/hooks/useStock"
import { useProjetsList } from "@/hooks/useProjet"
import { StatutStockColors, StatutStockLabels, type InventaireItem } from "@/types/stock"

interface SortieStockSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedStock?: InventaireItem | null
  onSuccess?: () => void
}

export function SortieStockSheet({ open, onOpenChange, preselectedStock, onSuccess }: SortieStockSheetProps) {
  const { toast } = useToast()
  const { items: inventaire } = useInventaire({ page: 1, pageSize: 200 })
  const { items: depots } = useDepotsList({ page: 1, pageSize: 100 })
  const { sortieStock, loading: submitting } = useMouvementsActions()
  const { projets } = useProjetsList()

  const [articleId, setArticleId] = useState<number | null>(null)
  const [depotId, setDepotId] = useState<number | null>(null)
  const [quantite, setQuantite] = useState("")
  const [projetId, setProjetId] = useState<number | null>(null)
  const [motif, setMotif] = useState("")
  const [notes, setNotes] = useState("")
  const [articleOpen, setArticleOpen] = useState(false)
  const [projetOpen, setProjetOpen] = useState(false)

  // Deduplicate articles from inventaire
  const articles = useMemo(() => {
    const seen = new Set<number>()
    return inventaire.filter((s) => {
      if (!s.article || seen.has(s.articleId)) return false
      seen.add(s.articleId)
      return true
    }).map((s) => s.article!)
  }, [inventaire])

  const stockInfo = useMemo(() => {
    if (!articleId || !depotId) return null
    return inventaire.find((s) => s.articleId === articleId && s.depotId === depotId)
  }, [articleId, depotId, inventaire])

  const selectedArticle = articles.find((a) => a.id === articleId)
  const selectedProjet = projets.find((p) => p.id === projetId)
  const stockDisponible = stockInfo?.quantiteLibre ?? 0
  const quantiteNum = parseInt(quantite) || 0
  const isQuantityExceeded = quantiteNum > stockDisponible

  useEffect(() => {
    if (open && preselectedStock) {
      setArticleId(preselectedStock.articleId)
      setDepotId(preselectedStock.depotId)
    }
  }, [open, preselectedStock])

  const handleSubmit = async () => {
    if (!articleId || !depotId || !quantite || !motif || isQuantityExceeded) return
    try {
      await sortieStock({
        articleId,
        depotId,
        quantite: quantiteNum,
        projetId: projetId ?? undefined,
        notes: [motif, notes].filter(Boolean).join(" — ") || undefined,
      })
      toast({ title: "Sortie de stock enregistrée" })
      handleReset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setArticleId(null)
    setDepotId(null)
    setQuantite("")
    setProjetId(null)
    setMotif("")
    setNotes("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <div className="flex-none px-6 py-5 border-b border-gray-200">
          <SheetTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-600" />
            Enregistrer une sortie de stock
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-sm text-gray-500">
            Enregistrez une sortie manuelle de stock.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Article */}
          <div className="space-y-2">
            <Label>Article <span className="text-red-500">*</span></Label>
            <Popover open={articleOpen} onOpenChange={setArticleOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {selectedArticle ? (
                    <span className="truncate">
                      {selectedArticle.articleNom || selectedArticle.reference || selectedArticle.code}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sélectionner un article...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher un article..." />
                  <CommandList className="max-h-[264px] overflow-y-auto">
                    <CommandEmpty>Aucun article trouvé.</CommandEmpty>
                    <CommandGroup>
                      {articles.map((article) => {
                        const stock = inventaire.find(
                          (s) => s.articleId === article.id && (depotId ? s.depotId === depotId : true)
                        )
                        return (
                          <CommandItem
                            key={article.id}
                            value={`${article.reference || article.code} ${article.articleNom}`}
                            onSelect={() => { setArticleId(article.id); setArticleOpen(false) }}
                          >
                            <Check className={cn("mr-2 h-4 w-4 shrink-0", articleId === article.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium truncate">{article.articleNom}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {article.reference || article.code}
                                {article.categorie?.nom && ` · ${article.categorie.nom}`}
                                {stock && ` · Dispo: ${stock.quantiteLibre}`}
                              </span>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Dépôt */}
          <div className="space-y-2">
            <Label>Dépôt source <span className="text-red-500">*</span></Label>
            <Select value={depotId ? String(depotId) : ""} onValueChange={(v) => setDepotId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un dépôt" /></SelectTrigger>
              <SelectContent>
                {depots.map((depot) => (
                  <SelectItem key={depot.id} value={String(depot.id)}>{depot.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock disponible */}
          {articleId && depotId && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock disponible</span>
                {stockInfo && (
                  <Badge className={cn("rounded-full px-2 py-1 text-xs font-medium", StatutStockColors[stockInfo.statut])}>
                    {StatutStockLabels[stockInfo.statut]}
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums">{stockDisponible}</span>
                <span className="text-sm text-muted-foreground">{selectedArticle?.unite}</span>
              </div>
              {!stockInfo && (
                <p className="text-sm text-amber-600">Aucun stock trouvé pour cet article dans ce dépôt.</p>
              )}
            </div>
          )}

          {/* Quantité */}
          <div className="space-y-2">
            <Label>Quantité <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                type="number" min="1" max={stockDisponible}
                value={quantite} onChange={(e) => setQuantite(e.target.value)}
                placeholder="0" className={cn("flex-1", isQuantityExceeded && "border-red-500")}
              />
              {selectedArticle && (
                <span className="text-sm text-muted-foreground w-16">{selectedArticle.unite}</span>
              )}
            </div>
            {isQuantityExceeded && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                La quantité dépasse le stock disponible ({stockDisponible})
              </p>
            )}
          </div>

          {/* Projet lié */}
          <div className="space-y-2">
            <Label>Projet lié <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
            <div className="flex items-center gap-2">
              <Popover open={projetOpen} onOpenChange={setProjetOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="flex-1 justify-between font-normal h-9">
                    {selectedProjet ? (
                      <span className="truncate">{selectedProjet.numero} — {selectedProjet.nom}</span>
                    ) : (
                      <span className="text-muted-foreground">Rechercher un projet...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher..." />
                    <CommandList className="max-h-[264px] overflow-y-auto">
                      <CommandEmpty>Aucun projet trouvé</CommandEmpty>
                      <CommandGroup>
                        {projets.map((projet) => (
                          <CommandItem
                            key={projet.id}
                            value={`${projet.numero} ${projet.nom}`}
                            onSelect={() => { setProjetId(projet.id); setProjetOpen(false) }}
                          >
                            <Check className={cn("mr-2 h-4 w-4 shrink-0 text-[#1e3a5f]", projetId === projet.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm truncate">{projet.nom}</span>
                              <span className="text-xs text-muted-foreground font-mono">{projet.numero}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedProjet && (
                <Button variant="ghost" size="sm" className="h-9 px-2" onClick={() => setProjetId(null)}>
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedProjet && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{selectedProjet.numero}</span>
                <span className="font-medium truncate">{selectedProjet.nom}</span>
              </div>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label>Motif de sortie <span className="text-red-500">*</span></Label>
            <Input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Raison de la sortie de stock..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex-none px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={!articleId || !depotId || !quantite || !motif || isQuantityExceeded || submitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? "Enregistrement..." : "Enregistrer la sortie"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
