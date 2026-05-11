"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Wifi,
  WifiOff,
  Phone,
  Building2,
  MessageSquare,
  Eye,
  Filter,
  Copy,
  CheckCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react"
import {
  useWhatsAppComptes,
  useWhatsAppMessageTypes,
  useWhatsAppMessagesPredefinis,
} from "@/hooks/useWhatsappParametres"
import { useWhatsappInstances } from "@/hooks/useWhatsapp"
import type {
  WhatsAppCompte,
  WhatsAppMessagePredefini,
  CreateWhatsAppCompteRequest,
  UpdateWhatsAppCompteRequest,
  CreateWhatsAppMessagePredefiniRequest,
  UpdateWhatsAppMessagePredefiniRequest,
} from "@/types/whatsappParametres"
import type { QrCodeResponse } from "@/types/whatsapp"

// ============================================================
// TYPES LOCAUX
// ============================================================

type CompteFormMode = { mode: "create" } | { mode: "edit"; compte: WhatsAppCompte }
type MessageFormMode = { mode: "create" } | { mode: "edit"; message: WhatsAppMessagePredefini }

// ============================================================
// MODAL — FORMULAIRE COMPTE
// ============================================================

function CompteFormModal({
  open,
  formMode,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  formMode: CompteFormMode
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const { createCompte, updateCompte, loading } = useWhatsAppComptes()
  const isEdit = formMode.mode === "edit"
  const initial = isEdit ? formMode.compte : null

  const [form, setForm] = useState({
    nomInstance:     initial?.nomInstance     ?? "",
    nomAffichage:    initial?.nomAffichage    ?? "",
    numeroTelephone: initial?.numeroTelephone ?? "",
    description:     initial?.description    ?? "",
    service:         initial?.service        ?? "",
  })

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setForm({
        nomInstance:     initial?.nomInstance     ?? "",
        nomAffichage:    initial?.nomAffichage    ?? "",
        numeroTelephone: initial?.numeroTelephone ?? "",
        description:     initial?.description    ?? "",
        service:         initial?.service        ?? "",
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = async () => {
    if (!form.nomInstance.trim() || !form.nomAffichage.trim() || !form.numeroTelephone.trim()) {
      toast({ title: "Champs requis manquants", variant: "destructive" })
      return
    }

    try {
      if (isEdit) {
        const payload: UpdateWhatsAppCompteRequest = {
          nomAffichage:    form.nomAffichage,
          numeroTelephone: form.numeroTelephone,
          description:     form.description  || undefined,
          service:         form.service      || undefined,
        }
        await updateCompte(formMode.compte.id, payload)
        toast({ title: "Compte mis à jour avec succès" })
      } else {
        const payload: CreateWhatsAppCompteRequest = {
          nomInstance:     form.nomInstance,
          nomAffichage:    form.nomAffichage,
          numeroTelephone: form.numeroTelephone,
          description:     form.description  || undefined,
          service:         form.service      || undefined,
        }
        await createCompte(payload)
        toast({ title: "Compte créé avec succès" })
      }
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le compte" : "Nouveau compte WhatsApp"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Nom d'instance <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: SAF-ALU-COMMERCIAL"
                value={form.nomInstance}
                onChange={e => setForm(f => ({ ...f, nomInstance: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Identifiant unique, non modifiable après création.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Nom d'affichage <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ex: SAF-ALU Commercial"
              value={form.nomAffichage}
              onChange={e => setForm(f => ({ ...f, nomAffichage: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Numéro de téléphone <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ex: 2250708214625"
              value={form.numeroTelephone}
              onChange={e => setForm(f => ({ ...f, numeroTelephone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Input
                placeholder="Ex: Commercial"
                value={form.service}
                onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Description courte"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// MODAL — FORMULAIRE MESSAGE PRÉDÉFINI
// ============================================================

function MessageFormModal({
  open,
  formMode,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  formMode: MessageFormMode
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const { createMessage, updateMessage, loading } = useWhatsAppMessagesPredefinis()
  const { messageTypes } = useWhatsAppMessageTypes()
  const isEdit = formMode.mode === "edit"
  const initial = isEdit ? formMode.message : null

  const [form, setForm] = useState({
    idType:    initial?.idType    ?? 0,
    titre:     initial?.titre     ?? "",
    contenu:   initial?.contenu   ?? "",
    variables: initial?.variables ?? "",
    actif:     initial?.actif     ?? true,
  })

  // Extraire les variables détectées automatiquement depuis le contenu
  const variablesDetectees = useMemo(() => {
    const matches = form.contenu.match(/\{([A-Z_]+)\}/g) ?? []
    return [...new Set(matches.map(m => m.slice(1, -1)))]
  }, [form.contenu])

  // Synchroniser les variables détectées dans le champ Variables
  const syncVariables = () => {
    setForm(f => ({
      ...f,
      variables: variablesDetectees.map(v => `{${v}}`).join(","),
    }))
  }

  const handleSubmit = async () => {
    if (!form.idType || !form.titre.trim() || !form.contenu.trim()) {
      toast({ title: "Champs requis manquants", variant: "destructive" })
      return
    }
    try {
      if (isEdit) {
        const payload: UpdateWhatsAppMessagePredefiniRequest = {
          titre:     form.titre,
          contenu:   form.contenu,
          variables: form.variables || undefined,
          actif:     form.actif,
        }
        await updateMessage(formMode.message.id, payload)
        toast({ title: "Message mis à jour avec succès" })
      } else {
        const payload: CreateWhatsAppMessagePredefiniRequest = {
          idType:    form.idType,
          titre:     form.titre,
          contenu:   form.contenu,
          variables: form.variables || undefined,
        }
        await createMessage(payload)
        toast({ title: "Message créé avec succès" })
      }
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le message" : "Nouveau message prédéfini"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type de message <span className="text-red-500">*</span></Label>
            <Select
              value={form.idType.toString()}
              onValueChange={v => setForm(f => ({ ...f, idType: Number(v) }))}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEdit && (
              <p className="text-xs text-muted-foreground">Le type n'est pas modifiable.</p>
            )}
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label>Titre <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ex: Bienvenue nouveau collaborateur"
              value={form.titre}
              onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            />
          </div>

          {/* Contenu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Contenu <span className="text-red-500">*</span></Label>
              <span className="text-xs text-muted-foreground">
                Utilisez <code className="bg-muted px-1 rounded text-xs">{"{NOM_VARIABLE}"}</code> pour les variables
              </span>
            </div>
            <Textarea
              placeholder="Rédigez votre message ici..."
              rows={8}
              className="font-mono text-sm"
              value={form.contenu}
              onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
            />
          </div>

          {/* Variables détectées automatiquement */}
          {variablesDetectees.length > 0 && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-blue-800 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Variables détectées dans le contenu
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-700 hover:text-blue-900"
                  onClick={syncVariables}
                >
                  Synchroniser
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {variablesDetectees.map(v => (
                  <Badge key={v} variant="secondary" className="text-xs font-mono bg-blue-100 text-blue-800">
                    {"{" + v + "}"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Variables déclarées */}
          <div className="space-y-1.5">
            <Label>Variables déclarées</Label>
            <Input
              placeholder="Ex: {NOM},{PRENOM},{EMAIL}"
              value={form.variables}
              onChange={e => setForm(f => ({ ...f, variables: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Liste des variables séparées par des virgules. Cliquez sur "Synchroniser" pour les remplir automatiquement.
            </p>
          </div>

          {/* Statut (mode édition seulement) */}
          {isEdit && (
            <div className="flex items-center gap-3">
              <Label>Actif</Label>
              <Button
                type="button"
                variant={form.actif ? "default" : "outline"}
                size="sm"
                onClick={() => setForm(f => ({ ...f, actif: !f.actif }))}
              >
                {form.actif ? "Oui" : "Non"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// MODAL — PRÉVISUALISATION
// ============================================================

function PreviewModal({
  open,
  message,
  onOpenChange,
}: {
  open: boolean
  message: WhatsAppMessagePredefini | null
  onOpenChange: (v: boolean) => void
}) {
  const { previsualiser, loading } = useWhatsAppMessagesPredefinis()
  const [valeurs, setValeurs] = useState<Record<string, string>>({})
  const [resultat, setResultat] = useState<{ contenuResolu: string; variablesManquantes: string[]; estComplet: boolean } | null>(null)
  const [copied, setCopied] = useState(false)

  if (!message) return null

  const variables: string[] = message.variablesListe ??
    (message.variables ?? "")
      .split(",")
      .map(v => v.trim().replace(/[{}]/g, ""))
      .filter(Boolean)

  const handlePreview = async () => {
    const result = await previsualiser(message.id, { variables: valeurs })
    if (result) setResultat(result as any)
  }

  const handleCopy = () => {
    if (!resultat) return
    navigator.clipboard.writeText(resultat.contenuResolu)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setResultat(null); setValeurs({}) }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Prévisualisation — {message.titre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Renseigner les variables */}
          {variables.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Renseignez les variables pour générer un aperçu :
              </p>
              <div className="grid grid-cols-2 gap-3">
                {variables.map(v => (
                  <div key={v} className="space-y-1">
                    <Label className="text-xs font-mono">{"{" + v + "}"}</Label>
                    <Input
                      placeholder={`Valeur de ${v}`}
                      value={valeurs[v] ?? ""}
                      onChange={e => setValeurs(prev => ({ ...prev, [v]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ce message ne contient pas de variables.</p>
          )}

          <Button onClick={handlePreview} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Générer l'aperçu
          </Button>

          {/* Résultat */}
          {resultat && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Aperçu du message :</p>
                <div className="flex items-center gap-2">
                  {!resultat.estComplet && (
                    <Badge variant="destructive" className="text-xs">
                      {resultat.variablesManquantes.length} variable(s) manquante(s)
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-4">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {resultat.contenuResolu}
                </pre>
              </div>
              {!resultat.estComplet && (
                <p className="text-xs text-muted-foreground text-amber-600">
                  Variables non renseignées : {resultat.variablesManquantes.map(v => `{${v}}`).join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// DIALOG — CONFIRMATION DE SUPPRESSION
// ============================================================

function DeleteDialog({
  open,
  title,
  description,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================================
// MODAL — QR CODE CONNEXION
// ============================================================

function QrCodeModal({
  open,
  onOpenChange,
  qrCode,
  compteName,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  qrCode: QrCodeResponse | null
  compteName: string
  loading: boolean
}) {
  const imgSrc = qrCode?.base64
    ? `data:image/png;base64,${qrCode.base64}`
    : qrCode?.qrcode ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-600" />
            Scanner le QR code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Scannez ce code QR avec WhatsApp pour connecter le compte{" "}
            <span className="font-medium text-foreground">{compteName}</span>.
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Chargement du QR code…</p>
            </div>
          ) : imgSrc ? (
            <div className="rounded-lg border bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="QR Code WhatsApp" className="w-56 h-56 object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <WifiOff className="h-8 w-8 opacity-40" />
              <p className="text-sm">QR code non disponible</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Ouvrez WhatsApp → Appareils connectés → Connecter un appareil
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// COMPOSANT PRINCIPAL — ONGLET WHATSAPP
// ============================================================

export function WhatsAppTab() {
  const {
    comptes, loading: loadingComptes, fetchComptes, deleteCompte, updateConnexion,
  } = useWhatsAppComptes()

  const {
    messages, loading: loadingMessages, fetchMessages, deleteMessage,
  } = useWhatsAppMessagesPredefinis()

  const { messageTypes } = useWhatsAppMessageTypes()

  const {
    fetchQrCode, qrCode, loading: qrLoading,
  } = useWhatsappInstances()

  // ── UI state ───────────────────────────────────────────────
  const [compteFormOpen, setCompteFormOpen]   = useState(false)
  const [compteFormMode, setCompteFormMode]   = useState<CompteFormMode>({ mode: "create" })

  const [messageFormOpen, setMessageFormOpen] = useState(false)
  const [messageFormMode, setMessageFormMode] = useState<MessageFormMode>({ mode: "create" })

  const [previewOpen, setPreviewOpen]         = useState(false)
  const [previewMessage, setPreviewMessage]   = useState<WhatsAppMessagePredefini | null>(null)

  const [deleteTarget, setDeleteTarget]       = useState<{ type: "compte" | "message"; id: number; nom: string } | null>(null)
  const [deleting, setDeleting]               = useState(false)

  const [qrModalOpen, setQrModalOpen]         = useState(false)
  const [qrCompteNom, setQrCompteNom]         = useState("")

  const [messageSearch, setMessageSearch]     = useState("")
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>("all")
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set())

  // ── Filtrage messages ──────────────────────────────────────
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchSearch = !messageSearch ||
        m.titre.toLowerCase().includes(messageSearch.toLowerCase()) ||
        m.contenu.toLowerCase().includes(messageSearch.toLowerCase())
      const matchType = messageTypeFilter === "all" || m.type?.code === messageTypeFilter
      return matchSearch && matchType
    })
  }, [messages, messageSearch, messageTypeFilter])

  // ── Handlers ───────────────────────────────────────────────
  const openCreateCompte = () => { setCompteFormMode({ mode: "create" }); setCompteFormOpen(true) }
  const openEditCompte   = (c: WhatsAppCompte) => { setCompteFormMode({ mode: "edit", compte: c }); setCompteFormOpen(true) }

  const openCreateMessage = () => { setMessageFormMode({ mode: "create" }); setMessageFormOpen(true) }
  const openEditMessage   = (m: WhatsAppMessagePredefini) => { setMessageFormMode({ mode: "edit", message: m }); setMessageFormOpen(true) }
  const openPreview       = (m: WhatsAppMessagePredefini) => { setPreviewMessage(m); setPreviewOpen(true) }

  const toggleExpand = (id: number) => {
    setExpandedMessages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleToggleConnexion = async (compte: WhatsAppCompte) => {
    try {
      if (!compte.connecte) {
        setQrCompteNom(compte.nomAffichage)
        setQrModalOpen(true)
        const qr = await fetchQrCode(compte.nomInstance)
        if (qr) {
          await updateConnexion(compte.id, { connecte: true })
          toast({ title: "Compte connecté", description: compte.nomAffichage })
        }
      } else {
        await updateConnexion(compte.id, { connecte: false })
        toast({ title: "Compte déconnecté", description: compte.nomAffichage })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === "compte") {
        await deleteCompte(deleteTarget.id)
        toast({ title: "Compte supprimé", description: deleteTarget.nom })
      } else {
        await deleteMessage(deleteTarget.id)
        toast({ title: "Message supprimé", description: deleteTarget.nom })
      }
      setDeleteTarget(null)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — COMPTES WHATSAPP
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Comptes WhatsApp
            </h2>
            <p className="text-sm text-muted-foreground">
              {comptes.length} compte{comptes.length !== 1 ? "s" : ""} enregistré{comptes.length !== 1 ? "s" : ""}
              {" • "}
              {comptes.filter(c => c.connecte).length} connecté{comptes.filter(c => c.connecte).length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreateCompte} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau compte
          </Button>
        </div>

        {loadingComptes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comptes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Phone className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Aucun compte WhatsApp configuré</p>
              <Button variant="link" size="sm" onClick={openCreateCompte}>
                Créer le premier compte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {comptes.map(compte => (
              <Card key={compte.id} className={`relative transition-all ${compte.connecte ? "border-green-200 shadow-sm shadow-green-100" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{compte.nomAffichage}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{compte.nomInstance}</p>
                    </div>
                    <Badge
                      variant={compte.connecte ? "default" : "secondary"}
                      className={`shrink-0 text-xs ${compte.connecte ? "bg-green-100 text-green-700 border-green-200" : ""}`}
                    >
                      {compte.connecte
                        ? <><Wifi className="h-3 w-3 mr-1" />Connecté</>
                        : <><WifiOff className="h-3 w-3 mr-1" />Déconnecté</>
                      }
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono text-xs">{compte.numeroTelephone}</span>
                    </div>
                    {compte.service && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs">{compte.service}</span>
                      </div>
                    )}
                    {compte.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {compte.description}
                      </p>
                    )}
                    {compte.connecte && compte.dateConnexion && (
                      <p className="text-xs text-green-600">
                        Connecté le {new Date(compte.dateConnexion).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-2">
                    {/* Toggle connexion */}
                    <Button
                      variant={compte.connecte ? "outline" : "default"}
                      size="sm"
                      className={`flex-1 text-xs ${compte.connecte ? "border-red-200 text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}`}
                      onClick={() => handleToggleConnexion(compte)}
                    >
                      {compte.connecte
                        ? <><WifiOff className="h-3.5 w-3.5 mr-1.5" />Déconnecter</>
                        : <><Wifi className="h-3.5 w-3.5 mr-1.5" />Connecter</>
                      }
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCompte(compte)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteTarget({ type: "compte", id: compte.id, nom: compte.nomAffichage })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — MESSAGES PRÉDÉFINIS
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Messages prédéfinis
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredMessages.length} message{filteredMessages.length !== 1 ? "s" : ""}
              {messageTypeFilter !== "all" || messageSearch ? " (filtrés)" : ""}
            </p>
          </div>
          <Button onClick={openCreateMessage} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau message
          </Button>
        </div>

        {/* Barre de filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher un message..."
              className="pl-9"
              value={messageSearch}
              onChange={e => setMessageSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {messageTypes.map(t => (
                  <SelectItem key={t.id} value={t.code}>{t.libelle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des messages */}
        {loadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">
                {messages.length === 0 ? "Aucun message prédéfini" : "Aucun résultat pour ces filtres"}
              </p>
              {messages.length === 0 && (
                <Button variant="link" size="sm" onClick={openCreateMessage}>
                  Créer le premier message
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map(message => {
              const isExpanded = expandedMessages.has(message.id)
              const variables: string[] = message.variablesListe ??
                (message.variables ?? "")
                  .split(",")
                  .map(v => v.trim().replace(/[{}]/g, ""))
                  .filter(Boolean)

              return (
                <Card key={message.id} className="transition-shadow hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Infos principales */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{message.titre}</span>
                          {message.type && (
                            <Badge variant="outline" className="text-xs">
                              {message.type.libelle}
                            </Badge>
                          )}
                          {!message.actif && (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              Inactif
                            </Badge>
                          )}
                        </div>

                        {/* Variables */}
                        {variables.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {variables.map(v => (
                              <code key={v} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                {"{" + v + "}"}
                              </code>
                            ))}
                          </div>
                        )}

                        {/* Aperçu contenu */}
                        {isExpanded ? (
                          <div className="rounded-md border bg-muted/40 p-3 mt-2">
                            <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground">
                              {message.contenu}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {message.contenu}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Prévisualiser"
                          onClick={() => openPreview(message)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Modifier"
                          onClick={() => openEditMessage(message)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Supprimer"
                          onClick={() => setDeleteTarget({ type: "message", id: message.id, nom: message.titre })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={isExpanded ? "Réduire" : "Voir le contenu"}
                          onClick={() => toggleExpand(message.id)}
                        >
                          {isExpanded
                            ? <ChevronUp className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════ */}

      <CompteFormModal
        open={compteFormOpen}
        formMode={compteFormMode}
        onOpenChange={setCompteFormOpen}
        onSuccess={fetchComptes}
      />

      <MessageFormModal
        open={messageFormOpen}
        formMode={messageFormMode}
        onOpenChange={setMessageFormOpen}
        onSuccess={fetchMessages}
      />

      <PreviewModal
        open={previewOpen}
        message={previewMessage}
        onOpenChange={setPreviewOpen}
      />

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === "compte" ? "Supprimer le compte ?" : "Supprimer le message ?"}
        description={`"${deleteTarget?.nom ?? ""}" sera définitivement désactivé.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <QrCodeModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        qrCode={qrCode}
        compteName={qrCompteNom}
        loading={qrLoading}
      />
    </div>
  )
}