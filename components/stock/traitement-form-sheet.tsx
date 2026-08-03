"use client"

import { Fragment, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sheet, SheetContent, SheetDescription, SheetTitle,
} from "@/components/ui/sheet"
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from "@/components/ui/command"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow, TableFooter,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Check, CheckCircle2, ChevronsUpDown, Info, Loader2, Save, Send,
  Warehouse, ShoppingCart, AlertTriangle, PackageCheck, MapPin,
  Plus, X, ArrowRight, CornerDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Demande, type TraitementRequest, formatMontantStock,
} from "@/types/stock"
import { useFournisseursAll } from "@/hooks/useFournisseur"
import { useDemandesActions } from "@/hooks/useStock"

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceArticle = "Stock" | "Commande"

interface DotationDepot {
  uid: string
  depotId?: number
  quantiteDotee: number
  estLivre: boolean
  enLivraison: boolean
  // dotationId supprimé : LivraisonDirecteAsync crée la dotation lui-même
}

interface ArticleGroupe {
  articleDemandeId: number
  designation: string
  unite: string
  quantiteDemandee: number
  quantiteValidee: number
  source: SourceArticle
  dotations: DotationDepot[]
  prixUnitaireDevis: number
  montantLigne: number
  /** Champs reliquat (Stock partiel → reste en commande) */
  reliquatPrixUnitaire: number
  reliquatQteValidee: number    // = getReste() par défaut, éditable
}

interface DepotOption {
  id: number
  nom: string
  code: string
}

interface TraitementFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demande: Demande
  depots?: DepotOption[]
  onSaveDraft: (data: TraitementRequest) => Promise<void>
  onSubmit: (data: TraitementRequest) => Promise<void>
}

const TVA_RATE = 0.18
let _seq = 0
const nextUid = () => `d_${++_seq}_${Date.now()}`

// ── Helpers ───────────────────────────────────────────────────────────────────

const getTotalDotee   = (g: ArticleGroupe) => g.dotations.reduce((s, d) => s + d.quantiteDotee, 0)
const getReste        = (g: ArticleGroupe) => Math.max(0, g.quantiteValidee - getTotalDotee(g))
const estCouvert      = (g: ArticleGroupe) => getTotalDotee(g) >= g.quantiteValidee && g.quantiteValidee > 0

// ── Composant ─────────────────────────────────────────────────────────────────

export function TraitementFormSheet({
  open, onOpenChange, demande, depots = [], onSaveDraft, onSubmit,
}: TraitementFormSheetProps) {
  const { items: fournisseurs, loading: fournisseursLoading } = useFournisseursAll()
  const { livraisonDirecte } = useDemandesActions()

  const [fournisseurId,       setFournisseurId]       = useState<number | undefined>(demande.traitement?.fournisseurId ?? undefined)
  const [isHorsBase,          setIsHorsBase]          = useState(!!demande.traitement?.nomFournisseurLibre)
  const [fournisseurHorsBase, setFournisseurHorsBase] = useState(demande.traitement?.nomFournisseurLibre || "")
  const [numeroDevis,         setNumeroDevis]         = useState(demande.traitement?.numeroDevis || demande.numero || "")
  const [dateDevis,           setDateDevis]           = useState(demande.traitement?.dateDevis || "")
  const [montantHT,           setMontantHT]           = useState(demande.traitement?.montantDevisHT || 0)
  const [montantTTC,          setMontantTTC]          = useState(demande.traitement?.montantDevisTTC || 0)
  const [delaiLivraison,      setDelaiLivraison]      = useState(demande.traitement?.delaiLivraison || "")
  const [conditionsPaiement,  setConditionsPaiement]  = useState(demande.traitement?.conditionsPaiement || "")
  const [notesTraitement,     setNotesTraitement]     = useState(demande.traitement?.notes || "")
  const [fournisseurOpen,     setFournisseurOpen]     = useState(false)
  const [saving,              setSaving]              = useState(false)
  const [submitting,          setSubmitting]          = useState(false)

  // ── Build groupes ─────────────────────────────────────────────────────────

  const buildGroupe = (art: typeof demande.articles[number]): ArticleGroupe => {
    const existant     = demande.traitement?.articlesValides?.find(av => av.articleDemandeId === art.id)
    const qteValidee   = existant?.quantiteValidee   ?? art.quantiteValidee  ?? art.quantiteDemandee
    const prixUnitaire = existant?.prixUnitaireDevis ?? art.prixUnitaireDevis ?? 0
    const montant      = existant?.montantLigne ?? art.prixTotalLigne ?? (prixUnitaire * qteValidee)
    // @ts-ignore
    const source: SourceArticle = art.source ?? "Commande"
    // @ts-ignore
    const depotId: number | undefined = art.depotDotationId ?? undefined
    // @ts-ignore
    const qteDotee: number = art.quantiteDotee ?? (source === "Stock" ? qteValidee : 0)

    return {
      articleDemandeId:  art.id,
      designation: art.articleNom || art.designationLibre ||  art.articleDescription || "",
      unite:             art.unite,
      quantiteDemandee:  art.quantiteDemandee,
      quantiteValidee:   qteValidee,
      source,
      // Restaurer les dotations depuis le serveur si elles existent (StockDemandeArticleDotationDTO[])
      dotations: (() => {
        // @ts-ignore — champ étendu après mise à jour de stock.ts
        const serveurDotations: Array<{ id: number; depotId: number; quantiteDotee: number; estLivre: boolean }> =
          // @ts-ignore
          (art.dotations && art.dotations.length > 0) ? art.dotations : []

        if (source === "Stock" && serveurDotations.length > 0) {
          // Restaurer les sous-lignes depuis Stock_DemandeArticleDotations
          return serveurDotations.map(d => ({
            uid:           nextUid(),
            depotId:       d.depotId,
            quantiteDotee: d.quantiteDotee,
            estLivre:      d.estLivre,
            enLivraison:   false,
            // dotationId supprimé : l'API est autonome
          }))
        }
        if (source === "Stock") {
          return [{ uid: nextUid(), depotId, quantiteDotee: qteDotee,
                    // @ts-ignore
                    estLivre: art.estLivre ?? false, enLivraison: false }]
        }
        return [{ uid: nextUid(), depotId: undefined, quantiteDotee: 0, estLivre: false, enLivraison: false }]
      })(),
      prixUnitaireDevis: prixUnitaire,
      montantLigne:      source === "Stock" ? 0 : montant,
      // @ts-ignore
      reliquatPrixUnitaire: art.reliquatPrixUnitaire ?? 0,
      // @ts-ignore
      reliquatQteValidee:   art.reliquatQteValidee   ?? 0,
    }
  }

  const [groupes, setGroupes] = useState<ArticleGroupe[]>(() => demande.articles.map(buildGroupe))

  useEffect(() => {
    if (!open) return
    setFournisseurId(demande.traitement?.fournisseurId ?? undefined)
    setIsHorsBase(!!demande.traitement?.nomFournisseurLibre)
    setFournisseurHorsBase(demande.traitement?.nomFournisseurLibre || "")
    setNumeroDevis(demande.traitement?.numeroDevis || demande.numero || "")
    setDateDevis(demande.traitement?.dateDevis || "")
    setMontantHT(demande.traitement?.montantDevisHT || 0)
    setMontantTTC(demande.traitement?.montantDevisTTC || 0)
    setDelaiLivraison(demande.traitement?.delaiLivraison || "")
    setConditionsPaiement(demande.traitement?.conditionsPaiement || "")
    setNotesTraitement(demande.traitement?.notes || "")
    setGroupes(demande.articles.map(buildGroupe))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, demande])

  // ── Dérivations ───────────────────────────────────────────────────────────

  const groupesStock    = useMemo(() => groupes.filter(g => g.source === "Stock"),    [groupes])
  const groupesCommande = useMemo(() => groupes.filter(g => g.source === "Commande"), [groupes])
  const hasReste        = useMemo(() => groupesStock.some(g => getReste(g) > 0),       [groupesStock])
  const hasCommande     = groupesCommande.length > 0 || hasReste
  const hasStock        = groupesStock.length > 0

  const totalHT = useMemo(() => {
    const htCommande  = groupesCommande.reduce((s, g) => s + g.montantLigne, 0)
    const htReliquats = groupesStock
      .filter(g => getReste(g) > 0)
      .reduce((s, g) => {
        const qte = g.reliquatQteValidee > 0 ? g.reliquatQteValidee : getReste(g)
        return s + g.reliquatPrixUnitaire * qte
      }, 0)
    return htCommande + htReliquats
  }, [groupesCommande, groupesStock])

  useEffect(() => { setMontantHT(totalHT) }, [totalHT])
  useEffect(() => {
    if (montantHT > 0) setMontantTTC(Math.round(montantHT * (1 + TVA_RATE)))
  }, [montantHT])

  const selectedFournisseur = fournisseurs.find(f => f.id === fournisseurId)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const updateGroupe = (id: number, patch: Partial<ArticleGroupe>) =>
    setGroupes(prev => prev.map(g => g.articleDemandeId === id ? { ...g, ...patch } : g))

  const toggleSource = (id: number) =>
    setGroupes(prev => prev.map(g => {
      if (g.articleDemandeId !== id) return g
      const ns: SourceArticle = g.source === "Stock" ? "Commande" : "Stock"
      return {
        ...g, source: ns,
        dotations: ns === "Stock"
          ? [{ uid: nextUid(), depotId: undefined, quantiteDotee: 0, estLivre: false, enLivraison: false }]
          : g.dotations,
        montantLigne: ns === "Stock" ? 0 : g.prixUnitaireDevis * g.quantiteValidee,
      }
    }))

  const addDepot = (groupeId: number) =>
    setGroupes(prev => prev.map(g =>
      g.articleDemandeId !== groupeId ? g : {
        ...g, dotations: [...g.dotations,
          { uid: nextUid(), depotId: undefined, quantiteDotee: 0, estLivre: false, enLivraison: false }]
      }
    ))

  const removeDepot = (groupeId: number, uid: string) =>
    setGroupes(prev => prev.map(g =>
      g.articleDemandeId !== groupeId || g.dotations.length <= 1 ? g : {
        ...g, dotations: g.dotations.filter(d => d.uid !== uid)
      }
    ))

  const updateDot = (groupeId: number, uid: string, patch: Partial<DotationDepot>) =>
    setGroupes(prev => prev.map(g =>
      g.articleDemandeId !== groupeId ? g : {
        ...g, dotations: g.dotations.map(d => d.uid === uid ? { ...d, ...patch } : d)
      }
    ))

  const handleLivrer = async (groupeId: number, dot: DotationDepot) => {
    // Plus de dépendance sur dotationId — l'API crée la dotation elle-même
    if (!dot.depotId || dot.quantiteDotee <= 0 || dot.estLivre) return
    updateDot(groupeId, dot.uid, { enLivraison: true })
    try {
      await livraisonDirecte(demande.id, {
        demandeArticleId: groupeId,    // Id de Stock_DemandeArticles
        depotId:          dot.depotId,
        quantite:         dot.quantiteDotee,
      })
      updateDot(groupeId, dot.uid, { estLivre: true, enLivraison: false })
    } catch {
      updateDot(groupeId, dot.uid, { enLivraison: false })
    }
  }

  // ── Payload ───────────────────────────────────────────────────────────────

  const buildPayload = (): TraitementRequest => {
    const articlesValides: TraitementRequest["articlesValides"] = []
    for (const g of groupes) {
      if (g.source === "Commande") {
        articlesValides.push({
          demandeArticleId: g.articleDemandeId,
          quantiteValidee:  g.quantiteValidee,
          prixUnitaireDevis: g.prixUnitaireDevis,
          source: "Commande",
        })
      } else {
        // Une entrée par dépôt (multi-dépôt → backend nécessite Stock_DemandeArticleDotations)
        for (const dot of g.dotations) {
          if (dot.quantiteDotee > 0 && dot.depotId) {
            articlesValides.push({
              demandeArticleId:  g.articleDemandeId,
              quantiteValidee:   dot.quantiteDotee,
              prixUnitaireDevis: 0,
              source:            "Stock",
              depotDotationId:   dot.depotId,
              quantiteDotee:     dot.quantiteDotee,
            })
          }
        }
        // Reste → signal commande au backend avec prix et qté
        const reste = getReste(g)
        if (reste > 0) {
          const reliquatQte = g.reliquatQteValidee > 0 ? g.reliquatQteValidee : reste
          articlesValides.push({
            demandeArticleId:  g.articleDemandeId,
            quantiteValidee:   reliquatQte,
            prixUnitaireDevis: g.reliquatPrixUnitaire,
            source:            "CommandeReste",
          })
        }
      }
    }
    return {
      fournisseurId:      hasCommande && !isHorsBase ? fournisseurId : undefined,
      nomFournisseurLibre: hasCommande && isHorsBase ? fournisseurHorsBase : undefined,
      numeroDevis:        hasCommande ? (numeroDevis || undefined) : undefined,
      dateDevis:          hasCommande ? (dateDevis   || undefined) : undefined,
      montantDevisHT:     hasCommande ? montantHT : 0,
      montantDevisTTC:    hasCommande ? montantTTC : 0,
      delaiLivraison:     hasCommande ? (delaiLivraison     || undefined) : undefined,
      conditionsPaiement: hasCommande ? (conditionsPaiement || undefined) : undefined,
      notes:              notesTraitement || undefined,
      articlesValides,
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────

  const isValid = useMemo(() => {
    const stockOk = groupesStock.every(g =>
      g.dotations.every(d => d.depotId && d.quantiteDotee > 0) && getTotalDotee(g) > 0
    )
    // Reliquats : si un reste > 0 → prix obligatoire
    const reliquatsOk = groupesStock
      .filter(g => getReste(g) > 0)
      .every(g => g.reliquatPrixUnitaire > 0)
    const commandeOk = !hasCommande || (
      (fournisseurId !== undefined || (isHorsBase && fournisseurHorsBase.trim() !== "")) &&
      numeroDevis.trim() !== "" && dateDevis !== "" && montantHT > 0 &&
      groupesCommande.every(g => g.quantiteValidee > 0 && g.prixUnitaireDevis > 0)
    )
    return stockOk && reliquatsOk && commandeOk
  }, [groupesStock, groupesCommande, hasCommande, fournisseurId, isHorsBase,
      fournisseurHorsBase, numeroDevis, dateDevis, montantHT])

  const handleSaveDraft = async () => {
    setSaving(true); try { await onSaveDraft(buildPayload()) } finally { setSaving(false) }
  }
  const handleSubmit = async () => {
    setSubmitting(true); try { await onSubmit(buildPayload()) } finally { setSubmitting(false) }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-3xl p-0 gap-0">

        {/* Header */}
        <div className="flex-none px-6 py-4 border-b bg-[#1e3a5f]">
          <SheetTitle className="text-white text-lg font-semibold">Traitement de la demande</SheetTitle>
          <SheetDescription className="text-blue-200 text-sm mt-0.5">
            {demande.numero} — {demande.nomDemandeur}
            {(demande as any).depotDemandeNom && (
              <span className="ml-2 inline-flex items-center gap-1 text-blue-300">
                <MapPin className="h-3 w-3" />
                {(demande as any).depotDemandeNom}
              </span>
            )}
          </SheetDescription>
        </div>

        {/* Résumé badges */}
        <div className="flex-none px-6 py-2.5 bg-slate-50 border-b flex flex-wrap gap-2">
          {hasStock && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-0.5 text-xs font-medium text-emerald-700">
              <Warehouse className="h-3 w-3" />
              {groupesStock.length} article(s) — Stock
            </span>
          )}
          {groupesCommande.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-0.5 text-xs font-medium text-blue-700">
              <ShoppingCart className="h-3 w-3" />
              {groupesCommande.length} article(s) — Commande
            </span>
          )}
          {hasReste && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-0.5 text-xs font-medium text-amber-700">
              <AlertTriangle className="h-3 w-3" />
              Reliquat(s) en commande
            </span>
          )}
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Articles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Articles de la demande</h3>
              <span className="text-xs text-gray-400">Source · Dépôts · Livraison</span>
            </div>

            <Alert className="border-blue-200 bg-blue-50 py-2.5">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <AlertDescription className="text-blue-700 text-xs leading-relaxed">
                Choisissez <strong>Stock</strong> pour prélever depuis un ou plusieurs dépôts.
                Si le stock ne couvre pas entièrement la quantité, un reliquat <strong>Commande</strong> est généré automatiquement.
                Le bouton <strong>Livré</strong> s&apos;active quand la couverture est complète et décrémente le stock immédiatement.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium min-w-[150px]">Article</TableHead>
                    <TableHead className="text-white font-medium text-center w-[110px]">Source</TableHead>
                    <TableHead className="text-white font-medium text-center w-[65px]">Dem.</TableHead>
                    <TableHead className="text-white font-medium w-[155px]">Dépôt / Prix unit.</TableHead>
                    <TableHead className="text-white font-medium text-center w-[75px]">Qté</TableHead>
                    <TableHead className="text-white font-medium text-center w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupes.map((groupe, gIdx) => {
                    const totalDotee = getTotalDotee(groupe)
                    const reste      = getReste(groupe)
                    const couvert    = estCouvert(groupe)
                    const isStock    = groupe.source === "Stock"
                    const rowBg      = gIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"

                    return (
                      <Fragment key={groupe.articleDemandeId}>

                        {/* === Ligne article principale === */}
                        <TableRow className={cn(rowBg, isStock && "bg-emerald-50/25")}>
                          <TableCell className="py-3 align-middle">
                            <p className="font-semibold text-sm leading-tight">{groupe.designation}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{groupe.unite}</p>
                          </TableCell>
                          <TableCell className="text-center align-middle">
                            <button
                              type="button"
                              onClick={() => toggleSource(groupe.articleDemandeId)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all",
                                isStock
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                                  : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                              )}
                            >
                              {isStock
                                ? <><Warehouse className="h-3 w-3" /> Stock</>
                                : <><ShoppingCart className="h-3 w-3" /> Commande</>}
                            </button>
                          </TableCell>
                          <TableCell className="text-center align-middle text-sm tabular-nums">
                            {groupe.quantiteDemandee}
                          </TableCell>

                          {isStock ? (
                            // Couverture progress
                            <>
                              <TableCell colSpan={2} className="align-middle py-2">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Dotation totale</span>
                                    <span className={cn("font-bold tabular-nums", couvert ? "text-emerald-600" : "text-amber-600")}>
                                      {totalDotee} / {groupe.quantiteValidee}
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full rounded-full transition-all", couvert ? "bg-emerald-500" : "bg-amber-400")}
                                      style={{ width: `${Math.min(100, groupe.quantiteValidee > 0 ? (totalDotee / groupe.quantiteValidee) * 100 : 0)}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center align-middle">
                                {couvert
                                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                  : <AlertTriangle className="h-4 w-4 text-amber-400 mx-auto" />}
                              </TableCell>
                            </>
                          ) : (
                            // Mode Commande : prix + qté validée + montant
                            <>
                              <TableCell className="align-middle py-2">
                                <Input
                                  type="number" min="0"
                                  value={groupe.prixUnitaireDevis || ""}
                                  onChange={e => updateGroupe(groupe.articleDemandeId, {
                                    prixUnitaireDevis: parseFloat(e.target.value) || 0,
                                    montantLigne: (parseFloat(e.target.value) || 0) * groupe.quantiteValidee,
                                  })}
                                  className="h-8 text-xs w-full text-right"
                                  placeholder="Prix unit. *"
                                />
                              </TableCell>
                              <TableCell className="align-middle py-2 text-center">
                                <Input
                                  type="number" min="0" max={groupe.quantiteDemandee}
                                  value={groupe.quantiteValidee || ""}
                                  onChange={e => updateGroupe(groupe.articleDemandeId, {
                                    quantiteValidee: parseInt(e.target.value) || 0,
                                    montantLigne: groupe.prixUnitaireDevis * (parseInt(e.target.value) || 0),
                                  })}
                                  className="h-8 text-xs w-16 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="align-middle text-center">
                                <span className="text-xs font-semibold tabular-nums text-[#1e3a5f]">
                                  {formatMontantStock(groupe.montantLigne)}
                                </span>
                              </TableCell>
                            </>
                          )}
                        </TableRow>

                        {/* === Sous-lignes dépôts (Stock) === */}
                        {isStock && groupe.dotations.map((dot, dIdx) => {
                          // Actif dès qu'un dépôt est sélectionné et une quantité saisie
                          // Plus besoin de dotationId — l'API est autonome
                          const peutLivrer = !!dot.depotId && dot.quantiteDotee > 0 && !dot.estLivre

                          return (
                            <TableRow
                              key={dot.uid}
                              className={cn(
                                "border-t-0",
                                gIdx % 2 === 0 ? "bg-emerald-50/15" : "bg-emerald-50/30",
                                dot.estLivre && "bg-emerald-50/50 opacity-80"
                              )}
                            >
                              {/* Label dépôt */}
                              <TableCell className="pl-7 py-2 align-middle">
                                <div className="flex items-center gap-1 text-xs text-emerald-700">
                                  <CornerDownRight className="h-3 w-3 text-emerald-400 shrink-0" />
                                  <span className="text-gray-500 font-medium">Dépôt {dIdx + 1}</span>
                                </div>
                              </TableCell>
                              <TableCell />{/* source — vide */}
                              <TableCell />{/* qté dem — vide */}

                              {/* Sélecteur dépôt */}
                              <TableCell className="py-2 align-middle">
                                <Select
                                  value={dot.depotId?.toString() ?? ""}
                                  disabled={dot.estLivre}
                                  onValueChange={v => updateDot(groupe.articleDemandeId, dot.uid, { depotId: parseInt(v) })}
                                >
                                  <SelectTrigger className={cn("h-8 text-xs w-full", dot.estLivre && "opacity-60")}>
                                    <SelectValue placeholder="Dépôt…" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {depots.map(d => (
                                      <SelectItem key={d.id} value={d.id.toString()} className="text-xs">
                                        {d.code} — {d.nom}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>

                              {/* Qté dotée */}
                              <TableCell className="py-2 align-middle text-center">
                                <Input
                                  type="number" min="0" max={groupe.quantiteValidee}
                                  value={dot.quantiteDotee || ""}
                                  disabled={dot.estLivre}
                                  onChange={e => updateDot(groupe.articleDemandeId, dot.uid, {
                                    quantiteDotee: parseFloat(e.target.value) || 0
                                  })}
                                  className={cn("h-8 text-xs w-16 text-center mx-auto", dot.estLivre && "opacity-60")}
                                  placeholder="0"
                                />
                              </TableCell>

                              {/* Bouton Livré + Supprimer */}
                              <TableCell className="py-2 align-middle text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {dot.estLivre ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full text-xs px-2 font-medium">
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> Livré
                                    </Badge>
                                  ) : dot.quantiteDotee > 0 ? (
                                    <Button
                                      size="sm"
                                      disabled={!peutLivrer || dot.enLivraison}
                                      onClick={() => handleLivrer(groupe.articleDemandeId, dot)}
                                      title={
                                        !dot.depotId
                                          ? "Sélectionner un dépôt"
                                          : dot.quantiteDotee <= 0
                                            ? "Saisir une quantité"
                                            : "Prélever depuis ce dépôt et créer le mouvement de sortie"
                                      }
                                      className={cn(
                                        "h-7 text-xs font-medium transition-all",
                                        peutLivrer
                                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                          : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                      )}
                                    >
                                      {dot.enLivraison
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <><PackageCheck className="mr-1 h-3 w-3" />Livré</>}
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-gray-300">—</span>
                                  )}
                                  {groupe.dotations.length > 1 && !dot.estLivre && (
                                    <button
                                      type="button"
                                      onClick={() => removeDepot(groupe.articleDemandeId, dot.uid)}
                                      className="text-gray-300 hover:text-red-400 transition-colors"
                                      title="Supprimer ce dépôt"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}

                        {/* === Bouton + Ajouter dépôt === */}
                        {isStock && (
                          <TableRow className={cn("border-t-0", gIdx % 2 === 0 ? "bg-emerald-50/10" : "bg-emerald-50/20")}>
                            <TableCell colSpan={6} className="py-1.5 pl-9">
                              <button
                                type="button"
                                onClick={() => addDepot(groupe.articleDemandeId)}
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Ajouter un dépôt
                              </button>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* === Ligne reliquat Commande (auto-générée) avec champs inline === */}
                        {isStock && reste > 0 && (
                          <TableRow className={cn(
                            "border-t border-amber-100",
                            gIdx % 2 === 0 ? "bg-amber-50/30" : "bg-amber-50/50"
                          )}>
                            {/* Désignation */}
                            <TableCell className="pl-7 py-2 align-middle">
                              <div className="flex items-center gap-1.5">
                                <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-amber-800 leading-tight">{groupe.designation}</p>
                                  <p className="text-xs text-amber-500">Reliquat à commander</p>
                                </div>
                              </div>
                            </TableCell>
                            {/* Source badge */}
                            <TableCell className="text-center align-middle py-2">
                              <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5">
                                <ShoppingCart className="h-3 w-3" /> Commande
                              </span>
                            </TableCell>
                            {/* Qté demandée (= reste calculé, affiché en lecture seule) */}
                            <TableCell className="text-center align-middle py-2">
                              <span className="text-xs text-amber-600 font-medium tabular-nums">{reste}</span>
                            </TableCell>
                            {/* Prix unitaire — saisie obligatoire */}
                            <TableCell className="py-2 align-middle">
                              <div className="space-y-0.5">
                                <Label className="text-xs text-amber-600">
                                  Prix unit. *
                                  {groupe.reliquatPrixUnitaire === 0 && (
                                    <span className="ml-1 text-red-500">requis</span>
                                  )}
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={groupe.reliquatPrixUnitaire || ""}
                                  onChange={e => updateGroupe(groupe.articleDemandeId, {
                                    reliquatPrixUnitaire: parseFloat(e.target.value) || 0,
                                  })}
                                  placeholder="0"
                                  className={cn(
                                    "h-8 text-xs text-right w-full",
                                    groupe.reliquatPrixUnitaire === 0
                                      ? "border-amber-400 focus-visible:ring-amber-300"
                                      : "border-gray-200"
                                  )}
                                />
                              </div>
                            </TableCell>
                            {/* Qté validée du reliquat — éditable entre 1 et reste */}
                            <TableCell className="py-2 align-middle text-center">
                              <div className="space-y-0.5">
                                <Label className="text-xs text-amber-600">Qté</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={reste}
                                  value={groupe.reliquatQteValidee > 0 ? groupe.reliquatQteValidee : reste}
                                  onChange={e => updateGroupe(groupe.articleDemandeId, {
                                    reliquatQteValidee: parseInt(e.target.value) || reste,
                                  })}
                                  className="h-8 text-xs w-16 text-center mx-auto"
                                />
                              </div>
                            </TableCell>
                            {/* Montant ligne reliquat */}
                            <TableCell className="text-right align-middle py-2">
                              <div className="space-y-0.5">
                                <p className="text-xs text-gray-400">Montant</p>
                                <p className={cn(
                                  "text-xs font-bold tabular-nums",
                                  groupe.reliquatPrixUnitaire > 0 ? "text-amber-700" : "text-gray-300"
                                )}>
                                  {groupe.reliquatPrixUnitaire > 0
                                    ? formatMontantStock(
                                        groupe.reliquatPrixUnitaire *
                                        (groupe.reliquatQteValidee > 0 ? groupe.reliquatQteValidee : reste)
                                      )
                                    : "—"
                                  }
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Séparateur entre groupes */}
                        {gIdx < groupes.length - 1 && (
                          <TableRow className="h-px bg-gray-200 border-y-2 border-gray-200">
                            <TableCell colSpan={6} className="p-0" />
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>

                {hasCommande && (
                  <TableFooter>
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={5} className="text-right font-semibold text-sm py-3 text-gray-700">
                        Total commande HT (articles + reliquats)
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#1e3a5f] text-sm py-3 tabular-nums">
                        {formatMontantStock(montantHT)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>

            {/* Alertes */}
            {groupesStock.some(g => g.dotations.some(d => !d.depotId && d.quantiteDotee > 0)) && (
              <Alert className="border-amber-200 bg-amber-50 py-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <AlertDescription className="text-amber-700 text-xs">
                  Certaines lignes ont une quantité sans dépôt sélectionné.
                </AlertDescription>
              </Alert>
            )}
            {hasReste && (
              <Alert className="border-amber-200 bg-amber-50 py-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <AlertDescription className="text-amber-700 text-xs leading-relaxed">
                  <strong>Livraison partielle détectée.</strong> Les articles dotés depuis le stock seront livrés immédiatement
                  (statut <em>LivraisonPartielle</em>). Les reliquats suivront le flux fournisseur.
                  Renseignez le prix de chaque reliquat dans le tableau ci-dessus, ainsi que le fournisseur et le devis ci-dessous.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Section fournisseur + devis */}
          {hasCommande && (
            <>
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fournisseur</h3>
                <div className="flex items-center gap-2">
                  <input id="horsBase" type="checkbox" checked={isHorsBase}
                    onChange={e => setIsHorsBase(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  <Label htmlFor="horsBase" className="text-sm text-gray-600 cursor-pointer">
                    Fournisseur hors base (non répertorié)
                  </Label>
                </div>
                {isHorsBase ? (
                  <div className="space-y-2">
                    <Label htmlFor="fournisseurLibre">Nom du fournisseur *</Label>
                    <Input id="fournisseurLibre" value={fournisseurHorsBase}
                      onChange={e => setFournisseurHorsBase(e.target.value)}
                      placeholder="Saisir le nom du fournisseur" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Fournisseur *</Label>
                    <Popover open={fournisseurOpen} onOpenChange={setFournisseurOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                          {fournisseursLoading ? "Chargement…"
                            : selectedFournisseur ? selectedFournisseur.nom
                            : "Sélectionner un fournisseur…"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher un fournisseur…" />
                          <CommandList>
                            <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
                            <CommandGroup>
                              {fournisseurs.map(f => (
                                <CommandItem key={f.id} value={`${f.nom} ${f.code}`}
                                  onSelect={() => { setFournisseurId(f.id); setFournisseurOpen(false) }}>
                                  <Check className={cn("mr-2 h-4 w-4", fournisseurId === f.id ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{f.nom}</span>
                                    <span className="text-xs text-gray-500">
                                      {[f.contact, f.telephone].filter(Boolean).join(" | ")}
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
                )}
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informations du devis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroDevis">N° de devis *</Label>
                    <Input id="numeroDevis" value={numeroDevis}
                      onChange={e => setNumeroDevis(e.target.value)} placeholder="Ex: DEV-2026-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateDevis">Date du devis *</Label>
                    <Input id="dateDevis" type="date"
                      value={dateDevis ? dateDevis.split("T")[0] : ""}
                      onChange={e => setDateDevis(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="montantHT">Montant HT *</Label>
                    <Input id="montantHT" type="number" value={montantHT || ""}
                      onChange={e => setMontantHT(parseFloat(e.target.value) || 0)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="montantTTC">Montant TTC (auto)</Label>
                    <Input id="montantTTC" type="number" value={montantTTC || ""}
                      onChange={e => setMontantTTC(parseFloat(e.target.value) || 0)} placeholder="0" />
                    <p className="text-xs text-muted-foreground">TVA : 18 %</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delai">Délai de livraison estimé</Label>
                    <Input id="delai" value={delaiLivraison}
                      onChange={e => setDelaiLivraison(e.target.value)} placeholder="Ex: 15 jours" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditions">Conditions de paiement</Label>
                    <Input id="conditions" value={conditionsPaiement}
                      onChange={e => setConditionsPaiement(e.target.value)}
                      placeholder="Ex: 30% avance, solde à la livraison" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="border-t border-gray-100 pt-5 space-y-2">
            <Label htmlFor="notes">Notes de traitement</Label>
            <Textarea id="notes" value={notesTraitement}
              onChange={e => setNotesTraitement(e.target.value)}
              placeholder="Informations complémentaires…" rows={3} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400 hidden sm:block space-y-0.5">
            {hasStock && (
              <div>{groupesStock.filter(estCouvert).length}/{groupesStock.length} stock couvert(s)</div>
            )}
            {hasCommande && (
              <div className="text-blue-600">{formatMontantStock(montantHT)} HT en commande</div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving || submitting}
              className="border-[#1e3a5f] text-[#1e3a5f]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde…</>
                      : <><Save className="mr-2 h-4 w-4" />Brouillon</>}
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || saving || submitting}
              className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Soumission…</>
                          : <><Send className="mr-2 h-4 w-4" />Soumettre pour validation</>}
            </Button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  )
}