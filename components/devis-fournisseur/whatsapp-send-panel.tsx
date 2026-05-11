"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  Copy, CheckCheck,
  AlertTriangle, MessageSquare, Shield, Clock,
  ChevronDown, ChevronUp, Check, Eye, Send, ArrowRight,
  Loader2, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWhatsAppMessagesPredefinis, useWhatsAppComptes } from "@/hooks/useWhatsappParametres"
import { useWhatsappMessages } from "@/hooks/useWhatsapp"
import type { WhatsAppMessagePredefini } from "@/types/whatsappParametres"

// ── Types ─────────────────────────────────────────────────────

export interface DemandeCreee {
  id: number
  fournisseurId: number
  fournisseurNom: string
  fournisseurTelephone?: string
  token: string
  otp: string
  dateExpiration: string
  messageWhatsApp: string
  lienDevis: string
}

interface WhatsAppSendPanelProps {
  open: boolean
  demandes: DemandeCreee[]
  onOpenChange: (v: boolean) => void
  onClose: () => void
  // Contexte devis pour renseigner les variables du template
  devisReference?: string
  devisDescription?: string
  nomEntreprise?: string
  nomDemandeur?: string
  telephoneEntreprise?: string
}

type Etape = "preview" | "envoi"

// ── Indicateur d'étapes ───────────────────────────────────────

function EtapeIndicator({ etape }: { etape: Etape }) {
  const etapes: { key: Etape; label: string; icon: React.ReactNode }[] = [
    { key: "preview", label: "Aperçu",  icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "envoi",   label: "Envoi",   icon: <Send className="h-3.5 w-3.5" /> },
  ]
  const idx = etapes.findIndex(e => e.key === etape)

  return (
    <div className="flex items-center gap-0">
      {etapes.map((e, i) => (
        <div key={e.key} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
              i < idx
                ? "bg-primary text-primary-foreground"
                : i === idx
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
            )}>
              {i < idx ? <Check className="h-3 w-3" /> : e.icon}
            </div>
            <span className={cn(
              "text-xs font-medium hidden sm:block",
              i === idx ? "text-foreground" : "text-muted-foreground"
            )}>
              {e.label}
            </span>
          </div>
          {i < etapes.length - 1 && (
            <div className={cn(
              "h-px w-8 sm:w-12 mx-1.5",
              i < idx ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Étape 1 : Prévisualisation (template et demandes garantis non-vides par le parent) ──

function EtapePreview({
  template, demandes, onContinuer,
  devisReference, devisDescription, nomEntreprise, nomDemandeur, telephoneEntreprise,
}: {
  template: WhatsAppMessagePredefini
  demandes: DemandeCreee[]
  onContinuer: () => void
  devisReference?: string
  devisDescription?: string
  nomEntreprise?: string
  nomDemandeur?: string
  telephoneEntreprise?: string
}) {
  const [sampleIdx, setSampleIdx] = useState(0)

  const demande = demandes[sampleIdx] ?? demandes[0]

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

  const computePreview = (d: DemandeCreee) => {
    const all: Record<string, string> = {
      NOM_CONTACT:          d.fournisseurNom,
      NOM_ENTREPRISE:       nomEntreprise    ?? "",
      REFERENCE_DEMANDE:    devisReference   ?? "",
      DATE_DEMANDE:         fmt(new Date().toISOString()),
      NOM_DEMANDEUR:        nomDemandeur     ?? "",
      LIEN_DEVIS:           d.lienDevis,
      DESCRIPTION_DEMANDE:  devisDescription ?? "",
      DATE_LIMITE:          fmt(d.dateExpiration),
      TELEPHONE_ENTREPRISE: telephoneEntreprise ?? d.fournisseurTelephone ?? d.fournisseurTelephone ?? "",
    }
    const vars = Object.fromEntries((template.variablesListe ?? []).map((v: string) => [v, all[v] ?? ""]))
    const contenuResolu = Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
      template.contenu
    )
    const variablesManquantes = [...contenuResolu.matchAll(/\{([^}]+)\}/g)].map(m => m[1])
    return { contenuResolu, variablesManquantes, estComplet: variablesManquantes.length === 0 }
  }

  // Synchrone : calculé directement sans état de loading
  const preview = computePreview(demande)
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-4">

          {/* Info template */}
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              Modèle : <span className="text-primary">{template.titre}</span>
            </p>
            {template.type && (
              <p className="text-xs text-muted-foreground">{template.type.libelle}</p>
            )}
            <p className="text-xs text-muted-foreground pt-0.5">
              Vérifiez l'aperçu avant de procéder à l'envoi aux fournisseurs.
            </p>
          </div>

          {/* Sélecteur de fournisseur si plusieurs */}
          {demandes.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground shrink-0">Aperçu pour :</span>
              <div className="flex gap-1.5 flex-wrap">
                {demandes.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSampleIdx(i)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-colors",
                      i === sampleIdx
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-border"
                    )}
                  >
                    {d.fournisseurNom}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Résultat de la prévisualisation */}
          <div className="space-y-3">
            {/* Badge état */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn(
                "text-xs",
                preview.estComplet
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-orange-100 text-orange-700 border-orange-200"
              )}>
                {preview.estComplet ? "✓ Message complet" : "⚠ Variables manquantes"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Pour : <strong>{demande.fournisseurNom}</strong>
              </span>
            </div>

            {/* Variables manquantes */}
            {preview.variablesManquantes?.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50 py-2.5">
                <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                <AlertDescription className="text-orange-800 text-xs">
                  Variables non résolues :{" "}
                  {preview.variablesManquantes.map(v => (
                    <Badge key={v} variant="outline" className="text-[10px] mr-1 text-orange-700 border-orange-300">
                      {"{" + v + "}"}
                    </Badge>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Bulle WhatsApp */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Aperçu du message
              </p>
              <div className="rounded-xl bg-[#dcf8c6] p-3.5 relative shadow-sm">
                <div className="absolute -top-2 left-4 w-3 h-3 rotate-45 bg-[#dcf8c6]" />
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-gray-800 break-words">
                  {preview.contenuResolu}
                </pre>
              </div>
              <p className="text-[11px] text-muted-foreground text-right">
                Modèle : {template.titre}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-5 py-4 border-t shrink-0 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          {demandes.length} fournisseur{demandes.length !== 1 ? "s" : ""} recevront ce message avec leurs données personnalisées.
        </p>
        <Button onClick={onContinuer} className="shrink-0 gap-2">
          Procéder à l'envoi
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Carte par fournisseur (étape envoi) ───────────────────────

function DemandeCard({
  demande, sent, onToggleSent, onEnvoyer, envoyant, canEnvoyer,
}: {
  demande: DemandeCreee
  sent: boolean
  onToggleSent: () => void
  onEnvoyer: () => Promise<boolean>
  envoyant: boolean
  canEnvoyer: boolean
}) {
  const [messageCopie, setMessageCopie] = useState(false)
  const [otpCopie, setOtpCopie]         = useState(false)
  const [lienCopie, setLienCopie]       = useState(false)
  const [expanded, setExpanded]         = useState(false)

  const copier = async (texte: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(texte)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }
  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all duration-200",
      sent ? "border-green-300 bg-green-50/30" : "bg-white"
    )}>
      {/* En-tête compact */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-3",
        sent ? "bg-green-50/60" : "bg-muted/40"
      )}>
        <button
          type="button"
          onClick={onToggleSent}
          title={sent ? "Marquer comme non envoyé" : "Marquer comme envoyé"}
          className={cn(
            "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
            sent
              ? "bg-green-500 border-green-500 text-white"
              : "border-muted-foreground hover:border-green-400"
          )}
        >
          {sent && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm truncate", sent && "line-through text-muted-foreground")}>
            {demande.fournisseurNom}
          </p>
          {demande.fournisseurTelephone ? (
            <p className="text-xs text-muted-foreground font-mono">{demande.fournisseurTelephone}</p>
          ) : (
            <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 mt-0.5">
              Sans téléphone
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground mb-0.5">OTP</p>
            <span className="font-mono font-bold text-base tracking-[0.25em] text-blue-700 leading-none">
              {demande.otp}
            </span>
          </div>
          <button
            onClick={() => copier(demande.otp, setOtpCopie)}
            className="rounded p-1 hover:bg-blue-100 transition-colors"
            title="Copier l'OTP"
          >
            {otpCopie
              ? <CheckCheck className="h-3.5 w-3.5 text-green-600" />
              : <Copy className="h-3.5 w-3.5 text-blue-500" />
            }
          </button>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t">
        <Button
          size="sm"
          disabled={sent || envoyant || !canEnvoyer}
          className={cn(
            "flex-1 text-xs h-8 transition-all",
            sent
              ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-100"
              : "bg-[#25D366] hover:bg-[#20b859] text-white"
          )}
          onClick={onEnvoyer}
        >
          {envoyant ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Envoi…</>
          ) : sent ? (
            <><CheckCheck className="h-3.5 w-3.5 mr-1.5" />Envoyé</>
          ) : (
            <><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Envoyer</>
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 shrink-0 p-0"
          onClick={() => copier(demande.messageWhatsApp, setMessageCopie)}
          title="Copier le message"
        >
          {messageCopie
            ? <CheckCheck className="h-3.5 w-3.5 text-green-600" />
            : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          }
        </Button>

        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
          title={expanded ? "Masquer" : "Voir le message"}
        >
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </button>
      </div>

      {/* Contenu dépliable */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Expire le {new Date(demande.dateExpiration).toLocaleDateString("fr-FR", {
              day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </div>
          <div className="rounded-xl bg-[#dcf8c6] p-3.5 relative">
            <div className="absolute -top-2 left-4 w-3 h-3 rotate-45 bg-[#dcf8c6]" />
            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-gray-800 break-words">
              {demande.messageWhatsApp}
            </pre>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/40 border">
            <span className="text-xs text-muted-foreground shrink-0">Lien :</span>
            <span className="text-xs font-mono text-blue-600 truncate flex-1 min-w-0">{demande.lienDevis}</span>
            <button
              onClick={() => copier(demande.lienDevis, setLienCopie)}
              className="shrink-0 rounded p-1 hover:bg-muted transition-colors"
            >
              {lienCopie
                ? <CheckCheck className="h-3 w-3 text-green-600" />
                : <Copy className="h-3 w-3 text-muted-foreground" />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Étape 2 : Envoi ───────────────────────────────────────────

function EtapeEnvoi({
  demandes, onClose, instanceNom,
}: {
  demandes: DemandeCreee[]
  onClose: () => void
  instanceNom: string | null
}) {
  const { sendText } = useWhatsappMessages()
  // sentIds     = état visuel checkbox (pré-rempli, togglable manuellement)
  // sentViaApi  = demandes réellement envoyées via API (vide au départ)
  const [sentIds, setSentIds]         = useState<Set<number>>(() => new Set(demandes.map(d => d.id)))
  const [sentViaApi, setSentViaApi]   = useState<Set<number>>(new Set())
  const [envoyantIds, setEnvoyantIds] = useState<Set<number>>(new Set())
  const [envoyantTout, setEnvoyantTout] = useState(false)

  const toggleSent = (id: number) => setSentIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleEnvoyer = async (demande: DemandeCreee): Promise<boolean> => {
    if (!instanceNom || !demande.fournisseurTelephone) return false
    setEnvoyantIds(prev => new Set(prev).add(demande.id))
    try {
      const res = await sendText({
        instance: instanceNom,
        phone: demande.fournisseurTelephone.replace(/\D/g, ""),
        message: demande.messageWhatsApp,
      })
      if (res?.success === true) {
        setSentViaApi(prev => new Set(prev).add(demande.id))
        setSentIds(prev => new Set(prev).add(demande.id))
        toast({
          title: "Message envoyé",
          description: `Message WhatsApp envoyé à ${demande.fournisseurNom}.`,
        })
        return true
      }
      const detail = res?.error ?? res?.message ?? "Réponse inattendue de l'API WhatsApp"
      toast({
        title: `Échec — ${demande.fournisseurNom}`,
        description: detail,
        variant: "destructive",
      })
      return false
    } catch (e: any) {
      toast({
        title: `Échec — ${demande.fournisseurNom}`,
        description: e?.message ?? "Échec de l'envoi",
        variant: "destructive",
      })
      return false
    } finally {
      setEnvoyantIds(prev => { const s = new Set(prev); s.delete(demande.id); return s })
    }
  }

  const handleTerminer = async () => {
    // Filtre sur sentViaApi (envois réels), pas sentIds (état visuel)
    const nonEnvoyees = demandes.filter(d => !sentViaApi.has(d.id) && !!d.fournisseurTelephone)

    if (nonEnvoyees.length > 0) {
      if (!instanceNom) {
        toast({
          title: "Aucun compte WhatsApp connecté",
          description: "Connectez un compte dans les paramètres pour envoyer les messages.",
          variant: "destructive",
        })
        return
      }
      setEnvoyantTout(true)
      try {
        const results = await Promise.allSettled(nonEnvoyees.map(d => handleEnvoyer(d)))
        const nbEchecs = results.filter(
          r => r.status === "rejected" || (r.status === "fulfilled" && r.value === false)
        ).length
        if (nbEchecs > 0) {
          toast({
            title: `${nbEchecs} envoi(s) échoué(s)`,
            description: "Vérifiez la connexion WhatsApp et réessayez.",
            variant: "destructive",
          })
          return
        }
      } finally {
        setEnvoyantTout(false)
      }
    }

    onClose()
  }

  const envoyables  = demandes.filter(d => !!d.fournisseurTelephone)
  const nbTotal     = envoyables.length
  const nbEnvoyes   = envoyables.filter(d => sentViaApi.has(d.id)).length
  const nbRestants  = envoyables.filter(d => !sentViaApi.has(d.id)).length
  const tousEnvoyes = nbTotal > 0 && nbRestants === 0
  const progressPct = nbTotal > 0 ? Math.round((nbEnvoyes / nbTotal) * 100) : 0

  const copierTout = async () => {
    const tout = demandes.map(d =>
      `── ${d.fournisseurNom} (${d.fournisseurTelephone ?? "N/A"}) ──\n` +
      `OTP  : ${d.otp}\n` +
      `Lien : ${d.lienDevis}\n`
    ).join("\n")
    await navigator.clipboard.writeText(tout)
    toast({ title: "Récapitulatif copié", description: "OTPs et liens copiés dans le presse-papier" })
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-4">

          {/* Avertissement compte non connecté */}
          {!instanceNom && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-sm">
                Aucun compte WhatsApp connecté. Connectez un compte dans les paramètres pour envoyer automatiquement.
              </AlertDescription>
            </Alert>
          )}

          {/* Avertissement OTP */}
          <Alert className="border-amber-200 bg-amber-50 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <AlertDescription className="text-amber-800 text-sm leading-snug">
              <strong>Codes OTP visibles une seule fois.</strong>{" "}
              Envoyez les messages maintenant ou copiez les codes.
            </AlertDescription>
          </Alert>

          {/* Récapitulatif OTP */}
          <div className="rounded-lg border bg-muted/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                Codes OTP
              </p>
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5" onClick={copierTout}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />Tout copier
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demandes.map(d => (
                <div
                  key={d.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
                    sentIds.has(d.id) ? "bg-green-50 border-green-200" : "bg-white"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {sentIds.has(d.id) && <CheckCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                    <span className="text-xs text-muted-foreground truncate">{d.fournisseurNom}</span>
                  </div>
                  <span className="font-mono font-bold text-sm tracking-widest text-blue-700 ml-2 shrink-0">
                    {d.otp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cartes fournisseurs */}
          <div className="space-y-3">
            {demandes.map(d => (
              <DemandeCard
                key={d.id}
                demande={d}
                sent={sentIds.has(d.id)}
                onToggleSent={() => toggleSent(d.id)}
                onEnvoyer={() => handleEnvoyer(d)}
                envoyant={envoyantIds.has(d.id)}
                canEnvoyer={!!d.fournisseurTelephone}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer progression */}
      <div className="px-5 py-4 border-t shrink-0 space-y-3 bg-muted/20">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Messages envoyés</span>
            <span className={cn("font-medium", tousEnvoyes ? "text-green-600" : "")}>
              {nbEnvoyes} / {nbTotal}
            </span>
          </div>
          <Progress
            value={progressPct}
            className={cn("h-2", tousEnvoyes ? "[&>div]:bg-green-500" : "")}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            {tousEnvoyes
              ? "Tous les messages ont été envoyés."
              : instanceNom
                ? "Cliquez sur Terminer pour envoyer et fermer."
                : "Envoyez manuellement puis fermez."}
          </p>
          <Button
            onClick={handleTerminer}
            disabled={envoyantTout}
            className={cn("shrink-0", tousEnvoyes ? "bg-green-600 hover:bg-green-700" : "")}
          >
            {envoyantTout ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours…</>
            ) : (
              <><CheckCheck className="mr-2 h-4 w-4" />{tousEnvoyes ? "Terminer" : `Envoyer et terminer (${nbRestants})`}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────

export function WhatsAppSendPanel({
  open, demandes, onOpenChange, onClose,
  devisReference, devisDescription, nomEntreprise, nomDemandeur, telephoneEntreprise,
}: WhatsAppSendPanelProps) {
  const [etape, setEtape] = useState<Etape>("preview")
  const { getById } = useWhatsAppMessagesPredefinis(undefined, false)
  const { comptes } = useWhatsAppComptes()
  const instanceActive = comptes.find(c => c.connecte) ?? null
  const [template, setTemplate] = useState<WhatsAppMessagePredefini | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [templateErreur, setTemplateErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setEtape("preview")
    if (template) return
    setTemplateLoading(true)
    setTemplateErreur(null)
    getById(2)
      .then(tpl => {
        if (tpl) setTemplate(tpl)
        else setTemplateErreur("Modèle introuvable (id=2)")
      })
      .catch((e: any) => setTemplateErreur(e?.message ?? "Erreur lors du chargement du modèle"))
      .finally(() => setTemplateLoading(false))
  }, [open])

  const pret = !!template && demandes.length > 0
  const titre = etape === "preview" ? "Aperçu du message" : "Envoi WhatsApp"

  return (
    <Dialog open={open} onOpenChange={v => { if (v === false) onOpenChange(false) }}>
      <DialogContent aria-describedby={undefined} className="w-full max-w-full sm:max-w-lg md:max-w-2xl max-h-screen sm:max-h-[92vh] flex flex-col p-0 gap-0">

        {/* En-tête */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
              <div className="rounded-full bg-[#25D366]/15 p-2 shrink-0">
                <MessageSquare className="h-5 w-5 text-[#25D366]" />
              </div>
              <div>
                <span>{titre}</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {demandes.length} fournisseur{demandes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </DialogTitle>
            <EtapeIndicator etape={etape} />
          </div>
        </DialogHeader>

        {/* Contenu selon l'étape */}
        <div className="flex flex-col flex-1 min-h-0">
          {etape === "preview" ? (
            !pret ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground py-10">
                {templateErreur ? (
                  <Alert variant="destructive" className="mx-5 w-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{templateErreur}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Chargement du modèle…</p>
                  </>
                )}
              </div>
            ) : (
              <EtapePreview
                key={demandes[0].id}
                template={template!}
                demandes={demandes}
                onContinuer={() => setEtape("envoi")}
                devisReference={devisReference}
                devisDescription={devisDescription}
                nomEntreprise={nomEntreprise}
                nomDemandeur={nomDemandeur}
                telephoneEntreprise={telephoneEntreprise}
              />
            )
          ) : (
            <EtapeEnvoi
              demandes={demandes}
              onClose={onClose}
              instanceNom={instanceActive?.nomInstance ?? null}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
