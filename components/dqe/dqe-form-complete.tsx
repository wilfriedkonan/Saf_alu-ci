"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Package,
  FileText,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import { useClientsList } from "@/hooks/useClients"
import { 
  DQE, 
  DQELot, 
  DQEChapter, 
  DQEItem,
  UniteMesure,
  formatCurrency 
} from "@/types/dqe"

interface DQEFormCompleteProps {
  mode: "create" | "edit"
  dqeId?: string
  initialData?: DQE
  onSuccess?: (dqe: DQE) => void
  onCancel?: () => void
}

const UNITS = [
  { value: "m³", label: "m³ (mètre cube)" },
  { value: "ml", label: "ml (mètre linéaire)" },
  { value: "m²", label: "m² (mètre carré)" },
  { value: "ens", label: "ens (ensemble)" },
  { value: "forf", label: "forf (forfait)" },
  { value: "u", label: "u (unité)" },
]

export function DQEFormComplete({ mode, dqeId, initialData, onSuccess, onCancel }: DQEFormCompleteProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hook pour récupérer les clients
  const { clients, loading: loadingClients } = useClientsList()

  // État principal du DQE
  const [dqe, setDqe] = useState<Partial<DQE>>({
    nom: initialData?.nom || "",
    description: initialData?.description || "",
    clientId: initialData?.clientId || 0,
    devisId: initialData?.devisId || 0,
    statut: initialData?.statut || "brouillon",
    tauxTVA: initialData?.tauxTVA || 18,
    totalRevenueHT: 0,
    montantTVA: 0,
    totalTTC: 0,
    lots: initialData?.lots || [],
  })

  // États pour les dialogs
  const [isLotDialogOpen, setIsLotDialogOpen] = useState(false)
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)

  // États pour l'édition
  const [editingLot, setEditingLot] = useState<DQELot | null>(null)
  const [editingChapter, setEditingChapter] = useState<DQEChapter | null>(null)
  const [editingItem, setEditingItem] = useState<DQEItem | null>(null)
  const [currentLotIndex, setCurrentLotIndex] = useState<number | null>(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null)

  // Formulaires temporaires
  const [lotForm, setLotForm] = useState({ code: "", nom: "", description: "" })
  const [chapterForm, setChapterForm] = useState({ code: "", nom: "", description: "" })
  const [itemForm, setItemForm] = useState({
    code: "",
    designation: "",
    description: "",
    unite: "m³",
    quantite: 0,
    prixUnitaireHT: 0,
  })

  // Calcul automatique des totaux
  useEffect(() => {
    calculateAllTotals()
  }, [dqe.lots, dqe.tauxTVA])

  const calculateAllTotals = () => {
    if (!dqe.lots || dqe.lots.length === 0) {
      setDqe((prev) => ({
        ...prev,
        totalRevenueHT: 0,
        montantTVA: 0,
        totalTTC: 0,
      }))
      return
    }

    const updatedLots = dqe.lots.map((lot) => {
      const updatedChapters = lot.chapters?.map((chapter) => {
        const totalChapter = chapter.items?.reduce((sum, item) => sum + item.quantite * item.prixUnitaireHT, 0) || 0
        return { ...chapter, totalRevenueHT: totalChapter }
      }) || []

      const totalLot = updatedChapters.reduce((sum, ch) => sum + ch.totalRevenueHT, 0)

      return {
        ...lot,
        chapters: updatedChapters,
        totalRevenueHT: totalLot,
      }
    })

    const totalHT = updatedLots.reduce((sum, lot) => sum + lot.totalRevenueHT, 0)
    const tva = dqe.tauxTVA || 18
    const montantTVA = totalHT * (tva / 100)
    const totalTTC = totalHT + montantTVA

    // Calculer les pourcentages
    const lotsWithPercentage = updatedLots.map((lot) => ({
      ...lot,
      pourcentageTotal: totalHT > 0 ? (lot.totalRevenueHT / totalHT) * 100 : 0,
    }))

    setDqe((prev) => ({
      ...prev,
      lots: lotsWithPercentage,
      totalRevenueHT: totalHT,
      montantTVA: montantTVA,
      totalTTC: totalTTC,
    }))
  }

  // Gestion des lots
  const openAddLotDialog = () => {
    setEditingLot(null)
    setLotForm({ code: "", nom: "", description: "" })
    setIsLotDialogOpen(true)
  }

  const openEditLotDialog = (lot: DQELot, index: number) => {
    setEditingLot(lot)
    setCurrentLotIndex(index)
    setLotForm({ code: lot.code, nom: lot.nom, description: lot.description || "" })
    setIsLotDialogOpen(true)
  }

  const saveLot = () => {
    if (!lotForm.code || !lotForm.nom) {
      toast.error("Code et nom du lot sont requis")
      return
    }

    const newLot: Partial<DQELot> = {
      code: lotForm.code,
      nom: lotForm.nom,
      description: lotForm.description,
      ordre: editingLot ? editingLot.ordre : (dqe.lots?.length || 0) + 1,
      totalRevenueHT: 0,
      pourcentageTotal: 0,
      chapters: editingLot ? editingLot.chapters : [],
    }

    if (editingLot && currentLotIndex !== null) {
      const updatedLots = [...(dqe.lots || [])]
      updatedLots[currentLotIndex] = newLot as DQELot
      setDqe((prev) => ({ ...prev, lots: updatedLots }))
      toast.success("Lot modifié avec succès")
    } else {
      setDqe((prev) => ({ ...prev, lots: [...(prev.lots || []), newLot as DQELot] }))
      toast.success("Lot ajouté avec succès")
    }

    setIsLotDialogOpen(false)
    setEditingLot(null)
    setCurrentLotIndex(null)
  }

  const deleteLot = (index: number) => {
    const updatedLots = dqe.lots?.filter((_, i) => i !== index) || []
    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    toast.success("Lot supprimé")
  }

  // Gestion des chapitres
  const openAddChapterDialog = (lotIndex: number) => {
    setCurrentLotIndex(lotIndex)
    setEditingChapter(null)
    setChapterForm({ code: "", nom: "", description: "" })
    setIsChapterDialogOpen(true)
  }

  const openEditChapterDialog = (lotIndex: number, chapter: DQEChapter, chapterIndex: number) => {
    setCurrentLotIndex(lotIndex)
    setCurrentChapterIndex(chapterIndex)
    setEditingChapter(chapter)
    setChapterForm({ code: chapter.code, nom: chapter.nom, description: chapter.description || "" })
    setIsChapterDialogOpen(true)
  }

  const saveChapter = () => {
    if (!chapterForm.code || !chapterForm.nom || currentLotIndex === null) {
      toast.error("Code et nom du chapitre sont requis")
      return
    }

    const lot = dqe.lots![currentLotIndex]
    const newChapter: Partial<DQEChapter> = {
      code: chapterForm.code,
      nom: chapterForm.nom,
      description: chapterForm.description,
      ordre: editingChapter ? editingChapter.ordre : (lot.chapters?.length || 0) + 1,
      totalRevenueHT: 0,
      items: editingChapter ? editingChapter.items : [],
    }

    const updatedLots = [...dqe.lots!]
    if (editingChapter && currentChapterIndex !== null) {
      updatedLots[currentLotIndex].chapters![currentChapterIndex] = newChapter as DQEChapter
      toast.success("Chapitre modifié avec succès")
    } else {
      updatedLots[currentLotIndex].chapters = [...(lot.chapters || []), newChapter as DQEChapter]
      toast.success("Chapitre ajouté avec succès")
    }

    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    setIsChapterDialogOpen(false)
    setEditingChapter(null)
    setCurrentChapterIndex(null)
  }

  const deleteChapter = (lotIndex: number, chapterIndex: number) => {
    const updatedLots = [...dqe.lots!]
    updatedLots[lotIndex].chapters = updatedLots[lotIndex].chapters!.filter((_, i) => i !== chapterIndex)
    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    toast.success("Chapitre supprimé")
  }

  // Gestion des items
  const openAddItemDialog = (lotIndex: number, chapterIndex: number) => {
    setCurrentLotIndex(lotIndex)
    setCurrentChapterIndex(chapterIndex)
    setEditingItem(null)
    setItemForm({
      code: "",
      designation: "",
      description: "",
      unite: "m³",
      quantite: 0,
      prixUnitaireHT: 0,
    })
    setIsItemDialogOpen(true)
  }

  const saveItem = () => {
    if (!itemForm.code || !itemForm.designation || currentLotIndex === null || currentChapterIndex === null) {
      toast.error("Code et désignation du poste sont requis")
      return
    }

    if (itemForm.quantite <= 0) {
      toast.error("La quantité doit être supérieure à 0")
      return
    }

    const newItem: Partial<DQEItem> = {
      code: itemForm.code,
      designation: itemForm.designation,
      description: itemForm.description,
      unite: itemForm.unite as UniteMesure,
      quantite: itemForm.quantite,
      prixUnitaireHT: itemForm.prixUnitaireHT,
      totalRevenueHT: itemForm.quantite * itemForm.prixUnitaireHT,
      ordre: (dqe.lots![currentLotIndex].chapters![currentChapterIndex].items?.length || 0) + 1,
    }

    const updatedLots = [...dqe.lots!]
    updatedLots[currentLotIndex].chapters![currentChapterIndex].items = [
      ...(updatedLots[currentLotIndex].chapters![currentChapterIndex].items || []),
      newItem as DQEItem,
    ]

    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    setIsItemDialogOpen(false)
    toast.success("Poste ajouté avec succès")
  }

  const deleteItem = (lotIndex: number, chapterIndex: number, itemIndex: number) => {
    const updatedLots = [...dqe.lots!]
    updatedLots[lotIndex].chapters![chapterIndex].items = updatedLots[lotIndex].chapters![chapterIndex].items!.filter(
      (_, i) => i !== itemIndex,
    )
    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    toast.success("Poste supprimé")
  }

  // Validation et soumission
  const validateStep1 = () => {
    if (!dqe.nom) {
      toast.error("Le nom du DQE est requis")
      return false
    }
    if (!dqe.clientId) {
      toast.error("Veuillez sélectionner un client")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!dqe.lots || dqe.lots.length === 0) {
      toast.error("Ajoutez au moins un lot")
      return false
    }

    for (const lot of dqe.lots) {
      if (!lot.chapters || lot.chapters.length === 0) {
        toast.error(`Le lot "${lot.nom}" doit contenir au moins un chapitre`)
        return false
      }

      for (const chapter of lot.chapters) {
        if (!chapter.items || chapter.items.length === 0) {
          toast.error(`Le chapitre "${chapter.nom}" doit contenir au moins un poste`)
          return false
        }
      }
    }

    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSaveDraft = async () => {
    if (!validateStep1()) return

    setIsSubmitting(true)
    try {
      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedDqe = {
        ...dqe,
        id:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        reference:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        statut: "brouillon" as const,
      }

      toast.success("Brouillon enregistré avec succès")
      onSuccess?.(savedDqe as unknown as DQE)
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleValidate = async () => {
    if (!validateStep1() || !validateStep2()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const validatedDqe = {
        ...dqe,
        id:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        reference:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        statut: "validé" as const,
      }

      toast.success("DQE validé avec succès")
      onSuccess?.(validatedDqe as unknown as DQE)
    } catch (error) {
      toast.error("Erreur lors de la validation")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rendu des étapes
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Informations générales du DQE
        </CardTitle>
        <CardDescription>Renseignez les informations de base du DQE</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reference">Référence DQE</Label>
            <Input id="reference" value={dqeId || "DQE-2024-XXX"} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">
              Nom du DQE <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nom"
              value={dqe.nom}
              onChange={(e) => setDqe((prev) => ({ ...prev, nom: e.target.value }))}
              placeholder="Ex: Centre Médical Abobo"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={dqe.description}
            onChange={(e) => setDqe((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description détaillée du projet..."
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client">
              Client <span className="text-destructive">*</span>
            </Label>
            <Select
              value={dqe.clientId?.toString()}
              onValueChange={(value) => {
                const client = clients.find((c) => c.id === parseInt(value))
                setDqe((prev) => ({
                  ...prev,
                  clientId: parseInt(value),
                  clientName: client?.nom || "",
                }))
              }}
              disabled={loadingClients}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionner un client..."} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tva">
              Taux TVA (%) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tva"
              type="number"
              value={dqe.tauxTVA}
              onChange={(e) => setDqe((prev) => ({ ...prev, tauxTVA: Number(e.target.value) }))}
              min="0"
              max="100"
            />
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Les montants seront calculés automatiquement à partir des postes détaillés dans l'étape suivante.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Structure du DQE
          </CardTitle>
          <CardDescription>Organisez votre DQE en lots, chapitres et postes</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openAddLotDialog} className="mb-4">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un lot
          </Button>

          {dqe.lots && dqe.lots.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {dqe.lots.map((lot, lotIndex) => (
                <AccordionItem
                  key={lotIndex}
                  value={`lot-${lotIndex}`}
                  className="border rounded-lg bg-blue-50 dark:bg-blue-950/20"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                          {lot.code}
                        </Badge>
                        <span className="font-semibold">{lot.nom}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(lot.totalRevenueHT)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditLotDialog(lot, lotIndex)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteLot(lotIndex)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openAddChapterDialog(lotIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un chapitre
                      </Button>

                      {lot.chapters && lot.chapters.length > 0 ? (
                        <Accordion type="multiple" className="space-y-3">
                          {lot.chapters.map((chapter, chapterIndex) => (
                            <AccordionItem
                              key={chapterIndex}
                              value={`chapter-${chapterIndex}`}
                              className="border rounded-lg bg-green-50 dark:bg-green-950/20"
                            >
                              <AccordionTrigger className="px-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                                      {chapter.code}
                                    </Badge>
                                    <span className="font-medium text-sm">{chapter.nom}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-green-600 dark:text-green-400">
                                      {formatCurrency(chapter.totalRevenueHT)}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openEditChapterDialog(lotIndex, chapter, chapterIndex)
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteChapter(lotIndex, chapterIndex)
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3">
                                <div className="space-y-3 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddItemDialog(lotIndex, chapterIndex)}
                                  >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Ajouter un poste
                                  </Button>

                                  {chapter.items && chapter.items.length > 0 ? (
                                    <div className="rounded-lg border bg-white dark:bg-gray-950">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-20">Code</TableHead>
                                            <TableHead>Désignation</TableHead>
                                            <TableHead className="w-16">Unité</TableHead>
                                            <TableHead className="w-24 text-right">Qté</TableHead>
                                            <TableHead className="w-32 text-right">PU HT</TableHead>
                                            <TableHead className="w-32 text-right">Total HT</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {chapter.items.map((item, itemIndex) => (
                                            <TableRow key={itemIndex}>
                                              <TableCell className="font-mono text-xs">{item.code}</TableCell>
                                              <TableCell>{item.designation}</TableCell>
                                              <TableCell className="text-center">{item.unite}</TableCell>
                                              <TableCell className="text-right">
                                                {item.quantite.toLocaleString("fr-FR")}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(item.prixUnitaireHT)}
                                              </TableCell>
                                              <TableCell className="text-right font-medium">
                                                {formatCurrency(item.totalRevenueHT)}
                                              </TableCell>
                                              <TableCell>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => deleteItem(lotIndex, chapterIndex, itemIndex)}
                                                >
                                                  <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <Alert>
                                      <AlertDescription>
                                        Aucun poste ajouté. Cliquez sur "Ajouter un poste" pour commencer.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            Aucun chapitre ajouté. Cliquez sur "Ajouter un chapitre" pour commencer.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Aucun lot ajouté. Cliquez sur "Ajouter un lot" pour commencer.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Récapitulatif du DQE
        </CardTitle>
        <CardDescription>Vérifiez les informations avant validation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Informations générales</h3>
          <div className="grid gap-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Référence :</span>
              <span className="font-medium">{dqeId || "DQE-2024-XXX"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nom :</span>
              <span className="font-medium">{dqe.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client :</span>
              <span className="font-medium">{dqe.client?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux TVA :</span>
              <span className="font-medium">{dqe.tauxTVA}%</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Structure */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Structure</h3>
          <div className="grid gap-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre de lots :</span>
              <span className="font-medium">{dqe.lots?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre de chapitres :</span>
              <span className="font-medium">
                {dqe.lots?.reduce((sum, lot) => sum + (lot.chapters?.length || 0), 0) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre de postes :</span>
              <span className="font-medium">
                {dqe.lots?.reduce(
                  (sum, lot) =>
                    sum + (lot.chapters?.reduce((chSum, ch) => chSum + (ch.items?.length || 0), 0) || 0),
                  0,
                ) || 0}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Montants */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Montants</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Total HT :</span>
              <span className="font-bold">{formatCurrency(dqe.totalRevenueHT ? dqe.totalRevenueHT : 0)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>TVA ({dqe.tauxTVA}%) :</span>
              <span className="font-bold">{formatCurrency(dqe.montantTVA ? dqe.montantTVA :0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl">
              <span className="font-semibold">Total TTC :</span>
              <span className="font-bold text-primary">{formatCurrency(dqe.totalTTC ? dqe.totalTTC : 0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Créer un DQE" : "Modifier le DQE"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Créez une décomposition quantitative estimative pour votre projet"
              : "Modifiez les informations du DQE"}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-muted"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-20 h-0.5 ${currentStep > step ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step names */}
      <div className="flex items-center justify-center space-x-8 text-sm">
        <span className={currentStep === 1 ? "font-semibold" : "text-muted-foreground"}>
          Informations
        </span>
        <span className={currentStep === 2 ? "font-semibold" : "text-muted-foreground"}>
          Structure
        </span>
        <span className={currentStep === 3 ? "font-semibold" : "text-muted-foreground"}>
          Récapitulatif
        </span>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le brouillon
          </Button>
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleValidate} disabled={isSubmitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider le DQE
            </Button>
          )}
        </div>
      </div>

      {/* Dialog Lot */}
      <Dialog open={isLotDialogOpen} onOpenChange={setIsLotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLot ? "Modifier le lot" : "Ajouter un lot"}</DialogTitle>
            <DialogDescription>
              Renseignez les informations du lot. Les montants seront calculés automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lot-code">
                Code du lot <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lot-code"
                value={lotForm.code}
                onChange={(e) => setLotForm((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="Ex: LOT 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot-nom">
                Nom du lot <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lot-nom"
                value={lotForm.nom}
                onChange={(e) => setLotForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: TERRASSEMENTS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot-description">Description</Label>
              <Textarea
                id="lot-description"
                value={lotForm.description}
                onChange={(e) => setLotForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du lot..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLotDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveLot}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Chapitre */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Modifier le chapitre" : "Ajouter un chapitre"}</DialogTitle>
            <DialogDescription>
              {currentLotIndex !== null && dqe.lots && (
                <Badge variant="secondary" className="mt-2">
                  Parent : {dqe.lots[currentLotIndex].code} - {dqe.lots[currentLotIndex].nom}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-code">
                Code du chapitre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter-code"
                value={chapterForm.code}
                onChange={(e) => setChapterForm((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="Ex: 1.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-nom">
                Nom du chapitre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter-nom"
                value={chapterForm.nom}
                onChange={(e) => setChapterForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Déblais"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-description">Description</Label>
              <Textarea
                id="chapter-description"
                value={chapterForm.description}
                onChange={(e) => setChapterForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du chapitre..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveChapter}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Poste */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un poste</DialogTitle>
            <DialogDescription>
              {currentLotIndex !== null && currentChapterIndex !== null && dqe.lots && (
                <Badge variant="secondary" className="mt-2">
                  Parent : {dqe.lots[currentLotIndex].chapters![currentChapterIndex].code} -{" "}
                  {dqe.lots[currentLotIndex].chapters![currentChapterIndex].nom}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-code">
                  Code du poste <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-code"
                  value={itemForm.code}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Ex: 1.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-unite">
                  Unité <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={itemForm.unite}
                  onValueChange={(value) => setItemForm((prev) => ({ ...prev, unite: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-designation">
                Désignation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="item-designation"
                value={itemForm.designation}
                onChange={(e) => setItemForm((prev) => ({ ...prev, designation: e.target.value }))}
                placeholder="Ex: Déblai manuel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du poste..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-quantite">
                  Quantité <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-quantite"
                  type="number"
                  value={itemForm.quantite}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, quantite: Number(e.target.value) }))}
                  placeholder="150.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-prix">
                  Prix unitaire HT (FCFA) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-prix"
                  type="number"
                  value={itemForm.prixUnitaireHT}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, prixUnitaireHT: Number(e.target.value) }))}
                  placeholder="2500"
                  step="1"
                  min="0"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total HT</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(itemForm.quantite * itemForm.prixUnitaireHT)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveItem}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}