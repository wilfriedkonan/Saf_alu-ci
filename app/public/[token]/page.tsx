"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Loader2, CheckCircle2, XCircle, Clock, ChevronRight,
  AlertTriangle, Send, Shield, Building2, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiPublic } from "@/services/devisFournisseurService"

// ============================================================
// TYPES LOCAUX
// ============================================================

interface LignePublique {
  id: number
  sectionId?: number
  ordre: number
  designation: string
  description?: string
  unite?: string
  quantite: number
  typeElement?: string
  dimensionL?: number
  dimensionH?: number
  prixUnitaireSaisi?: number
  commentaireSaisi?: string
}

interface SectionPublique {
  id: number
  ordre: number
  titre: string
  description?: string
  lignes: LignePublique[]
}

interface DevisPublique {
  id: number
  reference: string
  typeDevis: "Classique" | "Technique"
  titre: string
  description?: string
  dateLimiteReponse: string
  fournisseurNom: string
  dejaRepondu: boolean
  sections: SectionPublique[]
  lignes: LignePublique[]
}

interface LigneReponse {
  ligneId: number
  prixUnitaire: number
  commentaire?: string
}

// ============================================================
// ÉTAPES
// ============================================================

type Etape = "chargement" | "otp" | "formulaire" | "confirmation" | "erreur"

// ============================================================
// COMPOSANTS UTILITAIRES
// ============================================================

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="font-bold text-base tracking-tight text-foreground">SAF-ALU</span>
    </div>
  )
}

function StepIndicator({ etape }: { etape: Etape }) {
  const steps = [
    { id: "otp",          label: "Vérification" },
    { id: "formulaire",   label: "Vos prix" },
    { id: "confirmation", label: "Envoyé" },
  ]
  const activeIndex = steps.findIndex(s => s.id === etape)
  if (activeIndex < 0) return null

  return (
    <div className="flex items-center gap-0 w-full max-w-xs mx-auto">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              idx < activeIndex
                ? "bg-primary text-primary-foreground"
                : idx === activeIndex
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
            )}>
              {idx < activeIndex ? <Check className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            <span className={cn(
              "text-[10px] mt-1 font-medium",
              idx === activeIndex ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn(
              "h-px flex-1 -mt-4 transition-all",
              idx < activeIndex ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// ÉTAPE 1 — SAISIE OTP
// ============================================================

function EtapeOtp({
  token, devis, onSuccess,
}: {
  token: string
  devis: DevisPublique
  onSuccess: () => void
}) {
  const [digits, setDigits]   = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [shake, setShake]     = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1)
    const next  = [...digits]
    next[idx]   = clean
    setDigits(next)
    setError(null)
    if (clean && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(""))
      inputs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleSubmit = async () => {
    const otp = digits.join("")
    if (otp.length < 6) return
    setLoading(true); setError(null)
    try {
      await apiPublic(`${token}/valider-otp`, {
        method: "POST",
        body: JSON.stringify({ otp }),
      })
      onSuccess()
    } catch (e: any) {
      setError(e.message)
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setDigits(["", "", "", "", "", ""])
      inputs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const isComplete = digits.every(d => d !== "")

  useEffect(() => { inputs.current[0]?.focus() }, [])

  return (
    <div className="space-y-6">
      {/* Infos devis */}
      <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{devis.reference}</p>
        <p className="font-bold text-lg text-foreground leading-snug">{devis.titre}</p>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Délai : {new Date(devis.dateLimiteReponse).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </span>
        </div>
      </div>

      {/* OTP */}
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-bold text-xl text-foreground">Code de vérification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Saisissez le code à 6 chiffres<br />reçu dans votre message WhatsApp
          </p>
        </div>

        {/* Boîtes OTP */}
        <div
          className={cn("flex gap-2.5 justify-center", shake && "animate-[shake_0.4s_ease-in-out]")}
          style={{ animation: shake ? "shake 0.4s cubic-bezier(.36,.07,.19,.97)" : undefined }}
        >
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={el => { inputs.current[idx] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={cn(
                "w-11 h-14 text-center text-2xl font-bold rounded-lg border-2 outline-none transition-all duration-150 bg-background",
                d
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground",
                "focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
            />
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Bouton */}
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          className="w-full h-12 text-base"
          size="lg"
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <><span>Valider</span><ChevronRight className="w-4 h-4 ml-1" /></>
          }
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// ÉTAPE 2 — FORMULAIRE DE PRIX
// ============================================================

function LigneInput({
  ligne, value, commentaire, onChange, onCommentaireChange, isTechnique,
}: {
  ligne: LignePublique
  value: string
  commentaire: string
  onChange: (v: string) => void
  onCommentaireChange: (v: string) => void
  isTechnique: boolean
}) {
  const surface = ligne.dimensionL && ligne.dimensionH
    ? (ligne.dimensionL * ligne.dimensionH).toFixed(2)
    : null

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* En-tête ligne */}
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground leading-snug">{ligne.designation}</p>
            {ligne.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ligne.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs font-normal">
                Qté : {ligne.quantite} {ligne.unite ?? ""}
              </Badge>
              {isTechnique && ligne.typeElement && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {ligne.typeElement}
                </Badge>
              )}
              {surface && (
                <Badge className="text-xs font-normal bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                  {ligne.dimensionL}×{ligne.dimensionH}m = {surface}m²
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        {/* Prix unitaire */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground shrink-0 w-24">Prix unitaire</label>
          <div className="flex-1 relative">
            <input
              type="number"
              min="0"
              step="100"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="0"
              className={cn(
                "w-full h-10 pl-3 pr-14 rounded-lg border-2 text-right font-bold text-foreground",
                "outline-none transition-all text-base bg-background",
                value ? "border-primary bg-primary/5" : "border-border",
                "focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
              FCFA
            </span>
          </div>
        </div>

        {/* Montant total calculé */}
        {value && parseFloat(value) > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">Total ({ligne.quantite} {ligne.unite ?? "u."})</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-400">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency", currency: "XOF", minimumFractionDigits: 0
              }).format(parseFloat(value) * ligne.quantite)}
            </span>
          </div>
        )}

        {/* Commentaire */}
        <input
          type="text"
          value={commentaire}
          onChange={e => onCommentaireChange(e.target.value)}
          placeholder="Remarque (optionnel)"
          className="w-full h-9 px-3 rounded-lg border border-border text-xs text-foreground bg-background outline-none focus:border-primary/50 placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}

function EtapeFormulaire({
  token, devis, onSuccess,
}: {
  token: string
  devis: DevisPublique
  onSuccess: () => void
}) {
  const allLignes = devis.typeDevis === "Classique"
    ? devis.lignes
    : devis.sections.flatMap(s => s.lignes)

  const [prix, setPrix] = useState<Record<number, string>>(() =>
    Object.fromEntries(allLignes.map(l => [l.id, l.prixUnitaireSaisi ? String(l.prixUnitaireSaisi) : ""]))
  )
  const [commentaires, setCommentaires] = useState<Record<number, string>>(() =>
    Object.fromEntries(allLignes.map(l => [l.id, l.commentaireSaisi ?? ""]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const nbRemplis  = allLignes.filter(l => prix[l.id] && parseFloat(prix[l.id]) > 0).length
  const total      = allLignes.reduce((sum, l) => sum + (parseFloat(prix[l.id] || "0") * l.quantite), 0)
  const progressPct = allLignes.length > 0 ? Math.round((nbRemplis / allLignes.length) * 100) : 0

  const handleSubmit = async () => {
    const reponses: LigneReponse[] = allLignes
      .filter(l => prix[l.id])
      .map(l => ({
        ligneId: l.id,
        prixUnitaire: parseFloat(prix[l.id]) || 0,
        commentaire: commentaires[l.id] || undefined,
      }))

    if (reponses.length === 0) {
      setError("Renseignez au moins un prix avant de soumettre."); return
    }
    setLoading(true); setError(null)
    try {
      await apiPublic(`${token}/soumettre`, {
        method: "POST",
        body: JSON.stringify({ reponses }),
      })
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const renderLigne = (ligne: LignePublique) => (
    <LigneInput
      key={ligne.id}
      ligne={ligne}
      value={prix[ligne.id] ?? ""}
      commentaire={commentaires[ligne.id] ?? ""}
      onChange={v => setPrix(p => ({ ...p, [ligne.id]: v }))}
      onCommentaireChange={v => setCommentaires(c => ({ ...c, [ligne.id]: v }))}
      isTechnique={devis.typeDevis === "Technique"}
    />
  )

  return (
    <div className="space-y-5">
      {/* Résumé devis */}
      <div className="rounded-lg bg-primary text-primary-foreground p-5 space-y-1">
        <p className="text-xs font-mono text-primary-foreground/60 uppercase tracking-wider">{devis.reference}</p>
        <p className="font-bold text-lg leading-snug">{devis.titre}</p>
        <p className="text-sm text-primary-foreground/80">
          Bonjour <strong>{devis.fournisseurNom}</strong>, renseignez vos prix ci-dessous.
        </p>
      </div>

      {/* Barre de progression */}
      <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{nbRemplis}/{allLignes.length} lignes renseignées</span>
          {total > 0 && (
            <span className="font-bold text-foreground">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(total)}
            </span>
          )}
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Classique — liste plate */}
      {devis.typeDevis === "Classique" && (
        <div className="space-y-3">
          {devis.lignes.sort((a, b) => a.ordre - b.ordre).map(renderLigne)}
        </div>
      )}

      {/* Technique — sections */}
      {devis.typeDevis === "Technique" && (
        <div className="space-y-5">
          {devis.sections.sort((a, b) => a.ordre - b.ordre).map(section => (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-accent" />
                <div>
                  <p className="font-bold text-sm text-foreground">{section.titre}</p>
                  {section.description && (
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  )}
                </div>
              </div>
              {section.lignes.sort((a, b) => a.ordre - b.ordre).map(renderLigne)}
            </div>
          ))}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Total récap */}
      {total > 0 && (
        <div className="rounded-lg border-2 border-primary p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Montant total estimé</p>
            <p className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(total)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-right max-w-[120px]">
            Hors remises négociées
          </p>
        </div>
      )}

      {/* Soumettre */}
      <Button
        onClick={handleSubmit}
        disabled={loading || nbRemplis === 0}
        className="w-full h-12 text-base gap-2"
        size="lg"
      >
        {loading
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : <><Send className="w-4 h-4" /><span>Envoyer mon offre</span></>
        }
      </Button>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Vous pouvez soumettre partiellement et compléter plus tard tant que le délai n'est pas dépassé.
      </p>
    </div>
  )
}

// ============================================================
// ÉTAPE 3 — CONFIRMATION
// ============================================================

function EtapeConfirmation({ devis }: { devis: DevisPublique }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      {/* Animation check */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Offre envoyée !</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          Vos prix ont été transmis à <strong>SAF-ALU</strong> pour le devis{" "}
          <span className="font-mono font-semibold text-foreground">{devis.reference}</span>.
        </p>
      </div>

      <div className="w-full rounded-lg bg-muted/50 border border-border p-5 text-left space-y-3">
        <p className="font-semibold text-sm text-foreground">Prochaines étapes</p>
        {[
          "SAF-ALU analysera votre offre avec celles des autres fournisseurs",
          "Vous serez contacté si votre offre est retenue",
          "En cas de question, vous pouvez rouvrir ce lien pour modifier vos prix",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-primary-foreground">{i + 1}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-snug">{step}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground pb-4">
        Ce lien reste valide jusqu'au{" "}
        {new Date(devis.dateLimiteReponse).toLocaleDateString("fr-FR", {
          day: "numeric", month: "long", year: "numeric"
        })}
      </p>
    </div>
  )
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function DevisFournisseurPublicPage() {
  const params  = useParams()
  const token   = params.token as string

  const [etape, setEtape]   = useState<Etape>("chargement")
  const [devis, setDevis]   = useState<DevisPublique | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const chargerDevis = useCallback(async () => {
    if (!token) return
    try {
      const data = await apiPublic<DevisPublique>(token)
      setDevis(data)
      setEtape(data.dejaRepondu ? "confirmation" : "otp")
    } catch (e: any) {
      setErreur(e.message)
      setEtape("erreur")
    }
  }, [token])

  useEffect(() => { chargerDevis() }, [chargerDevis])

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>

      <div className="min-h-screen bg-background flex flex-col">

        {/* Barre supérieure */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
            <Logo />
            {etape !== "chargement" && etape !== "erreur" && (
              <div className="scale-90 origin-right">
                <StepIndicator etape={etape} />
              </div>
            )}
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 max-w-lg mx-auto w-full px-5 py-8">

          {/* Chargement */}
          {etape === "chargement" && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Chargement du devis…</p>
            </div>
          )}

          {/* Erreur */}
          {etape === "erreur" && (
            <div className="flex flex-col items-center text-center space-y-5 py-12">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Lien inaccessible</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{erreur}</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-5 text-left space-y-2 w-full">
                <p className="text-sm font-semibold text-foreground">Que faire ?</p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    Vérifiez que vous utilisez le lien exact reçu par WhatsApp
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    Le lien a peut-être expiré — contactez votre interlocuteur SAF-ALU
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* OTP */}
          {etape === "otp" && devis && (
            <EtapeOtp
              token={token}
              devis={devis}
              onSuccess={() => setEtape("formulaire")}
            />
          )}

          {/* Formulaire */}
          {etape === "formulaire" && devis && (
            <EtapeFormulaire
              token={token}
              devis={devis}
              onSuccess={() => setEtape("confirmation")}
            />
          )}

          {/* Confirmation */}
          {etape === "confirmation" && devis && (
            <EtapeConfirmation devis={devis} />
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-5 text-xs text-muted-foreground border-t border-border">
          <p>© {new Date().getFullYear()} SAF-ALU CI — Plateforme de gestion</p>
        </footer>
      </div>
    </>
  )
}
