"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  Truck,
  Warehouse,
  ShoppingCart,
  CheckCheck,
  ArrowRight,
  ArrowRightLeft,
  Info,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Demande, formatMontantStock } from "@/types/stock"
import { useDemandesActions } from "@/hooks/useStock"

// ── Types internes ────────────────────────────────────────────────────────────

/** État local d'une ligne de livraison */
interface LigneLivraison {
  id: number
  designation: string
  unite: string
  quantiteValidee: number
  /** "Stock" = doté depuis stock (auto-livré) | "Commande" = à confirmer manuellement */
  source: "Stock" | "Commande"
  /** Déjà livré (stock auto ou confirmation précédente) */
  estLivre: boolean
  /** Infos de confirmation */
  dateConfirmation?: string
  userConfirmationNom?: string
  /** IDs des 3 mouvements créés lors de la livraison fournisseur (retournés par l'API) */
  mouvEntreeDefaut?: number | null
  mouvSortieDefaut?: number | null
  mouvEntreeDemande?: number | null
}

interface LivraisonConfirmationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demande: Demande
  /** Appelé après chaque action réussie pour rafraîchir les données du parent */
  onRefresh: () => void
}

// ── Composant principal ───────────────────────────────────────────────────────

export function LivraisonConfirmationSheet({
  open,
  onOpenChange,
  demande,
  onRefresh,
}: LivraisonConfirmationSheetProps) {
  const {
    confirmerLivraisonArticle,
    confirmerToutesLivraisons,
    finaliserLivraison,
  } = useDemandesActions()

  const [confirmingId,     setConfirmingId]     = useState<number | null>(null)
  const [confirmingTout,   setConfirmingTout]   = useState(false)
  const [finalising,       setFinalising]       = useState(false)
  const [dialogFinaliser,  setDialogFinaliser]  = useState(false)
  const [dialogTout,       setDialogTout]       = useState(false)

  // ── Construction des lignes ───────────────────────────────────────────────
  const lignes: LigneLivraison[] = useMemo(() =>
    demande.articles.map((art) => {
      // @ts-ignore — champs étendus
      const source: "Stock" | "Commande" = art.source ?? "Commande"
      // @ts-ignore
      const estLivre: boolean = source === "Stock" || (art.estLivre ?? false)
      return {
        id:              art.id,
        designation:     art.articleNom || art.designationLibre || "",
        unite:           art.unite,
        quantiteValidee: art.quantiteValidee ?? art.quantiteDemandee,
        source,
        estLivre,
        // @ts-ignore
        dateConfirmation:  art.dateConfirmationLivraison,
        // @ts-ignore
        userConfirmationNom: art.userValidationLivraisonNom,
      }
    }),
    [demande.articles]
  )

  const totalArticles    = lignes.length
  const articlesLivres   = lignes.filter((l) => l.estLivre).length
  const articlesEnAttente = lignes.filter((l) => !l.estLivre && l.source === "Commande")
  const tousLivres       = articlesLivres === totalArticles
  const progressPercent  = totalArticles > 0 ? Math.round((articlesLivres / totalArticles) * 100) : 0

  // ── État des mouvements par article (retournés par l'API)
  const [mouvementsParArticle, setMouvementsParArticle] = useState<
    Record<number, { entreeDefaut?: number | null; sortieDefaut?: number | null; entreeDemande?: number | null }>
  >({})

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleConfirmerArticle = async (articleId: number) => {
    setConfirmingId(articleId)
    try {
      const result: any = await confirmerLivraisonArticle(demande.id, articleId)
      // Stocker les IDs de mouvements si retournés par l'API
      if (result?.mouvements) {
        setMouvementsParArticle(prev => ({
          ...prev,
          [articleId]: {
            entreeDefaut:  result.mouvements.entreeDepotDefaut,
            sortieDefaut:  result.mouvements.sortieDepotDefaut,
            entreeDemande: result.mouvements.entreeDepotDemande,
          }
        }))
      }
      onRefresh()
    } finally { setConfirmingId(null) }
  }

  const handleConfirmerTout = async () => {
    setDialogTout(false)
    setConfirmingTout(true)
    try {
      await confirmerToutesLivraisons(demande.id)
      onRefresh()
    } finally { setConfirmingTout(false) }
  }

  const handleFinaliser = async () => {
    setDialogFinaliser(false)
    setFinalising(true)
    try {
      await finaliserLivraison(demande.id)
      onRefresh()
      onOpenChange(false)
    } finally { setFinalising(false) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex flex-col w-full sm:max-w-2xl p-0 gap-0"
        >
          {/* Header */}
          <div className="flex-none px-6 py-4 border-b border-gray-200 bg-[#1e3a5f]">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-200" />
              <div>
                <SheetTitle className="text-white text-lg font-semibold">
                  Confirmation de livraison
                </SheetTitle>
                <SheetDescription className="text-blue-200 text-sm mt-0.5">
                  {demande.numero} — {demande.nomDemandeur}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="flex-none px-6 pt-5 pb-4 bg-white border-b border-gray-100 space-y-3">

            {/* Dépôt de destination si défini */}
            {(demande as any).depotDemandeNom && (
              <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                <ArrowRightLeft className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-emerald-700 font-medium">Flux de livraison : </span>
                  <span className="text-emerald-600">
                    Dépôt central → <strong>{(demande as any).depotDemandeNom}</strong>
                    {(demande as any).depotDemandeCode && (
                      <span className="text-emerald-500 text-xs ml-1">({(demande as any).depotDemandeCode})</span>
                    )}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">
                Avancement de la livraison
              </span>
              <span className={cn(
                "font-bold tabular-nums",
                tousLivres ? "text-emerald-600" : "text-[#1e3a5f]"
              )}>
                {articlesLivres} / {totalArticles} articles livrés
              </span>
            </div>
            {/* Barre */}
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  tousLivres ? "bg-emerald-500" : "bg-[#1e3a5f]"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Compteurs */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {lignes.filter((l) => l.source === "Stock").length} depuis stock (auto)
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                <PackageCheck className="h-3 w-3" />
                {lignes.filter((l) => l.source === "Commande" && l.estLivre).length} commande(s) reçue(s)
              </span>
              {articlesEnAttente.length > 0 && (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  <Clock className="h-3 w-3" />
                  {articlesEnAttente.length} en attente de réception
                </span>
              )}
            </div>
          </div>

          {/* Corps scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {tousLivres && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700 text-sm font-medium">
                  Tous les articles ont été livrés. Vous pouvez finaliser et passer en attente de comptabilité.
                </AlertDescription>
              </Alert>
            )}

            {!tousLivres && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-xs">
                  Confirmez la réception de chaque article. L&apos;utilisateur connecté sera enregistré comme validateur.
                </AlertDescription>
              </Alert>
            )}

            {/* Tableau des articles */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]">
                    <TableHead className="text-white font-medium">Article</TableHead>
                    <TableHead className="text-white font-medium text-center w-[90px]">Source</TableHead>
                    <TableHead className="text-white font-medium text-center w-[80px]">Qté</TableHead>
                    <TableHead className="text-white font-medium text-center">Statut livraison</TableHead>
                    <TableHead className="text-white font-medium text-center w-[130px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignes.map((ligne, index) => (
                    <TableRow
                      key={ligne.id}
                      className={cn(
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/60",
                        ligne.estLivre && "bg-emerald-50/40"
                      )}
                    >
                      {/* Désignation */}
                      <TableCell className="align-middle">
                        <p className="font-medium text-sm">{ligne.designation}</p>
                        <p className="text-xs text-muted-foreground">{ligne.unite}</p>
                      </TableCell>

                      {/* Source */}
                      <TableCell className="text-center">
                        {ligne.source === "Stock" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 border border-emerald-200">
                            <Warehouse className="h-3 w-3" />
                            Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 border border-blue-200">
                            <ShoppingCart className="h-3 w-3" />
                            Commande
                          </span>
                        )}
                      </TableCell>

                      {/* Quantité */}
                      <TableCell className="text-center text-sm tabular-nums">
                        {ligne.quantiteValidee}
                      </TableCell>

                      {/* Statut livraison */}
                      <TableCell className="text-center">
                        {ligne.estLivre ? (
                          <div className="space-y-1">
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 rounded-full text-xs font-medium">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Livré
                            </Badge>
                            {ligne.source === "Stock" ? (
                              <p className="text-xs text-gray-400">Dotation stock</p>
                            ) : (
                              <>
                                {ligne.dateConfirmation && (
                                  <p className="text-xs text-gray-400">
                                    {new Date(ligne.dateConfirmation).toLocaleDateString("fr-FR")}
                                    {ligne.userConfirmationNom && ` · ${ligne.userConfirmationNom}`}
                                  </p>
                                )}
                                {/* Indicateur flux mouvements si dépôt demande défini */}
                                {(demande as any).depotDemandeNom && mouvementsParArticle[ligne.id] && (
                                  <div className="flex items-center justify-center gap-1 mt-1">
                                    <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 rounded px-1">M1</span>
                                    <ArrowRight className="h-2.5 w-2.5 text-gray-400" />
                                    <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">M2</span>
                                    <ArrowRight className="h-2.5 w-2.5 text-gray-400" />
                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1">M3</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 rounded-full text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            En attente
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-center">
                        {ligne.estLivre ? (
                          <span className="text-emerald-500">
                            <CheckCircle2 className="h-5 w-5 mx-auto" />
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmerArticle(ligne.id)}
                            disabled={confirmingId === ligne.id || confirmingTout}
                            className="h-8 text-xs border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors"
                          >
                            {confirmingId === ligne.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <><PackageCheck className="mr-1 h-3.5 w-3.5" />Confirmer</>
                            }
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer fixe */}
          <div className="flex-none px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-3">
            {/* Bouton "Tout confirmer" (uniquement si articles en attente) */}
            {/* Légende flux 3 mouvements si dépôt demande défini */}
            {(demande as any).depotDemandeNom && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Flux de mouvements lors de chaque confirmation
                </p>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="flex flex-col items-center gap-0.5 p-2 bg-blue-50 rounded border border-blue-200">
                    <span className="font-bold text-blue-700">M1</span>
                    <span className="text-blue-600 text-center leading-tight">Entrée dépôt central</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 p-2 bg-amber-50 rounded border border-amber-200">
                    <span className="font-bold text-amber-700">M2</span>
                    <span className="text-amber-600 text-center leading-tight">Sortie dépôt central</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 p-2 bg-emerald-50 rounded border border-emerald-200">
                    <span className="font-bold text-emerald-700">M3</span>
                    <span className="text-emerald-600 text-center leading-tight">Entrée {(demande as any).depotDemandeNom}</span>
                  </div>
                </div>
              </div>
            )}

            {articlesEnAttente.length > 1 && (
              <Button
                variant="outline"
                className="w-full border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
                disabled={confirmingTout || finalising}
                onClick={() => setDialogTout(true)}
              >
                {confirmingTout
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirmation en cours…</>
                  : <><CheckCheck className="mr-2 h-4 w-4" />Confirmer toutes les réceptions ({articlesEnAttente.length})</>
                }
              </Button>
            )}

            {/* Bouton finaliser (uniquement si tout livré) */}
            <Button
              className={cn(
                "w-full font-semibold transition-all",
                tousLivres
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
              disabled={!tousLivres || finalising}
              onClick={() => tousLivres && setDialogFinaliser(true)}
            >
              {finalising
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finalisation…</>
                : <><ArrowRight className="mr-2 h-4 w-4" />Valider la livraison → Attente Comptabilité</>
              }
            </Button>

            {!tousLivres && (
              <p className="text-xs text-center text-gray-400">
                {articlesEnAttente.length} article(s) restant(s) à confirmer avant de finaliser
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog confirmation tout */}
      <AlertDialog open={dialogTout} onOpenChange={setDialogTout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer toutes les réceptions</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez confirmer la réception de{" "}
              <span className="font-semibold">{articlesEnAttente.length} article(s)</span>.
              Votre nom sera enregistré comme validateur pour chaque ligne.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmerTout}
              className="bg-[#1e3a5f] hover:bg-[#162d4a]"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Confirmer tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog finalisation */}
      <AlertDialog open={dialogFinaliser} onOpenChange={setDialogFinaliser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Valider la livraison complète
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tous les articles de la demande{" "}
              <span className="font-semibold">{demande.numero}</span> ont été livrés.
              La demande passera en statut{" "}
              <span className="font-semibold">Attente Comptabilité</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinaliser}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Confirmer et passer en comptabilité
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}