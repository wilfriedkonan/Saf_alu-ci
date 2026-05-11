"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  CalendarIcon, Loader2, Plus, Trash2, Layers, FileText,
  ChevronDown, ChevronUp, GripVertical, Settings2, Hash,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DevisFournisseurService } from "@/services/devisFournisseurService"
import type { TypeDevis, CreateLigneRequest, CreateSectionRequest } from "@/types/devis-fournisseur"

// ── Interfaces internes ───────────────────────────────────────

interface LigneForm extends CreateLigneRequest { _key: string }
interface SectionForm extends CreateSectionRequest { _key: string; lignes: LigneForm[]; collapsed?: boolean }

const emptyLigne = (ordre = 1): LigneForm => ({
  _key: Math.random().toString(36).slice(2),
  designation: "", description: "", unite: "", quantite: 1,
  sectionId: undefined, ordre,
  typeElement: "", dimensionL: undefined, dimensionH: undefined,
  remiseLignePct: 0, remiseLigneValeur: 0,
})

const emptySection = (ordre = 1): SectionForm => ({
  _key: Math.random().toString(36).slice(2),
  titre: "", description: "", ordre,
  remiseSectionPct: 0, remiseSectionValeur: 0,
  lignes: [emptyLigne(1)],
  collapsed: false,
})

// ── Indicateur de progression ─────────────────────────────────

function StepIndicator({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              i < step
                ? "bg-primary text-primary-foreground"
                : i === step
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
            )}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={cn(
              "text-xs font-medium hidden sm:block",
              i === step ? "text-foreground" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
          {i < total - 1 && (
            <div className={cn(
              "h-px w-6 sm:w-10 mx-1.5",
              i < step ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// MODAL PRINCIPALE
// ============================================================

export function DevisFormModal({
  open, onOpenChange, onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: (id: number) => void
}) {
  const [step, setStep] = useState(0)          // 0=Type, 1=Infos, 2=Lignes
  const [loading, setLoading] = useState(false)
  const [typeDevis, setTypeDevis] = useState<TypeDevis>("Classique")
  const [titre, setTitre] = useState("")
  const [description, setDescription] = useState("")
  const [dateLimite, setDateLimite] = useState<Date>()
  const [remisePct, setRemisePct] = useState(0)
  const [remiseValeur, setRemiseValeur] = useState(0)
  const [lignes, setLignes] = useState<LigneForm[]>([emptyLigne()])
  const [sections, setSections] = useState<SectionForm[]>([emptySection()])

  // ── Lignes (Classique) ──────────────────────────────────────
  const addLigne = () => setLignes(prev => [...prev, emptyLigne(prev.length + 1)])
  const removeLigne = (key: string) => setLignes(prev => prev.filter(l => l._key !== key))
  const updateLigne = (key: string, field: keyof LigneForm, value: any) =>
    setLignes(prev => prev.map(l => l._key === key ? { ...l, [field]: value } : l))

  // ── Sections (Technique) ────────────────────────────────────
  const addSection = () => setSections(prev => [...prev, emptySection(prev.length + 1)])
  const removeSection = (key: string) => setSections(prev => prev.filter(s => s._key !== key))
  const updateSection = (key: string, field: keyof SectionForm, value: any) =>
    setSections(prev => prev.map(s => s._key === key ? { ...s, [field]: value } : s))
  const toggleSectionCollapsed = (key: string) =>
    setSections(prev => prev.map(s => s._key === key ? { ...s, collapsed: !s.collapsed } : s))

  const addLigneSection = (sk: string) =>
    setSections(prev => prev.map(s => s._key === sk
      ? { ...s, lignes: [...s.lignes, emptyLigne(s.lignes.length + 1)] } : s))
  const removeLigneSection = (sk: string, lk: string) =>
    setSections(prev => prev.map(s => s._key === sk
      ? { ...s, lignes: s.lignes.filter(l => l._key !== lk) } : s))
  const updateLigneSection = (sk: string, lk: string, field: keyof LigneForm, value: any) =>
    setSections(prev => prev.map(s => s._key === sk
      ? { ...s, lignes: s.lignes.map(l => l._key === lk ? { ...l, [field]: value } : l) } : s))

  // ── Navigation entre étapes ─────────────────────────────────
  const handleNext = () => {
    if (step === 1 && (!titre.trim() || !dateLimite)) {
      toast({ title: "Remplissez le titre et la date limite", variant: "destructive" }); return
    }
    setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  // ── Soumission ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!titre.trim() || !dateLimite) {
      toast({ title: "Champs requis manquants", variant: "destructive" }); return
    }
    setLoading(true)
    try {
      const sectionsData: CreateSectionRequest[] = typeDevis === "Technique"
        ? sections.map(({ _key, lignes: _, collapsed, ...s }) => s) : []

      const lignesData: CreateLigneRequest[] = typeDevis === "Classique"
        ? lignes.map(({ _key, ...l }) => l)
        : sections.flatMap(s => s.lignes.map(({ _key, ...l }) => l))

      const res = await DevisFournisseurService.create({
        typeDevis, titre, description: description || undefined,
        dateLimiteReponse: dateLimite.toISOString(),
        remiseGlobalePct: remisePct, remiseGlobaleValeur: remiseValeur,
        sections: sectionsData, lignes: lignesData,
      })
      toast({ title: "Devis créé avec succès" })
      onSuccess(res.id)
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  const handleClose = () => { setStep(0); onOpenChange(false) }

  const totalLignes = typeDevis === "Classique"
    ? lignes.length
    : sections.reduce((acc, s) => acc + s.lignes.length, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-full sm:max-w-2xl md:max-w-4xl max-h-screen sm:max-h-[92vh] flex flex-col p-0 gap-0">

        {/* ── En-tête ───────────────────────────────────────── */}
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg sm:text-xl">
              Nouveau devis fournisseur
            </DialogTitle>
            {step > 0 && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {typeDevis}
              </Badge>
            )}
          </div>
          <div className="mt-3">
            <StepIndicator
              step={step}
              total={3}
              labels={["Type", "Informations", "Contenu"]}
            />
          </div>
        </DialogHeader>

        {/* ── Contenu scrollable ────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 sm:px-6 py-5 space-y-5">

            {/* ═══════ ÉTAPE 0 — Choix du type ═══════ */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choisissez le type de devis adapté à votre besoin.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["Classique", "Technique"] as TypeDevis[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeDevis(t)}
                      className={cn(
                        "rounded-xl border-2 p-5 text-left transition-all hover:border-primary/60",
                        typeDevis === t
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-muted bg-muted/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        t === "Classique" ? "bg-blue-100" : "bg-purple-100"
                      )}>
                        {t === "Classique"
                          ? <FileText className="h-5 w-5 text-blue-600" />
                          : <Layers className="h-5 w-5 text-purple-600" />
                        }
                      </div>
                      <p className="font-semibold text-base">{t}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {t === "Classique"
                          ? "Liste simple de lignes avec désignation, quantité et unité. Idéal pour les fournitures standard."
                          : "Organisé en sections avec dimensions L×H, type d'élément et spécifications techniques détaillées."
                        }
                      </p>
                      {typeDevis === t && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          Sélectionné
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════ ÉTAPE 1 — Informations ═══════ */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Titre */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Titre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={titre}
                    onChange={e => setTitre(e.target.value)}
                    placeholder="Ex: Fourniture menuiseries aluminium bâtiment A"
                    className={cn(!titre.trim() && titre !== "" && "border-red-300 focus-visible:ring-red-300")}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Contexte, précisions, conditions particulières..."
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{description.length} caractères</p>
                </div>

                <Separator />

                {/* Date + remises */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Settings2 className="h-3.5 w-3.5" />
                    Paramètres
                  </h4>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Date limite de réponse <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full sm:w-auto justify-start min-w-[200px]",
                            !dateLimite && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          {dateLimite
                            ? format(dateLimite, "EEEE d MMMM yyyy", { locale: fr })
                            : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateLimite}
                          onSelect={setDateLimite}
                          disabled={d => d < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Remise globale (%)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={remisePct || ""}
                          onChange={e => setRemisePct(+e.target.value)}
                          placeholder="0"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Remise fixe (FCFA)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={remiseValeur || ""}
                        onChange={e => setRemiseValeur(+e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ ÉTAPE 2 — Lignes / Sections ═══════ */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-semibold text-sm">
                      {typeDevis === "Classique" ? "Lignes du devis" : "Sections & lignes"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {typeDevis === "Classique"
                        ? `${lignes.length} ligne${lignes.length > 1 ? "s" : ""}`
                        : `${sections.length} section${sections.length > 1 ? "s" : ""} · ${totalLignes} ligne${totalLignes > 1 ? "s" : ""}`
                      }
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={typeDevis === "Classique" ? addLigne : addSection}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {typeDevis === "Classique" ? "Ajouter une ligne" : "Ajouter une section"}
                  </Button>
                </div>

                {/* ── Classique : liste de lignes ── */}
                {typeDevis === "Classique" && (
                  <div className="space-y-2">
                    {lignes.map((ligne, idx) => (
                      <LigneEditor
                        key={ligne._key}
                        ligne={ligne}
                        index={idx}
                        isTechnique={false}
                        onChange={(f, v) => updateLigne(ligne._key, f, v)}
                        onRemove={() => removeLigne(ligne._key)}
                        canRemove={lignes.length > 1}
                      />
                    ))}
                  </div>
                )}

                {/* ── Technique : sections collapsibles ── */}
                {typeDevis === "Technique" && (
                  <div className="space-y-3">
                    {sections.map((section, sidx) => (
                      <div key={section._key} className="border rounded-xl overflow-hidden bg-background">
                        {/* Header section */}
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-muted/30 border-b">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {sidx + 1}
                          </div>
                          <Input
                            value={section.titre}
                            onChange={e => updateSection(section._key, "titre", e.target.value)}
                            placeholder={`Titre de la section ${sidx + 1}...`}
                            className="flex-1 h-8 border-0 shadow-none focus-visible:ring-0 bg-transparent font-medium text-sm min-w-0"
                          />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                              <Input
                                type="number"
                                value={section.remiseSectionPct || ""}
                                onChange={e => updateSection(section._key, "remiseSectionPct", +e.target.value)}
                                className="w-14 h-7 text-xs text-center"
                                placeholder="0"
                              />
                              <span>%</span>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {section.lignes.length} ligne{section.lignes.length > 1 ? "s" : ""}
                            </Badge>
                            {sections.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:bg-red-50"
                                onClick={() => removeSection(section._key)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleSectionCollapsed(section._key)}
                            >
                              {section.collapsed
                                ? <ChevronDown className="h-3.5 w-3.5" />
                                : <ChevronUp className="h-3.5 w-3.5" />
                              }
                            </Button>
                          </div>
                        </div>

                        {/* Remise sur mobile */}
                        {!section.collapsed && (
                          <div className="sm:hidden px-4 pt-3 pb-0 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Remise section :</span>
                            <Input
                              type="number"
                              value={section.remiseSectionPct || ""}
                              onChange={e => updateSection(section._key, "remiseSectionPct", +e.target.value)}
                              className="w-16 h-7 text-xs text-center"
                              placeholder="0"
                            />
                            <span>%</span>
                          </div>
                        )}

                        {/* Lignes de la section */}
                        {!section.collapsed && (
                          <div className="p-3 space-y-2">
                            {/* Zone scrollable des lignes */}
                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                              {section.lignes.map((ligne, lidx) => (
                                <LigneEditor
                                  key={ligne._key}
                                  ligne={ligne}
                                  index={lidx}
                                  isTechnique={true}
                                  onChange={(f, v) => updateLigneSection(section._key, ligne._key, f, v)}
                                  onRemove={() => removeLigneSection(section._key, ligne._key)}
                                  canRemove={section.lignes.length > 1}
                                />
                              ))}
                            </div>
                            {/* Bouton toujours visible sous la liste */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs h-8 border border-dashed hover:border-primary/50 hover:bg-primary/5"
                              onClick={() => addLigneSection(section._key)}
                            >
                              <Plus className="h-3 w-3 mr-1.5" />Ajouter une ligne
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </ScrollArea>
        </div>

        {/* ── Pied de page ─────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 border-t bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={step === 0 ? handleClose : handleBack}
            >
              {step === 0 ? "Annuler" : "← Retour"}
            </Button>

            <div className="flex items-center gap-2">
              {/* Indicateur mobile */}
              <span className="text-xs text-muted-foreground sm:hidden">
                {step + 1} / 3
              </span>

              {step < 2 ? (
                <Button onClick={handleNext}>
                  Suivant →
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</>
                    : "Créer le devis"
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// ÉDITEUR DE LIGNE
// ============================================================

function LigneEditor({ ligne, index, isTechnique, onChange, onRemove, canRemove }: {
  ligne: CreateLigneRequest & { _key: string }
  index: number
  isTechnique: boolean
  onChange: (field: any, value: any) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = !!(ligne.description || ligne.typeElement || ligne.dimensionL || ligne.dimensionH
    || ligne.remiseLignePct || ligne.remiseLigneValeur)

  return (
    <div className={cn(
      "border rounded-lg bg-background transition-shadow",
      expanded && "shadow-sm border-primary/30"
    )}>
      {/* ── Ligne principale ── */}
      <div className="flex items-center gap-2 p-2">
        {/* Numéro */}
        <div className="flex items-center justify-center w-6 h-6 rounded text-xs text-muted-foreground bg-muted shrink-0 font-medium">
          {index + 1}
        </div>

        {/* Désignation */}
        <Input
          value={ligne.designation}
          onChange={e => onChange("designation", e.target.value)}
          placeholder="Désignation *"
          className="flex-1 h-8 text-sm min-w-0"
        />

        {/* Unité — masqué sur très petit écran */}
        <Input
          value={ligne.unite ?? ""}
          onChange={e => onChange("unite", e.target.value)}
          placeholder="U."
          className="w-14 h-8 text-sm text-center hidden xs:block sm:block shrink-0"
        />

        {/* Quantité */}
        <Input
          type="number"
          min={0}
          value={ligne.quantite}
          onChange={e => onChange("quantite", +e.target.value)}
          placeholder="Qté"
          className="w-16 sm:w-20 h-8 text-sm text-center shrink-0"
        />

        {/* Expand */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 shrink-0",
            hasDetails && !expanded && "text-primary"
          )}
          title={expanded ? "Réduire" : "Options supplémentaires"}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? <ChevronUp className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />
          }
        </Button>

        {/* Supprimer */}
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* ── Zone expansible ── */}
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t space-y-3 bg-muted/10">
          {/* Unité (visible ici sur mobile) */}
          <div className="flex items-center gap-2 sm:hidden">
            <Label className="text-xs shrink-0 w-16">Unité</Label>
            <Input
              value={ligne.unite ?? ""}
              onChange={e => onChange("unite", e.target.value)}
              placeholder="m², ml, u…"
              className="h-8 text-sm flex-1"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description / notes</Label>
            <Textarea
              value={ligne.description ?? ""}
              onChange={e => onChange("description", e.target.value)}
              placeholder="Notes, précisions techniques..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Champs techniques */}
          {isTechnique && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />Spécifications techniques
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={ligne.typeElement ?? ""}
                  onChange={e => onChange("typeElement", e.target.value)}
                  placeholder="Type d'élément"
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  value={ligne.dimensionL ?? ""}
                  onChange={e => onChange("dimensionL", +e.target.value || undefined)}
                  placeholder="Largeur L (m)"
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  value={ligne.dimensionH ?? ""}
                  onChange={e => onChange("dimensionH", +e.target.value || undefined)}
                  placeholder="Hauteur H (m)"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Remises */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Remises sur cette ligne</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  value={ligne.remiseLignePct || ""}
                  onChange={e => onChange("remiseLignePct", +e.target.value)}
                  placeholder="0"
                  className="h-8 text-xs pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
              <Input
                type="number"
                value={ligne.remiseLigneValeur || ""}
                onChange={e => onChange("remiseLigneValeur", +e.target.value)}
                placeholder="Remise FCFA"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
