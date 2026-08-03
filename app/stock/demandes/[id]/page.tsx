"use client"

import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft, User, Calendar, Building2, FileText, Truck,
  Check, X, Clock, Pencil, PackageOpen, AlertTriangle, ExternalLink,
  ShieldCheck, ShieldX, PackageCheck, Package, Warehouse, MapPin,
} from "lucide-react"
import { useDepotsAll } from "@/hooks/useDepot"
import { LivraisonConfirmationSheet } from "@/components/stock/livraison-confirmation-sheet"
import {
  StatutDemandeLabels,
  StatutDemandeColors,
  formatMontantStock,
  type StatutDemande,
} from "@/types/stock"
import { useDemande, useDemandesActions } from "@/hooks/useStock"
import { TraitementFormSheet } from "@/components/stock/traitement-form-sheet"
import { ValidationModal } from "@/components/stock/validation-modal"
import { RejetModal } from "@/components/stock/rejet-modal"
import { TraitementRequest } from "@/types/stock"
import { useState, useEffect } from "react"

// ── Définition des étapes par cas ────────────────────────────────────────────

type StepDef = { key: StatutDemande; label: string; icon: React.ElementType }

/** Cas 1 : tout stock livré → Dotee (flux terminé après traitement) */
const STEPS_CAS1: StepDef[] = [
  { key: "EnAttente",    label: "En attente",    icon: Clock },
  { key: "EnTraitement", label: "En traitement", icon: Pencil },
  { key: "Dotee",        label: "Doté",          icon: PackageCheck },
]

/** Cas 2 : mix stock + commande → LivraisonPartielle puis validation + livraison fournisseur */
const STEPS_CAS2: StepDef[] = [
  { key: "EnAttente",          label: "En attente",          icon: Clock },
  { key: "EnTraitement",       label: "En traitement",       icon: Pencil },
  { key: "LivraisonPartielle", label: "Livraison partielle", icon: PackageOpen },
  { key: "AttenteValidation",  label: "Validation",          icon: FileText },
  { key: "AttenteLivraison",   label: "Att. livraison",      icon: Truck },
  { key: "Livree",             label: "Livrée",              icon: Check },
  { key: "AttenteComptabilite", label: "Comptabilité",       icon: Building2 },
]

/** Cas 3 : tout en commande → flux classique */
const STEPS_CAS3: StepDef[] = [
  { key: "EnAttente",           label: "En attente",    icon: Clock },
  { key: "EnTraitement",        label: "En traitement", icon: Pencil },
  { key: "AttenteValidation",   label: "Validation",    icon: FileText },
  { key: "AttenteLivraison",    label: "Att. livraison", icon: Truck },
  { key: "Livree",              label: "Livrée",        icon: Check },
  { key: "AttenteComptabilite", label: "Comptabilité",  icon: Building2 },
]

/**
 * Détermine le cas et retourne la liste d'étapes appropriée.
 *
 * Cas 1 — Dotee  : tout stock livré, flux terminé.
 *
 * Cas 2 — Stock + Commande : au moins un article a une dotation stock
 *   (configurée OU déjà livrée) ET au moins un article est en commande.
 *   Détecté dès EnAttente/EnTraitement si des dotations sont présentes,
 *   sans attendre que estLivre=true.
 *
 * Cas 3 — Commande pure : tout le reste.
 */
function getStepsForDemande(
  statut: StatutDemande,
  articles: {
    source?: string
    estLivre?: boolean
    quantiteDotee?: number | null
    dotations?: { id: number }[]
  }[]
): StepDef[] {
  if (statut === "Dotee") return STEPS_CAS1

  // Un article "doté" = Source Stock ET (estLivre OU dotations configurées OU quantiteDotee > 0)
  const aStockDote = articles.some(a =>
    a.source === "Stock" && (
      a.estLivre === true ||
      (a.dotations != null && a.dotations.length > 0) ||
      (a.quantiteDotee != null && a.quantiteDotee > 0)
    )
  )
  const aCommande = articles.some(
    a => a.source === "Commande" || a.source === "CommandeReste"
  )

  if (statut === "LivraisonPartielle" || (aStockDote && aCommande)) return STEPS_CAS2

  return STEPS_CAS3
}

function getStepStatus(
  currentStatut: StatutDemande,
  stepKey: StatutDemande,
  steps: StepDef[]
): "completed" | "current" | "pending" | "rejected" {
  if (currentStatut === "Rejetee") {
    const rejectIndex = steps.findIndex(s => s.key === "AttenteValidation")
    const stepIndex   = steps.findIndex(s => s.key === stepKey)
    if (rejectIndex === -1) return stepIndex === 0 ? "rejected" : "pending"
    if (stepIndex < rejectIndex)  return "completed"
    if (stepIndex === rejectIndex) return "rejected"
    return "pending"
  }
  const currentIndex = steps.findIndex(s => s.key === currentStatut)
  const stepIndex    = steps.findIndex(s => s.key === stepKey)
  if (currentIndex === -1) return "pending"
  if (stepIndex < currentIndex)  return "completed"
  if (stepIndex === currentIndex) return "current"
  return "pending"
}

/** Indique si on affiche la colonne livraison dans le tableau des articles */
function showLivraisonColumn(statut: StatutDemande) {
  return ["LivraisonPartielle", "AttenteLivraison", "AttenteComptabilite", "Livree", "Dotee"].includes(statut)
}

export default function DemandeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const { demande, loading, refresh } = useDemande(id || null)
  const {
    sauvegarderTraitement,
    soumettreTraitement,
    validerDemande,
    rejeterDemande,
    confirmerLivraisonArticle,
    confirmerToutesLivraisons,
    finaliserLivraison,
    loading: actionLoading,
  } = useDemandesActions()
  const { items: depots } = useDepotsAll()

  const [isTraitementOpen, setIsTraitementOpen] = useState(false)
  const [isValidationOpen, setIsValidationOpen] = useState(false)
  const [isRejetOpen,      setIsRejetOpen]       = useState(false)
  const [isLivraisonOpen, setIsLivraisonOpen]    = useState(false)

  const handleSaveDraft = async (data: TraitementRequest) => {
    await sauvegarderTraitement(id, data)
    setIsTraitementOpen(false)
    refresh()
  }

  const handleSubmitTraitement = async (data: TraitementRequest) => {
    await soumettreTraitement(id, data)
    setIsTraitementOpen(false)
    refresh()
  }

  const handleValidation = async (data: { notesValidation?: string; dateLivraisonPrevue?: string }) => {
    await validerDemande(id, data)
    setIsValidationOpen(false)
    refresh()
  }

  const handleRejet = async (data: { motifRejet: string }) => {
    await rejeterDemande(id, { motifRejet: data.motifRejet })
    setIsRejetOpen(false)
    refresh()
  }

  /** Confirmer la livraison d'un article précis */
  const handleConfirmerArticle = async (articleId: number) => {
    await confirmerLivraisonArticle(id, articleId)
    refresh()
  }

  /** Confirmer la livraison de tous les articles d'un coup */
  const handleConfirmerTout = async () => {
    await confirmerToutesLivraisons(id)
    refresh()
  }

  /** Finaliser la livraison → passe en AttenteComptabilite */
  const handleFinaliserLivraison = async () => {
    await finaliserLivraison(id)
    setIsLivraisonOpen(false)
    refresh()
  }

  useEffect(() => {
    if (!loading && !demande) {
      router.push("/stock/demandes")
    }
  }, [loading, demande, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Chargement...</div>
      </DashboardLayout>
    )
  }

  if (!demande) return null

  // Calcul progression livraison (si applicable)
  const articlesLivres = demande.articles.filter((a) => a.estLivre).length
  const totalArticles  = demande.articles.length
  const tousLivres     = articlesLivres === totalArticles && totalArticles > 0
  const progressPct    = totalArticles > 0 ? Math.round((articlesLivres / totalArticles) * 100) : 0

  // Déterminer le cas métier pour la timeline
  const steps      = getStepsForDemande(demande.statut, demande.articles)
  const casDemande =
    demande.statut === "Dotee" ? 1 :
    steps === STEPS_CAS2       ? 2 : 3

  // Compteurs Cas 2 : articles dotés depuis stock vs en attente commande
  const nbStockDotes  = demande.articles.filter(a =>
    a.source === "Stock" && (
      a.estLivre ||
      (a.dotations != null && a.dotations.length > 0) ||
      ((a as any).quantiteDotee != null && (a as any).quantiteDotee > 0)
    )
  ).length
  const nbCommande = demande.articles.filter(
    a => a.source === "Commande" || a.source === "CommandeReste"
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/stock/demandes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux demandes
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{demande.numero}</h1>
              <Badge className={`${StatutDemandeColors[demande.statut]} rounded-full px-3 py-1`}>
                {StatutDemandeLabels[demande.statut]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(demande.dateDemande).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {demande.nomDemandeur}{demande.posteDemandeur ? ` - ${demande.posteDemandeur}` : ""}
              </span>
            </div>
          </div>

          {/* ── Actions rapides ── */}
          <div className="flex gap-2">
            {demande.statut === "EnAttente" && (
              <Button onClick={() => setIsTraitementOpen(true)} className="bg-[#1e3a5f] hover:bg-[#15293f] text-white">
                <Pencil className="mr-2 h-4 w-4" />
                Traiter la demande
              </Button>
            )}
            {demande.statut === "EnTraitement" && (
              <Button onClick={() => setIsTraitementOpen(true)} variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Modifier le traitement
              </Button>
            )}
            {/* Cas 1 : Dotee → aucune action, le flux est terminé */}
            {demande.statut === "Dotee" && (
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-sm px-3 py-1.5">
                <PackageCheck className="mr-2 h-4 w-4" />
                Demande clôturée — Dotée
              </Badge>
            )}
            {/* Cas 2 : LivraisonPartielle → ouvrir le sheet de confirmation livraison */}
            {demande.statut === "LivraisonPartielle" && (
              <Button
                onClick={() => setIsTraitementOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={actionLoading}
              >
                <PackageOpen className="mr-2 h-4 w-4" />
                Livraison partielle
                {totalArticles > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                    {articlesLivres}/{totalArticles}
                  </span>
                )}
              </Button>
            )}
            {demande.statut === "AttenteLivraison" && (
              <Button
                onClick={() => setIsLivraisonOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={actionLoading}
              >
                <Truck className="mr-2 h-4 w-4" />
                Confirmer livraisons
                {totalArticles > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {articlesLivres}/{totalArticles}
                  </span>
                )}
              </Button>
            )}
            {demande.statut === "AttenteValidation" && (
              <>
                <Button onClick={() => setIsValidationOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="mr-2 h-4 w-4" />
                  Valider
                </Button>
                <Button onClick={() => setIsRejetOpen(true)} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── 2 Column Layout ── */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* ── Left Column ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Timeline dynamique selon le cas */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Suivi du statut</CardTitle>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                    {casDemande === 1 && "Dotation stock"}
                    {casDemande === 2 && "Stock + Commande"}
                    {casDemande === 3 && "Commande fournisseur"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between overflow-x-auto pb-1">
                  {steps.map((step, index) => {
                    const status = getStepStatus(demande.statut, step.key, steps)
                    const Icon   = step.icon
                    return (
                      <div key={step.key} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center">
                          <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2
                            ${status === "completed" ? "bg-green-100 border-green-500 text-green-600" : ""}
                            ${status === "current"   ? "bg-[#1e3a5f] border-[#1e3a5f] text-white"   : ""}
                            ${status === "pending"   ? "bg-gray-100 border-gray-200 text-gray-300"  : ""}
                            ${status === "rejected"  ? "bg-red-100 border-red-500 text-red-600"     : ""}
                          `}>
                            {status === "completed" ? <Check className="h-4 w-4" /> :
                             status === "rejected"  ? <X className="h-4 w-4" />    :
                             <Icon className="h-4 w-4" />}
                          </div>
                          <span className={`text-xs mt-1.5 text-center max-w-[72px] leading-tight
                            ${status === "current"   ? "font-semibold text-[#1e3a5f]" : ""}
                            ${status === "completed" ? "text-green-600"               : ""}
                            ${status === "rejected"  ? "text-red-600"                 : ""}
                            ${status === "pending"   ? "text-gray-300"                : ""}
                          `}>
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`h-0.5 w-6 sm:w-10 mx-1 shrink-0 ${
                            getStepStatus(demande.statut, steps[index + 1].key, steps) !== "pending"
                              ? "bg-green-400" : "bg-gray-200"
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Alert rejet */}
            {demande.statut === "Rejetee" && demande.commentaireRejet && (
              <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Demande rejetee</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="font-medium">Motif du rejet :</p>
                  <p className="mt-1">{demande.commentaireRejet}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Alert Dotee (Cas 1) */}
            {demande.statut === "Dotee" && (
              <Alert className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
                <AlertTitle className="text-emerald-700">Demande dotée</AlertTitle>
                <AlertDescription className="mt-1 text-emerald-600 text-sm">
                  Tous les articles ont été prélevés depuis le stock et remis au demandeur.
                  Le traitement est terminé.
                </AlertDescription>
              </Alert>
            )}

            {/* Alert LivraisonPartielle (Cas 2) — visible dès qu'une dotation est configurée */}
            {casDemande === 2 && (demande.statut === "LivraisonPartielle" || demande.statut === "EnAttente" || demande.statut === "EnTraitement") && (
              <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950">
                <PackageOpen className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-700">
                  {demande.statut === "LivraisonPartielle"
                    ? "Livraison partielle"
                    : "Traitement mixte — Stock + Commande"}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  {demande.statut === "LivraisonPartielle" ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-700 text-sm">
                          {articlesLivres} article{articlesLivres > 1 ? "s" : ""} doté{articlesLivres > 1 ? "s" : ""} depuis le stock — {totalArticles - articlesLivres} en attente fournisseur
                        </span>
                        <span className="text-amber-700 font-semibold text-sm">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                      </div>
                      <p className="mt-2 text-amber-600 text-xs">
                        La demande passe en validation pour les articles restants.
                      </p>
                    </>
                  ) : (
                    <p className="text-amber-600 text-sm">
                      {nbStockDotes} article{nbStockDotes > 1 ? "s" : ""} doté{nbStockDotes > 1 ? "s" : ""} depuis le stock
                      {nbCommande > 0 && <> · {nbCommande} article{nbCommande > 1 ? "s" : ""} en commande fournisseur</>}.
                      Après soumission, la demande passera en <strong>livraison partielle</strong> puis en validation.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Alert livraison fournisseur en cours */}
            {demande.statut === "AttenteLivraison" && (
              <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950">
                <Truck className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-700">Livraison fournisseur en cours</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-700 text-sm">
                      {articlesLivres} article{articlesLivres > 1 ? "s" : ""} reçu{articlesLivres > 1 ? "s" : ""} sur {totalArticles}
                    </span>
                    <span className="text-blue-700 font-semibold text-sm">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  {tousLivres && (
                    <p className="mt-2 text-blue-700 font-medium text-sm">
                      Tous les articles sont reçus. Vous pouvez finaliser la livraison.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Motif */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Motif de la demande</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{demande.motifDemande}</p>
              </CardContent>
            </Card>

            {/* Articles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Articles demandes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e3a5f]">
                        <TableHead className="text-white font-medium">Designation</TableHead>
                        <TableHead className="text-white font-medium text-center">Unite</TableHead>
                        <TableHead className="text-white font-medium text-center">Source</TableHead>
                        <TableHead className="text-white font-medium text-center">Qte dem.</TableHead>
                        <TableHead className="text-white font-medium text-center">Qte val.</TableHead>
                        <TableHead className="text-white font-medium text-right">Prix unit.</TableHead>
                        <TableHead className="text-white font-medium text-right">Total</TableHead>
                        {showLivraisonColumn(demande.statut) && (
                          <TableHead className="text-white font-medium text-center">Livraison</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demande.articles.map((article, index) => (
                        <TableRow
                          key={article.id}
                          className={
                            showLivraisonColumn(demande.statut) && article.estLivre
                              ? "bg-emerald-50 dark:bg-emerald-950"
                              : article.source === "Commande" || article.source === "CommandeReste"
                              ? "bg-blue-50/30 dark:bg-blue-950/20"
                              : index % 2 === 0
                              ? "bg-white dark:bg-gray-950"
                              : "bg-[#f9fafb] dark:bg-gray-900"
                          }
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{article.articleNom || article.designationLibre || article.articleDescription}</p>
                              {article.articleReference && (
                                <p className="text-xs text-muted-foreground">{article.articleReference}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{article.unite}</TableCell>
                          {/* Colonne Source */}
                          <TableCell className="text-center">
                            {article.source === "Stock" ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                                <PackageCheck className="h-3 w-3" />Stock
                              </span>
                            ) : article.source === "CommandeReste" ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                                Reliquat
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
                                Commande
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{article.quantiteDemandee}</TableCell>
                          <TableCell className="text-center">{article?.quantiteValidee ?? "-"}</TableCell>
                          <TableCell className="text-right">
                            {article?.prixUnitaireDevis
                              ? formatMontantStock(article.prixUnitaireDevis)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {article?.prixTotalLigne
                              ? formatMontantStock(article.prixTotalLigne)
                              : article.montantHT
                              ? formatMontantStock(article.montantHT)
                              : "-"}
                          </TableCell>

                          {/* Colonne livraison — visible si AttenteLivraison / AttenteComptabilite / Livree */}
                          {showLivraisonColumn(demande.statut) && (
                            <TableCell className="text-center">
                              {article.estLivre ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                    <PackageCheck className="h-3 w-3 mr-1" />
                                    Recu
                                  </Badge>
                                  {article.dateConfirmationLivraison && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(article.dateConfirmationLivraison).toLocaleDateString("fr-FR")}
                                    </span>
                                  )}
                                  {article.userValidationLivraisonNom && (
                                    <span className="text-xs text-muted-foreground italic">
                                      par {article.userValidationLivraisonNom}
                                    </span>
                                  )}
                                </div>
                              ) : demande.statut === "AttenteLivraison" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                                  onClick={() => handleConfirmerArticle(article.id)}
                                  disabled={actionLoading}
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  Confirmer
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-xs text-gray-400">
                                  En attente
                                </Badge>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableCell
                          colSpan={showLivraisonColumn(demande.statut) ? 6 : 5}
                          className="text-right font-semibold"
                        >
                          Total HT
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#1e3a5f]">
                          {formatMontantStock(demande.traitement?.montantDevisHT || demande.montantTotal)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Informations */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Informations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type destination</span>
                  <span className="font-medium">{demande.typeDestination}</span>
                </div>
                {demande.projetNom && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projet</span>
                    <span className="font-medium">{demande.projetNom}</span>
                  </div>
                )}
                {demande.etapeNom && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Etape</span>
                    <span className="font-medium">{demande.etapeNom}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Articles</span>
                  <span className="font-medium">{demande.articles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant HT</span>
                  <span className="font-bold text-[#1e3a5f]">{formatMontantStock(demande.traitement?.montantDevisHT ?? 0)}</span>
                </div>
                {/* Dépôt de destination de la demande */}
                {(demande as any).depotDemandeNom && (
                  <div className="flex justify-between items-start pt-2 border-t border-gray-100">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Dépôt destination
                    </span>
                    <div className="text-right">
                      <span className="font-medium flex items-center gap-1 justify-end">
                        <Warehouse className="h-3.5 w-3.5 text-emerald-500" />
                        {(demande as any).depotDemandeNom}
                      </span>
                      {(demande as any).depotDemandeCode && (
                        <span className="text-xs text-gray-400">{(demande as any).depotDemandeCode}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Dépôt de livraison — visible dès qu'un dépôt est défini */}
            {(demande as any).depotDemandeNom && (
              <Card className="border-emerald-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-lg text-emerald-700">Dépôt de livraison</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dépôt</span>
                    <span className="font-semibold text-emerald-700">{(demande as any).depotDemandeNom}</span>
                  </div>
                  {(demande as any).depotDemandeCode && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Code</span>
                      <span className="font-mono text-sm">{(demande as any).depotDemandeCode}</span>
                    </div>
                  )}
                  {["AttenteLivraison", "LivraisonPartielle", "AttenteComptabilite", "Livree", "Dotee"].includes(demande.statut) && (
                    <div className="pt-2 border-t border-emerald-100">
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Les articles livrés sont transférés vers ce dépôt.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Validation / Rejet */}
            {(demande.statut === "Rejetee" ||
              demande.statut === "AttenteLivraison" ||
              demande.statut === "AttenteComptabilite" ||
              demande.statut === "Livree") && (
              <Card className={demande.statut === "Rejetee" ? "border-red-200" : "border-green-200"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {demande.statut === "Rejetee" ? (
                      <ShieldX className="h-5 w-5 text-red-600" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    )}
                    <CardTitle className={`text-lg ${demande.statut === "Rejetee" ? "text-red-700" : "text-green-700"}`}>
                      {demande.statut === "Rejetee" ? "Decision de rejet" : "Decision de validation"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demande.validateurNom && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Par</span>
                      <span className="font-medium">{demande.validateurNom}</span>
                    </div>
                  )}
                  {demande.dateValidation && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Le</span>
                      <span className="font-medium">
                        {new Date(demande.dateValidation).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {demande.dateLivraisonPrevue && demande.statut !== "Rejetee" && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Livraison prevue</span>
                      <span className="font-medium">
                        {new Date(demande.dateLivraisonPrevue).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {demande.notesValidation && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-muted-foreground mb-1">Notes de validation</p>
                      <p className="text-sm bg-gray-50 dark:bg-gray-900 rounded p-3">{demande.notesValidation}</p>
                    </div>
                  )}
                  {demande.statut === "Rejetee" && demande.commentaireRejet && (
                    <div className="pt-2 border-t border-red-100">
                      <p className="text-sm text-red-600 font-medium mb-1">Motif du rejet</p>
                      <p className="text-sm bg-red-50 dark:bg-red-950 rounded p-3 text-red-700">
                        {demande.commentaireRejet}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Card Livraison — visible pour AttenteComptabilite et Livree */}
            {(demande.statut === "AttenteComptabilite" || demande.statut === "Livree") && (
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-700">Livraison</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Articles recus</span>
                    <span className="font-medium text-green-600">
                      {articlesLivres} / {totalArticles}
                    </span>
                  </div>
                  {demande.dateLivraisonReelle && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date reception</span>
                      <span className="font-medium">
                        {new Date(demande.dateLivraisonReelle).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {demande.validateurNom && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confirme par</span>
                      <span className="font-medium">{demande.validateurNom}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-blue-100">
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">{progressPct}% livré</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Traitement */}
            {demande.traitement && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Traitement</CardTitle>
                    <Badge variant="outline" className={
                      demande.traitement.statutTraitement === "Complet"
                        ? "border-green-500 text-green-600"
                        : "border-amber-500 text-amber-600"
                    }>
                      {demande.traitement.statutTraitement === "Complet" ? "Complet" : "Brouillon"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fournisseur</span>
                    <span className="font-medium text-right">
                      {demande.traitement.fournisseurNom || demande.traitement.nomFournisseurLibre || "-"}
                    </span>
                  </div>
                  {demande.traitement.numeroDevis && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">N° devis</span>
                      <span className="font-mono">{demande.traitement.numeroDevis}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Montant HT</span>
                    <span className="font-bold text-[#1e3a5f]">{formatMontantStock(demande.traitement.montantDevisHT || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Montant TTC</span>
                    <span className="font-medium">{formatMontantStock(demande.traitement.montantDevisTTC || 0)}</span>
                  </div>
                  {demande.traitement.delaiLivraison && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Delai livraison</span>
                      <span className="font-medium">{demande.traitement.delaiLivraison}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Sheets & Modals ── */}
      <TraitementFormSheet
        open={isTraitementOpen}
        onOpenChange={setIsTraitementOpen}
        demande={demande}
        depots={depots.map((d) => ({ id: d.id, nom: d.nom, code: d.code }))}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitTraitement}
      />
      <LivraisonConfirmationSheet
        open={isLivraisonOpen}
        onOpenChange={setIsLivraisonOpen}
        demande={demande}
        onRefresh={refresh}
      />
      <ValidationModal
        open={isValidationOpen}
        onOpenChange={setIsValidationOpen}
        demande={demande}
        onConfirm={handleValidation}
      />
      <RejetModal
        open={isRejetOpen}
        onOpenChange={setIsRejetOpen}
        demande={demande}
        onConfirm={handleRejet}
      />
    </DashboardLayout>
  )
}