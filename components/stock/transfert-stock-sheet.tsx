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
import { Check, ChevronsUpDown, ArrowLeftRight, AlertCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useInventaire, useDepotsList, useMouvementsActions } from "@/hooks/useStock"
import { StatutStockColors, StatutStockLabels, type InventaireItem } from "@/types/stock"

interface TransfertStockSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedStock?: InventaireItem | null
  onSuccess?: () => void
}

export function TransfertStockSheet({ open, onOpenChange, preselectedStock, onSuccess }: TransfertStockSheetProps) {
  const { toast } = useToast()
  const { items: inventaire } = useInventaire({ page: 1, pageSize: 200 })
  const { items: depots } = useDepotsList({ page: 1, pageSize: 100 })
  const { transfertStock, loading: submitting } = useMouvementsActions()

  const [articleId, setArticleId] = useState<number | null>(null)
  const [depotSourceId, setDepotSourceId] = useState<number | null>(null)
  const [depotDestId, setDepotDestId] = useState<number | null>(null)
  const [quantite, setQuantite] = useState("")
  const [notes, setNotes] = useState("")
  const [articleOpen, setArticleOpen] = useState(false)

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
    if (!articleId || !depotSourceId) return null
    return inventaire.find((s) => s.articleId === articleId && s.depotId === depotSourceId)
  }, [articleId, depotSourceId, inventaire])

  const selectedArticle = articles.find((a) => a.id === articleId)
  const depotsDest = depots.filter((d) => d.id !== depotSourceId)
  const stockDisponible = stockInfo?.quantiteLibre ?? 0
  const quantiteNum = parseInt(quantite) || 0
  const isQuantityExceeded = quantiteNum > stockDisponible

  useEffect(() => {
    if (open && preselectedStock) {
      setArticleId(preselectedStock.articleId)
      setDepotSourceId(preselectedStock.depotId)
    }
  }, [open, preselectedStock])

  const handleSubmit = async () => {
    if (!articleId || !depotSourceId || !depotDestId || !quantite || isQuantityExceeded) return
    try {
      await transfertStock({
        articleId,
        depotSourceId,
        depotDestinationId: depotDestId,
        quantite: quantiteNum,
        notes: notes || undefined,
      })
      toast({ title: "Transfert de stock enregistre" })
      handleReset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setArticleId(null)
    setDepotSourceId(null)
    setDepotDestId(null)
    setQuantite("")
    setNotes("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <div className="flex-none px-6 py-5 border-b border-gray-200">
          <SheetTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            Transfert inter-depots
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-sm text-gray-500">
            Deplacez du stock d&apos;un depot vers un autre.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 sidebar-nav">
          {/* Article */}
          <div className="space-y-2">
            <Label>Article <span className="text-red-500">*</span></Label>
            <Popover open={articleOpen} onOpenChange={setArticleOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {selectedArticle ? (
                    <span className="truncate">{selectedArticle.reference || selectedArticle.code} - {selectedArticle.designation}</span>
                  ) : (
                    <span className="text-muted-foreground">Selectionner un article...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher un article..." />
                  <CommandList>
                    <CommandEmpty>Aucun article trouve.</CommandEmpty>
                    <CommandGroup>
                      {articles.map((article) => (
                        <CommandItem
                          key={article.id}
                          value={`${article.reference || article.code} ${article.designation}`}
                          onSelect={() => { setArticleId(article.id); setArticleOpen(false) }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", articleId === article.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-medium">{article.reference || article.code} - {article.designation}</span>
                            <span className="text-xs text-muted-foreground">{article.categorie?.nom} | {article.unite}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Depots source → destination */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label>Depot source <span className="text-red-500">*</span></Label>
              <Select value={depotSourceId ? String(depotSourceId) : ""} onValueChange={(v) => { setDepotSourceId(Number(v)); setDepotDestId(null) }}>
                <SelectTrigger><SelectValue placeholder="Depot source" /></SelectTrigger>
                <SelectContent>
                  {depots.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Label>Depot destination <span className="text-red-500">*</span></Label>
              <Select value={depotDestId ? String(depotDestId) : ""} onValueChange={(v) => setDepotDestId(Number(v))} disabled={!depotSourceId}>
                <SelectTrigger><SelectValue placeholder="Depot dest." /></SelectTrigger>
                <SelectContent>
                  {depotsDest.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock dispo */}
          {articleId && depotSourceId && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock disponible (source)</span>
                {stockInfo && (
                  <Badge className={cn("rounded-full px-2 py-1 text-xs font-medium", StatutStockColors[stockInfo.statut])}>
                    {StatutStockLabels[stockInfo.statut]}
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stockDisponible}</span>
                <span className="text-sm text-muted-foreground">{selectedArticle?.unite}</span>
              </div>
              {!stockInfo && <p className="text-sm text-amber-600">Aucun stock trouve pour cet article dans ce depot.</p>}
            </div>
          )}

          {/* Quantite */}
          <div className="space-y-2">
            <Label>Quantite a transferer <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                type="number" min="1" max={stockDisponible}
                value={quantite} onChange={(e) => setQuantite(e.target.value)}
                placeholder="0" className={cn("flex-1", isQuantityExceeded && "border-red-500")}
              />
              {selectedArticle && <span className="text-sm text-muted-foreground w-16">{selectedArticle.unite}</span>}
            </div>
            {isQuantityExceeded && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                La quantite depasse le stock disponible ({stockDisponible})
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes (optionnel)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Raison du transfert..." rows={3} className="resize-none" />
          </div>
        </div>

        <div className="flex-none px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={!articleId || !depotSourceId || !depotDestId || !quantite || isQuantityExceeded || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "Transfert en cours..." : "Confirmer le transfert"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
