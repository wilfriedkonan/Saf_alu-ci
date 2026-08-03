"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useArticlesList, useDepotsList, useMouvementsActions } from "@/hooks/useStock"
import type { InventaireItem, ItemInventaire } from "@/types/stock"

interface EntreeStockSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedStock?: ItemInventaire | null
  demandeId?: number
  demandeNumero?: string
  projetNom?: string
  onSuccess?: () => void
}

export function EntreeStockSheet({
  open,
  onOpenChange,
  preselectedStock,
  demandeId,
  demandeNumero,
  projetNom,
  onSuccess,
}: EntreeStockSheetProps) {
  const { toast } = useToast()
  const { items: articles } = useArticlesList({ page: 1, pageSize: 200 })
  const { items: depots } = useDepotsList({ page: 1, pageSize: 100 })
  const { entreeStock, loading: submitting } = useMouvementsActions()

  const [articleId, setArticleId] = useState<number | null>(null)
  const [depotId, setDepotId] = useState<number | null>(null)
  const [quantite, setQuantite] = useState("")
  const [prixUnitaire, setPrixUnitaire] = useState("")
  const [referenceBL, setReferenceBL] = useState("")
  const [notes, setNotes] = useState("")
  const [articleOpen, setArticleOpen] = useState(false)

  const selectedArticle = articles.find((a) => a.id === articleId)

  useEffect(() => {
    if (open) {
      if (preselectedStock) {
        setArticleId(preselectedStock.articleId)
        setDepotId(preselectedStock.depotId)
        if (preselectedStock.prixUnitaireMoyenMoyenMoyen) {
          setPrixUnitaire(String(preselectedStock.prixUnitaireMoyenMoyenMoyen))
        }
      }
      if (demandeNumero) setNotes(`Livraison demande ${demandeNumero}`)
    }
  }, [open, preselectedStock, demandeNumero])

  const handleSubmit = async () => {
    if (!articleId || !depotId || !quantite) return
    try {
      await entreeStock({
        articleId,
        depotId,
        quantite: parseInt(quantite),
        prixUnitaireMoyenMoyen: prixUnitaire ? parseFloat(prixUnitaire) : undefined,
        reference: referenceBL || undefined,
        notes: notes || undefined,
      })
      toast({ title: "Entree de stock enregistree" })
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
    setPrixUnitaire("")
    setReferenceBL("")
    setNotes("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <div className="flex-none px-6 py-5 border-b border-gray-200">
          <SheetTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Enregistrer une entree de stock
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-sm text-gray-500">
            Enregistrez la reception de marchandises dans un depot.
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
                    <span className="truncate">{selectedArticle.reference || selectedArticle.reference} - {selectedArticle.Nom}</span>
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
                          value={`${article.reference || article.reference} ${article.Nom}`}
                          onSelect={() => {
                            setArticleId(article.id)
                            if (article.prixUnitaireMoyenMoyen) setPrixUnitaire(String(article.prixUnitaireMoyenMoyen))
                            setArticleOpen(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", articleId === article.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-medium">{article.reference || article.reference} - {article.Nom}</span>
                            <span className="text-xs text-muted-foreground">
                              {article.categorie?.nom} | {article.unite}
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

          {/* Depot */}
          <div className="space-y-2">
            <Label>Depot de destination <span className="text-red-500">*</span></Label>
            <Select value={depotId ? String(depotId) : ""} onValueChange={(v) => setDepotId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Selectionner un depot" /></SelectTrigger>
              <SelectContent>
                {depots.map((depot) => (
                  <SelectItem key={depot.id} value={String(depot.id)}>{depot.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantite */}
          <div className="space-y-2">
            <Label>Quantite recue <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input type="number" min="1" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="0" className="flex-1" />
              {selectedArticle && <span className="text-sm text-muted-foreground w-16">{selectedArticle.unite}</span>}
            </div>
          </div>

          {/* Prix unitaire */}
          <div className="space-y-2">
            <Label>Prix unitaire reel (optionnel)</Label>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} placeholder="Prix unitaire" className="flex-1" />
              <span className="text-sm text-muted-foreground">F CFA</span>
            </div>
          </div>

          {/* Reference BL */}
          <div className="space-y-2">
            <Label>N° de reference / BL (optionnel)</Label>
            <Input value={referenceBL} onChange={(e) => setReferenceBL(e.target.value)} placeholder="Ex: BL-2024-0123" />
          </div>

          {/* Lien demande */}
          {demandeNumero && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
              <Label className="text-xs text-muted-foreground">Liee a la demande</Label>
              <p className="font-medium">{demandeNumero}</p>
              {projetNom && <p className="text-sm text-muted-foreground">{projetNom}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes (optionnel)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informations complementaires..." rows={3} className="resize-none" />
          </div>
        </div>

        <div className="flex-none px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!articleId || !depotId || !quantite || submitting} className="bg-green-600 hover:bg-green-700 text-white">
            {submitting ? "Enregistrement..." : "Enregistrer l'entree"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
