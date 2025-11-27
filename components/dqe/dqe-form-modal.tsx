"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useDqe } from "@/hooks/useDqe"
import { useClientsList } from "@/hooks/useClients"
import { 
  formatCurrency,
  type DQE,
  type DQELot,
  type DQEChapter,
  type DQEItem,
  type CreateDQERequest,
  type UpdateDQERequest,
  type UniteMesure
} from "@/types/dqe"

interface DQEFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (dqe: Partial<DQE>) => Promise<void> | void
  editData?: DQE | null
}

const UNITES: UniteMesure[] = ["m³", "ml", "m²", "ens", "forf", "u", "kg"]

export function DQEFormModal({ open, onOpenChange, onSubmit, editData }: DQEFormModalProps) {
  const { createDQE, updateDQE, fetchDQEById, loading } = useDqe()
  const { clients, loading: loadingClients } = useClientsList()
  
  const [formData, setFormData] = useState<Partial<DQE>>({
    nom: "",
    clientId: 0,
    statut: "brouillon",
    lots: [],
  })

  const [tauxTVA, setTauxTVA] = useState(18)
  const [loadingData, setLoadingData] = useState(false)

  // ✅ CORRECTION: Charger la structure complète du DQE en édition
  useEffect(() => {
    const loadDQEData = async () => {
      if (editData?.id && open) {
        setLoadingData(true)
        try {
          // ✅ Charger le DQE complet avec toute sa structure
          const fullDQE = await fetchDQEById(editData.id)
          console.log('editData:',editData)
          if (fullDQE) {
            setFormData({
              nom: fullDQE.nom,
              description: fullDQE.description || "",
              clientId: fullDQE.client?.id,
              statut: fullDQE.statut,
              lots: fullDQE.lots || [],
            })
            
            setTauxTVA(fullDQE.tauxTVA || 18)
          }
        } catch (error) {
          console.error("Erreur lors du chargement du DQE:", error)
          toast.error("Erreur lors du chargement du DQE")
        } finally {
          setLoadingData(false)
        }
      } else if (!editData && open) {
        // Reset pour création
        setFormData({
          nom: "",
          clientId: 0,
          statut: "brouillon",
          lots: [],
        })
        setTauxTVA(18)
      }
    }

    loadDQEData()
  }, [editData, open, fetchDQEById])

  const handleSubmit = async () => {
    if (!formData.nom || !formData.clientId) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const dqeData: CreateDQERequest | UpdateDQERequest = {
        nom: formData.nom,
        description: formData.description,
        clientId: formData.clientId,
        tauxTVA: tauxTVA,
        statut:formData?.statut,
        lots: formData.lots?.map((lot, lotIndex) => ({
          code: lot.code,
          nom: lot.nom,
          description: lot.description,
          ordre: lotIndex + 1,
          chapters: lot.chapters?.map((chapter, chapterIndex) => ({
            code: chapter.code,
            nom: chapter.nom,
            description: chapter.description,
            ordre: chapterIndex + 1,
            items: chapter.items?.map((item, itemIndex) => ({
              code: item.code,
              designation: item.designation,
              description: item.description,
              unite: item.unite,
              quantite: item.quantite,
              prixUnitaireHT: item.prixUnitaireHT,
              deboursseSec: item.deboursseSec,
              ordre: itemIndex + 1,
            })) || [],
          })) || [],
        })) || [],
      }

      if (editData?.id) {
        // ✅ Appel de updateDQE avec l'ID
        console.log('Debug update dqe start data: ',dqeData)
        const success = await updateDQE(editData.id, dqeData as UpdateDQERequest)
        if (success) {
          await onSubmit(formData)
          onOpenChange(false)
        }
      } else {
        // ✅ Appel de createDQE
        const result = await createDQE(dqeData as CreateDQERequest)
        if (result.success) {
          await onSubmit(formData)
          onOpenChange(false)
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      // Le toast d'erreur est déjà géré par le hook
    }
  }

  const addLot = () => {
    const newLot: Partial<DQELot> = {
      code: `LOT ${(formData.lots?.length || 0) + 1}`,
      nom: "",
      description: "",
      ordre: (formData.lots?.length || 0) + 1,
      totalRevenueHT: 0,
      pourcentageTotal: 0,
      chapters: [],
    }
    setFormData({
      ...formData,
      lots: [...(formData.lots || []), newLot as DQELot],
    })
  }

  const removeLot = (index: number) => {
    setFormData({
      ...formData,
      lots: formData.lots?.filter((_, i) => i !== index),
    })
  }

  const updateLot = (index: number, field: keyof DQELot, value: any) => {
    const updatedLots = [...(formData.lots || [])]
    updatedLots[index] = { ...updatedLots[index], [field]: value }
    setFormData({ ...formData, lots: updatedLots })
  }

  const addChapter = (lotIndex: number) => {
    const updatedLots = [...(formData.lots || [])]
    const newChapter: Partial<DQEChapter> = {
      code: `${updatedLots[lotIndex].code}.${(updatedLots[lotIndex].chapters?.length || 0) + 1}`,
      nom: "",
      description: "",
      ordre: (updatedLots[lotIndex].chapters?.length || 0) + 1,
      totalRevenueHT: 0,
      items: [],
    }
    updatedLots[lotIndex].chapters = [...(updatedLots[lotIndex].chapters || []), newChapter as DQEChapter]
    setFormData({ ...formData, lots: updatedLots })
  }

  const removeChapter = (lotIndex: number, chapterIndex: number) => {
    const updatedLots = [...(formData.lots || [])]
    updatedLots[lotIndex].chapters = updatedLots[lotIndex].chapters?.filter((_, i) => i !== chapterIndex)
    setFormData({ ...formData, lots: updatedLots })
  }

  const updateChapter = (lotIndex: number, chapterIndex: number, field: keyof DQEChapter, value: any) => {
    const updatedLots = [...(formData.lots || [])]
    updatedLots[lotIndex].chapters![chapterIndex] = {
      ...updatedLots[lotIndex].chapters![chapterIndex],
      [field]: value,
    }
    setFormData({ ...formData, lots: updatedLots })
  }

  const addItem = (lotIndex: number, chapterIndex: number) => {
    const updatedLots = [...(formData.lots || [])]
    const newItem: Partial<DQEItem> = {
      code: `${updatedLots[lotIndex].chapters![chapterIndex].code}.${(updatedLots[lotIndex].chapters![chapterIndex].items?.length || 0) + 1}`,
      designation: "",
      description: "",
      unite: "m³",
      quantite: 0,
      prixUnitaireHT: 0,
      totalRevenueHT: 0,
      deboursseSec:0,
      ordre: (updatedLots[lotIndex].chapters![chapterIndex].items?.length || 0) + 1,
    }
    updatedLots[lotIndex].chapters![chapterIndex].items = [
      ...(updatedLots[lotIndex].chapters![chapterIndex].items || []),
      newItem as DQEItem,
    ]
    setFormData({ ...formData, lots: updatedLots })
  }

  const removeItem = (lotIndex: number, chapterIndex: number, itemIndex: number) => {
    const updatedLots = [...(formData.lots || [])]
    updatedLots[lotIndex].chapters![chapterIndex].items = updatedLots[lotIndex].chapters![
      chapterIndex
    ].items?.filter((_, i) => i !== itemIndex)
    setFormData({ ...formData, lots: updatedLots })
  }

  const updateItem = (
    lotIndex: number,
    chapterIndex: number,
    itemIndex: number,
    field: keyof DQEItem,
    value: any,
  ) => {
    const updatedLots = [...(formData.lots || [])]
    const item = updatedLots[lotIndex].chapters![chapterIndex].items![itemIndex]
    updatedLots[lotIndex].chapters![chapterIndex].items![itemIndex] = {
      ...item,
      [field]: value,
      totalRevenueHT:
        field === "quantite"
          ? value * item.prixUnitaireHT
          : field === "prixUnitaireHT"
            ? item.quantite * value
            : item.totalRevenueHT,
    }
    setFormData({ ...formData, lots: updatedLots })
  }
useEffect(()=>{
console.log('formData:',formData)
},[formData])
  // Calcul des totaux
  const calculateTotals = () => {
    let totalHT = 0
    formData.lots?.forEach((lot) => {
      let lotTotal = 0
      lot.chapters?.forEach((chapter) => {
        let chapterTotal = 0
        chapter.items?.forEach((item) => {
          chapterTotal += item.quantite * item.prixUnitaireHT
        })
        lotTotal += chapterTotal
      })
      totalHT += lotTotal
    })
    const montantTVA = totalHT * (tauxTVA / 100)
    const totalTTC = totalHT + montantTVA

    return { totalHT, montantTVA, totalTTC }
  }

  const totals = calculateTotals()

  // ✅ Afficher un loader pendant le chargement des données
  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chargement...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] p-0">

    <DialogHeader className="px-6 py-4 border-b">
    <DialogTitle className="text-xl font-semibold">
    {editData ? "Modifier le DQE" : "Créer un nouveau DQE"}</DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Informations générales */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du DQE *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Centre Médical Abobo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.clientId?.toString() || undefined}
                  onValueChange={(value) => setFormData({ ...formData, clientId: parseInt(value) })}
                  disabled={loadingClients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionner un client"}>
                      {formData.clientId && clients.length > 0
                        ? clients.find((c) => c.id === formData.clientId)?.nom || "Sélectionner un client"
                        : "Sélectionner un client"}
                    </SelectValue>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du projet..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tva">Taux TVA (%)</Label>
              <Input
                id="tva"
                type="number"
                value={tauxTVA}
                onChange={(e) => setTauxTVA(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Structure DQE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Structure du DQE</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLot}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un lot
              </Button>
            </div>

            {formData.lots && formData.lots.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {formData.lots.map((lot, lotIndex) => (
                  <AccordionItem key={lotIndex} value={`lot-${lotIndex}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-medium">
                          {lot.code} - {lot.nom || "Nouveau lot"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeLot(lotIndex)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                              value={lot.code}
                              onChange={(e) => updateLot(lotIndex, "code", e.target.value)}
                              placeholder="LOT 1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input
                              value={lot.nom}
                              onChange={(e) => updateLot(lotIndex, "nom", e.target.value)}
                              placeholder="TERRASSEMENTS"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addChapter(lotIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un chapitre
                        </Button>

                        {lot.chapters && lot.chapters.length > 0 && (
                          <div className="space-y-2">
                            {lot.chapters.map((chapter, chapterIndex) => (
                              <Card key={chapterIndex} className="p-3">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                      {chapter.code} - {chapter.nom || "Nouveau chapitre"}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeChapter(lotIndex, chapterIndex)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      value={chapter.code}
                                      onChange={(e) =>
                                        updateChapter(lotIndex, chapterIndex, "code", e.target.value)
                                      }
                                      placeholder="1.1"
                                      className="text-sm"
                                    />
                                    <Input
                                      value={chapter.nom}
                                      onChange={(e) =>
                                        updateChapter(lotIndex, chapterIndex, "nom", e.target.value)
                                      }
                                      placeholder="Déblais"
                                      className="text-sm"
                                    />
                                  </div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addItem(lotIndex, chapterIndex)}
                                  >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Ajouter un poste
                                  </Button>

                                  {chapter.items && chapter.items.length > 0 && (
                                    <div className="space-y-2">
                                      {chapter.items.map((item, itemIndex) => (
                                        <div
                                          key={itemIndex}
                                          className="grid grid-cols-12 gap-2 items-center p-2 bg-muted rounded"
                                        >
                                          <Input
                                            value={item.code}
                                            onChange={(e) =>
                                              updateItem(lotIndex, chapterIndex, itemIndex, "code", e.target.value)
                                            }
                                            placeholder="1.1.1"
                                            className="text-xs col-span-1"
                                          />
                                          <Input
                                            value={item.designation}
                                            onChange={(e) =>
                                              updateItem(
                                                lotIndex,
                                                chapterIndex,
                                                itemIndex,
                                                "designation",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="Désignation"
                                            className="text-xs col-span-4"
                                          />
                                          <Select
                                            value={item.unite}
                                            onValueChange={(value) =>
                                              updateItem(
                                                lotIndex,
                                                chapterIndex,
                                                itemIndex,
                                                "unite",
                                                value,
                                              )
                                            }
                                          >
                                            <SelectTrigger className="text-xs col-span-1">
                                              <SelectValue placeholder="Unité" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {UNITES.map((unite) => (
                                                <SelectItem key={unite} value={unite}>
                                                  {unite}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Input
                                            type="number"
                                            value={item.quantite}
                                            onChange={(e) =>
                                              updateItem(
                                                lotIndex,
                                                chapterIndex,
                                                itemIndex,
                                                "quantite",
                                                Number(e.target.value),
                                              )
                                            }
                                            placeholder="Qté"
                                            className="text-xs col-span-1"
                                          />
                                          <Input
                                            type="number"
                                            value={item.prixUnitaireHT}
                                            onChange={(e) =>
                                              updateItem(
                                                lotIndex,
                                                chapterIndex,
                                                itemIndex,
                                                "prixUnitaireHT",
                                                Number(e.target.value),
                                              )
                                            }
                                            placeholder="PU HT"
                                            className="text-xs col-span-2"
                                          />
                                           <Input
                                            type="number"
                                            value={item.deboursseSec}
                                            onChange={(e) =>
                                              updateItem(
                                                lotIndex,
                                                chapterIndex,
                                                itemIndex,
                                                "deboursseSec",
                                                Number(e.target.value),
                                              )
                                            }
                                            placeholder="déboursé sec"
                                            className="text-xs col-span-2"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(lotIndex, chapterIndex, itemIndex)}
                                            className="col-span-1"
                                          >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center text-muted-foreground py-8 border rounded-lg">
                Aucun lot ajouté. Cliquez sur "Ajouter un lot" pour commencer.
              </div>
            )}
          </div>

          {/* Totaux */}
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total HT :</span>
                <span className="font-medium">{formatCurrency(totals.totalHT)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({tauxTVA}%) :</span>
                <span className="font-medium">{formatCurrency(totals.montantTVA)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC :</span>
                <span className="text-primary">{formatCurrency(totals.totalTTC)}</span>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editData ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}