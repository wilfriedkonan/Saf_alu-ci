"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Layers,
  Warehouse,
  PackageCheck,
  TrendingDown,
  AlertTriangle,
  Info,
  RefreshCw,
  Coins,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMontantStock, LotEntreeDTO } from "@/types/stock"
import { useInventaireDetails } from "@/hooks/useStock"


// ── Props ──────────────────────────────────────────────────────────────────────

interface DetailsInventaireModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleId: number | null
  depotId: number | null
  articleNom: string
  depotNom: string
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function ConsommationBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct))
  const color =
    clamped >= 100 ? "bg-red-400"
    : clamped >= 75 ? "bg-amber-400"
    : clamped >= 40 ? "bg-blue-400"
    : "bg-emerald-500"
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={cn(
        "text-[11px] font-semibold tabular-nums w-[35px] text-right shrink-0",
        clamped >= 100 ? "text-red-500"
        : clamped >= 75 ? "text-amber-600"
        : "text-gray-400"
      )}>
        {clamped}%
      </span>
    </div>
  )
}

function SummaryCard({
  label, value, sub, variant, icon: Icon,
}: {
  label: string
  value: string
  sub: string
  variant: "navy" | "green" | "amber" | "slate"
  icon: React.ElementType
}) {
  const s = {
    navy:  { wrap: "bg-[#1e3a5f] text-white",    icon: "text-blue-200",    sub: "text-blue-200/70" },
    green: { wrap: "bg-emerald-600 text-white",   icon: "text-emerald-200", sub: "text-emerald-100/70" },
    amber: { wrap: "bg-amber-500 text-white",     icon: "text-amber-100",   sub: "text-amber-100/70" },
    slate: { wrap: "bg-gray-100 text-gray-800",   icon: "text-gray-400",    sub: "text-gray-500" },
  }[variant]

  return (
    <div className={cn("rounded-xl p-4 space-y-2 relative overflow-hidden", s.wrap)}>
      <div className="absolute -right-3 -top-3 opacity-[0.08]">
        <Icon className="h-16 w-16" />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <p className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", s.icon)} />
      </div>
      <p className="text-[22px] font-bold tabular-nums tracking-tight leading-tight relative z-10">{value}</p>
      <p className={cn("text-xs relative z-10", s.sub)}>{sub}</p>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-gray-100 animate-pulse", className)} />
}

// ── Composant principal ────────────────────────────────────────────────────────

export function DetailsInventaireModal({
  open,
  onOpenChange,
  articleId,
  depotId,
  articleNom,
  depotNom,
}: DetailsInventaireModalProps) {
  const { details: data, loading, error, refresh } = useInventaireDetails(
    open ? articleId : null,
    open ? depotId  : null
  )

  const hasEcart    = data != null && Math.abs(data.ecartNonTrace) > 0.001
  const totalLots   = data?.lots.length ?? 0
  const lotsPartiels = data?.lots.filter(l => l.quantiteConsommee > 0 && l.quantiteRestante > 0).length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl shadow-2xl">

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <DialogHeader className="flex-none px-6 pt-5 pb-4 bg-gradient-to-br from-[#1e3a5f] to-[#2a5298]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 shrink-0 backdrop-blur-sm">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-bold leading-tight">
                  {articleNom}
                </DialogTitle>
                <DialogDescription className="text-blue-200 text-sm mt-0.5 flex items-center gap-2">
                  <Warehouse className="h-3.5 w-3.5 shrink-0" />
                  <span>{depotNom}</span>
                  {data && (
                    <span className="font-mono text-blue-300/70 text-xs border-l border-blue-300/30 pl-2">
                      {data.articleReference}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0 shrink-0"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Stats rapides dans le header */}
          {data && !loading && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                {totalLots} lot(s) actif(s)
              </div>
              {lotsPartiels > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
                  {lotsPartiels} partiellement consommé(s)
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                <ArrowDown className="h-3 w-3" />
                Lot rang 1 = prochain à sortir
              </div>
            </div>
          )}
        </DialogHeader>

        {/* ══ CORPS ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">

          {/* Chargement */}
          {loading && (
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[110px]" />
                ))}
              </div>
              <div className="space-y-2.5 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-11" />
                ))}
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div className="p-6">
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="ghost" size="sm" onClick={refresh}
                    className="ml-4 text-red-600 hover:bg-red-100 shrink-0"
                  >
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Données */}
          {data && !loading && (
            <div className="p-6 space-y-6">

              {/* ── 4 cards de synthèse ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                  label="Stock disponible"
                  value={`${data.quantiteDisponible} ${data.unite}`}
                  sub="Source de vérité (inventaire)"
                  variant="navy"
                  icon={PackageCheck}
                />
                <SummaryCard
                  label="Lots tracés"
                  value={`${data.quantiteTotaleLots} ${data.unite}`}
                  sub={`${totalLots} lot(s) dans la file`}
                  variant="green"
                  icon={Layers}
                />
                <SummaryCard
                  label="Non tracé"
                  value={`${data.ecartNonTrace !== 0 ? "+" : ""}${data.ecartNonTrace} ${data.unite}`}
                  sub={hasEcart ? "Stock pré-FIFO" : "Stock 100 % tracé ✓"}
                  variant={hasEcart ? "amber" : "slate"}
                  icon={TrendingDown}
                />
                <SummaryCard
                  label="Valeur estimée"
                  value={data.valeurTotaleEstimee != null
                    ? formatMontantStock(data.valeurTotaleEstimee)
                    : "—"}
                  sub="Prix entrée × qté restante"
                  variant="slate"
                  icon={Coins}
                />
              </div>

              {/* Alerte écart non tracé */}
              {hasEcart && (
                <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <AlertDescription className="text-amber-800 text-sm leading-relaxed">
                    <strong className="font-semibold">{data.ecartNonTrace} {data.unite}</strong> de stock
                    ne sont pas couverts par des lots FIFO — ce stock existait avant l'activation
                    de la traçabilité. Les sorties manuelles restent pleinement fonctionnelles.
                  </AlertDescription>
                </Alert>
              )}

              {/* ── Tableau des lots ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-[#1e3a5f]" />
                    File FIFO
                    <span className="text-gray-400 font-normal">— entrées triées de la plus ancienne à la plus récente</span>
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[11px] h-5 text-gray-500 font-normal border-gray-200 flex items-center gap-1"
                  >
                    <ArrowUp className="h-2.5 w-2.5" />
                    Rang 1 sort en premier
                  </Badge>
                </div>

                {/* État vide */}
                {data.lots.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-14 rounded-xl border-2 border-dashed border-gray-200 bg-white">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
                      <Layers className="h-7 w-7 text-gray-300" />
                    </div>
                    <div className="text-center space-y-1.5">
                      <p className="text-sm font-semibold text-gray-500">Aucun lot FIFO tracé</p>
                      <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
                        Les lots sont créés automatiquement à chaque entrée de stock.
                        Les futures entrées alimenteront cette file.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-800 hover:bg-gray-800">
                          <TableHead className="text-gray-300 font-medium text-center w-[52px]">Rang</TableHead>
                          <TableHead className="text-gray-300 font-medium">Date entrée</TableHead>
                          <TableHead className="text-gray-300 font-medium text-right">Qté initiale</TableHead>
                          <TableHead className="text-gray-300 font-medium text-right">Qté restante</TableHead>
                          <TableHead className="text-gray-300 font-medium w-[170px]">Consommé</TableHead>
                          <TableHead className="text-gray-300 font-medium text-right">Prix unit.</TableHead>
                          <TableHead className="text-gray-300 font-medium text-right">Valeur rest.</TableHead>
                          <TableHead className="text-gray-300 font-medium">Référence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.lots.map((lot: LotEntreeDTO) => {
                          const estProchain = lot.rangFifo === 1
                          const estEpuise   = lot.quantiteRestante <= 0
                          const estFaible   = !estEpuise && lot.quantiteRestante < lot.quantiteEntree * 0.15

                          return (
                            <TableRow
                              key={lot.id}
                              className={cn(
                                "transition-colors border-b border-gray-100 last:border-0",
                                estProchain  && "bg-blue-50/80 hover:bg-blue-50 border-l-[3px] border-l-[#1e3a5f]",
                                !estProchain && !estEpuise && "bg-white hover:bg-gray-50/60",
                                estEpuise    && "opacity-45 bg-gray-50 hover:bg-gray-50 cursor-default"
                              )}
                            >
                              {/* Rang */}
                              <TableCell className="text-center py-3.5">
                                <div className={cn(
                                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
                                  estProchain ? "bg-[#1e3a5f] text-white shadow-sm"
                                  : estEpuise ? "bg-gray-200 text-gray-400"
                                  :             "bg-gray-100 text-gray-600"
                                )}>
                                  {lot.rangFifo}
                                </div>
                              </TableCell>

                              {/* Date */}
                              <TableCell className="py-3.5">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-800">
                                    {new Date(lot.dateCreation).toLocaleDateString("fr-FR", {
                                      day: "2-digit", month: "short", year: "numeric",
                                    })}
                                  </span>
                                  <span className="text-[11px] text-gray-400 mt-0.5">
                                    {new Date(lot.dateCreation).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit", minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Qté initiale */}
                              <TableCell className="text-right tabular-nums text-sm text-gray-500 py-3.5">
                                {lot.quantiteEntree}
                              </TableCell>

                              {/* Qté restante */}
                              <TableCell className="text-right py-3.5">
                                <span className={cn(
                                  "tabular-nums font-bold text-sm",
                                  estEpuise   ? "text-gray-300 line-through"
                                  : estFaible ? "text-red-600"
                                  :             "text-emerald-700"
                                )}>
                                  {lot.quantiteRestante}
                                </span>
                                {estFaible && !estEpuise && (
                                  <Badge className="ml-1.5 text-[9px] h-4 bg-red-100 text-red-600 border-red-200 font-medium">
                                    bas
                                  </Badge>
                                )}
                              </TableCell>

                              {/* Barre consommé */}
                              <TableCell className="py-3.5 pr-5">
                                <ConsommationBar pct={lot.pourcentageConsomme} />
                                <p className="text-[11px] text-gray-400 mt-1 tabular-nums">
                                  {lot.quantiteConsommee} consommé(s)
                                </p>
                              </TableCell>

                              {/* Prix unitaire */}
                              <TableCell className="text-right tabular-nums text-sm py-3.5">
                                {lot.prixUnitaire != null
                                  ? <span className="text-gray-700">{formatMontantStock(lot.prixUnitaire)}</span>
                                  : <span className="text-gray-200">—</span>
                                }
                              </TableCell>

                              {/* Valeur restante */}
                              <TableCell className="text-right tabular-nums py-3.5">
                                {lot.valeurRestante != null
                                  ? <span className="text-sm font-semibold text-gray-800">{formatMontantStock(lot.valeurRestante)}</span>
                                  : <span className="text-gray-200 text-sm">—</span>
                                }
                              </TableCell>

                              {/* Référence */}
                              <TableCell className="py-3.5">
                                {lot.reference
                                  ? <code className="text-[11px] font-mono bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{lot.reference}</code>
                                  : <span className="text-gray-200 text-sm">—</span>
                                }
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Légende */}
                {data.lots.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1e3a5f]" />
                      Prochain à sortir
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Disponible (&lt; 40% consommé)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
                      75–99% consommé
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />
                      Épuisé
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
        {data && !loading && (
          <div className="flex-none px-6 py-2.5 border-t bg-white flex items-center justify-between text-[11px] text-gray-400">
            <code className="font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[10px]">
              GET /api/stock/inventaire/details?articleId={articleId}&amp;depotId={depotId}
            </code>
            <span className="tabular-nums">
              {totalLots} lot(s) · {data.unite}
              {data.valeurTotaleEstimee != null && (
                <> · <strong className="text-gray-600 font-semibold">{formatMontantStock(data.valeurTotaleEstimee)}</strong></>
              )}
            </span>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}