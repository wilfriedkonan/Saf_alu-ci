"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  ArrowLeft, Send, BarChart3, Loader2, Clock,
  CheckCircle2, FileText, Layers, Users, XCircle,
  Calendar, Lock, Plus,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useDevisFournisseur } from "@/hooks/useDevisFournisseur"
import { DevisFournisseurService } from "@/services/devisFournisseurService"
import { EnvoyerDemandesModal, ComparaisonView } from "@/components/devis-fournisseur/devis-components"
import { WhatsAppSendPanel, type DemandeCreee } from "@/components/devis-fournisseur/whatsapp-send-panel"
import {
  statutDevisColors, statutDevisLabels,
  statutDemandeColors, statutDemandeLabels,
} from "@/types/devis-fournisseur"
import type { StatutDemande } from "@/types/devis-fournisseur"

const fCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(n)

function LignesTable({ lignes }: { lignes: { id: number; designation: string; description?: string; typeElement?: string; dimensionL?: number; dimensionH?: number; quantite: number; unite?: string }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/20">
          <th className="text-left p-3 font-medium">Désignation</th>
          <th className="text-center p-3 font-medium hidden sm:table-cell">Type</th>
          <th className="text-center p-3 font-medium hidden sm:table-cell">Dimensions</th>
          <th className="text-center p-3 font-medium">Qté</th>
          <th className="text-center p-3 font-medium hidden sm:table-cell">Unité</th>
        </tr>
      </thead>
      <tbody>
        {lignes.map(l => (
          <tr key={l.id} className="border-b hover:bg-muted/10">
            <td className="p-3">
              <p className="font-medium">{l.designation}</p>
              {l.description && <p className="text-xs text-muted-foreground mt-0.5">{l.description}</p>}
            </td>
            <td className="p-3 text-center text-muted-foreground hidden sm:table-cell">
              {l.typeElement || "—"}
            </td>
            <td className="p-3 text-center text-muted-foreground hidden sm:table-cell">
              {l.dimensionL && l.dimensionH ? `${l.dimensionL}×${l.dimensionH} m` : "—"}
            </td>
            <td className="p-3 text-center">{l.quantite}</td>
            <td className="p-3 text-center text-muted-foreground hidden sm:table-cell">
              {l.unite || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function DevisFournisseurDetailPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id ? parseInt(params.id as string) : null

  const { devis, loading, refresh } = useDevisFournisseur(devisId)
  const [activeTab, setActiveTab]     = useState("detail")
  const [envoyerOpen, setEnvoyerOpen] = useState(false)
  const [waSendOpen, setWaSendOpen]   = useState(false)
  const [demandesCreees, setDemandesCreees] = useState<DemandeCreee[]>([])
  const [cloturing, setCloturing]     = useState(false)
  const [selectioning, setSelectioning] = useState(false)

  const handleCloturer = async () => {
    if (!devisId) return
    if (!confirm("Clôturer ce devis ? Les fournisseurs ne pourront plus répondre.")) return
    setCloturing(true)
    try {
      await DevisFournisseurService.cloturer(devisId)
      toast({ title: "Devis clôturé avec succès" })
      refresh()
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setCloturing(false) }
  }

  const handleDemandesCreees = (demandes: DemandeCreee[]) => {
    setDemandesCreees(demandes)
    setWaSendOpen(true)
    refresh()
  }

  const handleSelectionnerFournisseur = async (demandeId: number) => {
    if (!devisId) return
    const commentaire = prompt("Commentaire de sélection (optionnel) :")
    setSelectioning(true)
    try {
      await DevisFournisseurService.selectionnerFournisseur(devisId, { demandeId, commentaire: commentaire ?? undefined })
      toast({ title: "Fournisseur sélectionné avec succès" })
      refresh()
      setActiveTab("comparaison")
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setSelectioning(false) }
  }

  const handleSelectionnerLignes = async (selection: Record<number, number>) => {
    if (!devisId) return
    try {
      await DevisFournisseurService.selectionnerLignes(devisId, { selectionParLigne: selection })
      toast({ title: "Sélection par ligne enregistrée" })
      refresh()
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </DashboardLayout>
  )

  if (!devis) return null

  const nbDemandes  = devis.demandes?.length ?? 0
  const nbReponses  = devis.demandes?.filter(d => d.statut === "Repondu").length ?? 0
  const dateLimite  = new Date(devis.dateLimiteReponse)
  const estExpire   = dateLimite < new Date()
  const peutEnvoyer = devis.statut === "Brouillon" || devis.statut === "EnCours"
  const peutCloturer = devis.statut === "Brouillon" || devis.statut === "EnCours"
  const totalLignes = devis.lignes?.length ?? 0

  // Lignes groupées par sectionId (les lignes sont toujours dans devis.lignes à la racine)
  const lignesParSection = (devis.lignes ?? []).reduce<Record<number, typeof devis.lignes>>((acc, l) => {
    const key = l.sectionId ?? 0
    acc[key] = [...(acc[key] ?? []), l]
    return acc
  }, {})
  const lignesSansSection = lignesParSection[0] ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Retour */}
        <Button variant="ghost" size="sm" onClick={() => router.push("/devis-fournisseurs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Retour aux devis
        </Button>

        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground">{devis.reference}</span>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {devis.typeDevis === "Classique"
                  ? <FileText className="h-3 w-3" />
                  : <Layers className="h-3 w-3" />
                }
                {devis.typeDevis}
              </Badge>
              <Badge className={cn("text-xs", statutDevisColors[devis.statut])}>
                {statutDevisLabels[devis.statut]}
              </Badge>
              {estExpire && devis.statut === "EnCours" && (
                <Badge className="text-xs bg-orange-100 text-orange-700">
                  <Clock className="h-3 w-3 mr-1" />Délai dépassé
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{devis.titre}</h1>
            {devis.description && (
              <p className="text-muted-foreground text-sm">{devis.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {peutEnvoyer && (
              <Button onClick={() => setEnvoyerOpen(true)}>
                <Send className="mr-2 h-4 w-4" />Envoyer aux fournisseurs
              </Button>
            )}
            {peutCloturer && (
              <Button variant="outline" onClick={handleCloturer} disabled={cloturing}>
                {cloturing
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Lock className="mr-2 h-4 w-4" />
                }
                Clôturer
              </Button>
            )}
          </div>
        </div>

        {/* Cartes résumé */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Délai de réponse</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={cn("text-xl font-bold", estExpire && "text-red-600")}>
                {format(dateLimite, "dd MMM yyyy", { locale: fr })}
              </p>
              <p className="text-xs text-muted-foreground">
                {estExpire
                  ? "Délai dépassé"
                  : `Dans ${Math.ceil((dateLimite.getTime() - Date.now()) / 86400000)} j`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Lignes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalLignes}</p>
              {devis.typeDevis === "Technique" && (
                <p className="text-xs text-muted-foreground">{devis.sections?.length ?? 0} section(s)</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{nbDemandes}</p>
              <p className="text-xs text-muted-foreground">sollicités</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Réponses reçues</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{nbReponses}</p>
              <p className="text-xs text-muted-foreground">
                {nbDemandes > 0 ? `sur ${nbDemandes} envoyés` : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="detail" className="gap-2">
              <FileText className="h-4 w-4" />Détail du devis
            </TabsTrigger>
            <TabsTrigger value="demandes" className="gap-2">
              <Send className="h-4 w-4" />
              Demandes
              {nbDemandes > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{nbDemandes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comparaison" className="gap-2" disabled={nbReponses === 0}>
              <BarChart3 className="h-4 w-4" />
              Comparaison
              {nbReponses > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{nbReponses}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Onglet Détail */}
          <TabsContent value="detail" className="mt-4">
            <div className="space-y-4">
              {(devis.remiseGlobalePct > 0 || devis.remiseGlobaleValeur > 0) && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="py-3 flex items-center gap-6 text-sm">
                    <span className="font-medium text-blue-800">Remise globale :</span>
                    {devis.remiseGlobalePct > 0 && (
                      <span className="text-blue-700">{devis.remiseGlobalePct}%</span>
                    )}
                    {devis.remiseGlobaleValeur > 0 && (
                      <span className="text-blue-700">{fCurrency(devis.remiseGlobaleValeur)}</span>
                    )}
                  </CardContent>
                </Card>
              )}

              {devis.typeDevis === "Classique" && (
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="text-left p-3 font-medium">#</th>
                          <th className="text-left p-3 font-medium">Désignation</th>
                          <th className="text-center p-3 font-medium">Qté</th>
                          <th className="text-center p-3 font-medium">Unité</th>
                          <th className="text-center p-3 font-medium">Remise</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devis.lignes?.map(l => (
                          <tr key={l.id} className="border-b hover:bg-muted/20">
                            <td className="p-3 text-muted-foreground">{l.ordre}</td>
                            <td className="p-3">
                              <p className="font-medium">{l.designation}</p>
                              {l.description && <p className="text-xs text-muted-foreground mt-0.5">{l.description}</p>}
                            </td>
                            <td className="p-3 text-center">{l.quantite}</td>
                            <td className="p-3 text-center text-muted-foreground">{l.unite ?? "—"}</td>
                            <td className="p-3 text-center text-muted-foreground">
                              {l.remiseLignePct > 0 ? `${l.remiseLignePct}%` :
                               l.remiseLigneValeur > 0 ? fCurrency(l.remiseLigneValeur) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {devis.typeDevis === "Technique" && (
                <div className="space-y-4">
                  {/* Sections avec leurs lignes (depuis devis.lignes groupées par sectionId) */}
                  {devis.sections?.map(section => {
                    const lignes = lignesParSection[section.id] ?? []
                    return (
                      <Card key={section.id}>
                        <CardHeader className="pb-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Layers className="h-4 w-4 text-purple-600" />
                              {section.titre}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {section.remiseSectionPct > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Remise : {section.remiseSectionPct}%
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {lignes.length} ligne{lignes.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>
                          {section.description && (
                            <p className="text-xs text-muted-foreground">{section.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="p-0">
                          {lignes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              Aucune ligne dans cette section
                            </p>
                          ) : (
                            <LignesTable lignes={lignes} />
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Lignes sans section (sectionId: null) */}
                  {lignesSansSection.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Lignes sans section
                          <Badge variant="secondary" className="text-xs ml-1">
                            {lignesSansSection.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <LignesTable lignes={lignesSansSection} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Onglet Demandes */}
          <TabsContent value="demandes" className="mt-4">
            {nbDemandes === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Send className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm mb-2">Aucune demande envoyée</p>
                  {peutEnvoyer && (
                    <Button size="sm" onClick={() => setEnvoyerOpen(true)}>
                      <Send className="mr-2 h-4 w-4" />Envoyer aux fournisseurs
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {devis.demandes?.map(demande => (
                  <Card key={demande.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div>
                            <p className="font-semibold">
                              {demande.fournisseurNom ?? `Fournisseur #${demande.fournisseurId}`}
                            </p>
                            {demande.fournisseurTelephone && (
                              <p className="text-xs text-muted-foreground font-mono">{demande.fournisseurTelephone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn("text-xs", statutDemandeColors[demande.statut as StatutDemande])}>
                            {statutDemandeLabels[demande.statut as StatutDemande]}
                          </Badge>
                          {demande.selectionne && (
                            <Badge className="text-xs bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Sélectionné
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground text-right">
                            <p>Expire : {format(new Date(demande.dateExpiration), "dd/MM/yyyy HH:mm")}</p>
                            {demande.dateReponse && (
                              <p className="text-green-600">
                                Répondu : {format(new Date(demande.dateReponse), "dd/MM/yyyy")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {peutEnvoyer && (
                  <Button variant="outline" onClick={() => setEnvoyerOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />Ajouter des fournisseurs
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Onglet Comparaison */}
          <TabsContent value="comparaison" className="mt-4">
            <ComparaisonView
              devisId={devis.id}
              onSelectionnerFournisseur={handleSelectionnerFournisseur}
              onSelectionnerLignes={handleSelectionnerLignes}
            />
          </TabsContent>
        </Tabs>
      </div>

      {devisId && (
        <EnvoyerDemandesModal
          open={envoyerOpen}
          devisId={devisId}
          devisReference={devis.reference}
          demandesExistantes={devis.demandes ?? []}
          onOpenChange={setEnvoyerOpen}
          onSuccess={handleDemandesCreees}
        />
      )}

      <WhatsAppSendPanel
        open={waSendOpen}
        demandes={demandesCreees}
        onOpenChange={setWaSendOpen}
        onClose={() => { setWaSendOpen(false); setActiveTab("demandes") }}
        devisReference={devis.reference}
        devisDescription={devis.description}
      />
    </DashboardLayout>
  )
}
