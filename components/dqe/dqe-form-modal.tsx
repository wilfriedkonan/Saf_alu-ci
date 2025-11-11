"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { mockClients } from "@/lib/clients"
import { formatCurrency } from "@/lib/format"
import type { DQE, DQELot, DQEChapitre, DQEPoste } from "@/lib/dqe"

interface DQEFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (dqe: Partial<DQE>) => void
  editData?: DQE | null
}

const UNITES = ["m³", "ml", "m²", "ens", "forf", "u", "kg", "t"]

export function DQEFormModal({ open, onOpenChange, onSubmit, editData }: DQEFormModalProps) {
  const [formData, setFormData] = useState<Partial<DQE>>({
    nom: "",
    clientId: "",
    clientName: "",
    statut: "brouillon",
    lots: [],
  })

  const [tauxTVA, setTauxTVA] = useState(18)

  useEffect(() => {
    if (editData) {
      setFormData(editData)
      if (editData.tauxTVA) {
        setTauxTVA(editData.tauxTVA)
      }
    } else {
      setFormData({
        nom: "",
        clientId: "",
        clientName: "",
        statut: "brouillon",
        lots: [],
      })
      setTauxTVA(18)
    }
  }, [editData, open])

  // Calcul du total HT d'un poste
  const calculatePosteTotal = (poste: DQEPoste): number => {
    return poste.quantite * poste.prixUnitaireHT
  }

  // Calcul du total HT d'un chapitre
  const calculateChapitreTotal = (chapitre: DQEChapitre): number => {
    return chapitre.postes.reduce((sum, poste) => sum + calculatePosteTotal(poste), 0)
  }

  // Calcul du total HT d'un lot
  const calculateLotTotal = (lot: DQELot): number => {
    return lot.chapitres.reduce((sum, chapitre) => sum + calculateChapitreTotal(chapitre), 0)
  }

  // Calcul du total HT du DQE
  const calculateDQETotal = (): number => {
    return (formData.lots || []).reduce((sum, lot) => sum + calculateLotTotal(lot), 0)
  }

  const totalHT = calculateDQETotal()
  const montantTVA = (totalHT * tauxTVA) / 100
  const totalTTC = totalHT + montantTVA

  // Ajouter un lot
  const addLot = () => {
    const newLot: DQELot = {
      id: `lot-${Date.now()}`,
      code: `LOT${(formData.lots?.length || 0) + 1}`,
      nom: "",
      description: "",
      totalRevenueHT: 0,
      pourcentageTotal: 0,
      chapitres: [],
    }
    setFormData({ ...formData, lots: [...(formData.lots || []), newLot] })
  }

  // Supprimer un lot
  const removeLot = (lotIndex: number) => {
    const newLots = formData.lots?.filter((_, i) => i !== lotIndex) || []
    setFormData({ ...formData, lots: newLots })
  }

  // Mettre à jour un lot
  const updateLot = (lotIndex: number, field: keyof DQELot, value: any) => {
    const newLots = [...(formData.lots || [])]
    newLots[lotIndex] = { ...newLots[lotIndex], [field]: value }
    setFormData({ ...formData, lots: newLots })
  }

  // Ajouter un chapitre
  const addChapitre = (lotIndex: number) => {
    const lot = formData.lots?.[lotIndex]
    if (!lot) return

    const newChapitre: DQEChapitre = {
      id: `chapitre-${Date.now()}`,
      code: `${lot.code}.${(lot.chapitres?.length || 0) + 1}`,
      nom: "",
      description: "",
      totalRevenueHT: 0,
      postes: [],
    }

    const newLots = [...(formData.lots || [])]
    newLots[lotIndex] = {
      ...lot,
      chapitres: [...(lot.chapitres || []), newChapitre],
    }
    setFormData({ ...formData, lots: newLots })
  }

  // Supprimer un chapitre
  const removeChapitre = (lotIndex: number, chapitreIndex: number) => {
    const newLots = [...(formData.lots || [])]
    const lot = newLots[lotIndex]
    lot.chapitres = lot.chapitres.filter((_, i) => i !== chapitreIndex)
    setFormData({ ...formData, lots: newLots })
  }

  // Mettre à jour un chapitre
  const updateChapitre = (lotIndex: number, chapitreIndex: number, field: keyof DQEChapitre, value: any) => {
    const newLots = [...(formData.lots || [])]
    newLots[lotIndex].chapitres[chapitreIndex] = {
      ...newLots[lotIndex].chapitres[chapitreIndex],
      [field]: value,
    }
    setFormData({ ...formData, lots: newLots })
  }

  // Ajouter un poste
  const addPoste = (lotIndex: number, chapitreIndex: number) => {
    const chapitre = formData.lots?.[lotIndex]?.chapitres?.[chapitreIndex]
    if (!chapitre) return

    const newPoste: DQEPoste = {
      id: `poste-${Date.now()}`,
      code: `${chapitre.code}.${(chapitre.postes?.length || 0) + 1}`,
      designation: "",
      unite: "m²",
      quantite: 0,
      prixUnitaireHT: 0,
      totalRevenueHT: 0,
    }

    const newLots = [...(formData.lots || [])]
    newLots[lotIndex].chapitres[chapitreIndex] = {
      ...chapitre,
      postes: [...(chapitre.postes || []), newPoste],
    }
    setFormData({ ...formData, lots: newLots })
  }

  // Supprimer un poste
  const removePoste = (lotIndex: number, chapitreIndex: number, posteIndex: number) => {
    const newLots = [...(formData.lots || [])]
    const chapitre = newLots[lotIndex].chapitres[chapitreIndex]
    chapitre.postes = chapitre.postes.filter((_, i) => i !== posteIndex)
    setFormData({ ...formData, lots: newLots })
  }

  // Mettre à jour un poste
  const updatePoste = (
    lotIndex: number,
    chapitreIndex: number,
    posteIndex: number,
    field: keyof DQEPoste,
    value: any,
  ) => {
    const newLots = [...(formData.lots || [])]
    const poste = newLots[lotIndex].chapitres[chapitreIndex].postes[posteIndex]
    newLots[lotIndex].chapitres[chapitreIndex].postes[posteIndex] = {
      ...poste,
      [field]: value,
    }
    setFormData({ ...formData, lots: newLots })
  }

  const handleSubmit = () => {
    const selectedClient = mockClients.find((c) => c.id === formData.clientId)

    const dqeData: Partial<DQE> = {
      ...formData,
      clientName: selectedClient?.company || selectedClient?.name || formData.clientName,
      totalRevenueHT: totalHT,
      tauxTVA: tauxTVA,
      montantTVA: montantTVA,
      totalTTC: totalTTC,
      nombreLots: formData.lots?.length || 0,
    }
    onSubmit(dqeData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full h-[98vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {editData ? "Modifier le DQE" : "Créer un nouveau DQE"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-50 hover:scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900/20">
          {/* Section 1: Informations générales */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du projet *</Label>
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
                  value={formData.clientId}
                  onValueChange={(value) => {
                    const selectedClient = mockClients.find((c) => c.id === value)
                    setFormData({
                      ...formData,
                      clientId: value,
                      clientName: selectedClient?.company || selectedClient?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={formData.statut}
                  onValueChange={(value: any) => setFormData({ ...formData, statut: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="validé">Validé</SelectItem>
                  </SelectContent>
                </Select>
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
          </Card>

          {/* Section 2: Lots, Chapitres et Postes */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Structure du DQE</h3>
              <Button onClick={addLot} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un lot
              </Button>
            </div>

            {formData.lots && formData.lots.length > 0 ? (
              <Accordion type="multiple" className="space-y-4">
                {formData.lots.map((lot, lotIndex) => (
                  <AccordionItem key={lot.id} value={lot.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-blue-600">{lot.code}</span>
                          <span className="font-medium">{lot.nom || "Sans nom"}</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(calculateLotTotal(lot))}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="space-y-2">
                            <Label>Code du lot</Label>
                            <Input
                              value={lot.code}
                              onChange={(e) => updateLot(lotIndex, "code", e.target.value)}
                              placeholder="LOT1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nom du lot *</Label>
                            <Input
                              value={lot.nom}
                              onChange={(e) => updateLot(lotIndex, "nom", e.target.value)}
                              placeholder="Ex: TERRASSEMENTS"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Input
                              value={lot.description}
                              onChange={(e) => updateLot(lotIndex, "description", e.target.value)}
                              placeholder="Description du lot"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => addChapitre(lotIndex)} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un chapitre
                          </Button>
                          <Button onClick={() => removeLot(lotIndex)} size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer le lot
                          </Button>
                        </div>

                        {lot.chapitres && lot.chapitres.length > 0 && (
                          <div className="space-y-3 ml-4">
                            {lot.chapitres.map((chapitre, chapitreIndex) => (
                              <div key={chapitre.id} className="border-l-2 border-green-500 pl-4">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-green-600">{chapitre.code}</span>
                                      <span className="font-medium">{chapitre.nom || "Sans nom"}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatCurrency(calculateChapitreTotal(chapitre))}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Code du chapitre</Label>
                                      <Input
                                        value={chapitre.code}
                                        onChange={(e) =>
                                          updateChapitre(lotIndex, chapitreIndex, "code", e.target.value)
                                        }
                                        placeholder="LOT1.1"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Nom du chapitre *</Label>
                                      <Input
                                        value={chapitre.nom}
                                        onChange={(e) => updateChapitre(lotIndex, chapitreIndex, "nom", e.target.value)}
                                        placeholder="Ex: Déblais"
                                      />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                      <Label>Description</Label>
                                      <Input
                                        value={chapitre.description}
                                        onChange={(e) =>
                                          updateChapitre(lotIndex, chapitreIndex, "description", e.target.value)
                                        }
                                        placeholder="Description du chapitre"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => addPoste(lotIndex, chapitreIndex)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Ajouter un poste
                                    </Button>
                                    <Button
                                      onClick={() => removeChapitre(lotIndex, chapitreIndex)}
                                      size="sm"
                                      variant="destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer le chapitre
                                    </Button>
                                  </div>

                                  {chapitre.postes && chapitre.postes.length > 0 && (
                                    <div className="space-y-2 ml-4">
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                              <th className="px-2 py-2 text-left">Code</th>
                                              <th className="px-2 py-2 text-left">Désignation</th>
                                              <th className="px-2 py-2 text-left">Unité</th>
                                              <th className="px-2 py-2 text-right">Quantité</th>
                                              <th className="px-2 py-2 text-right">Prix Unit. HT</th>
                                              <th className="px-2 py-2 text-right">Total HT</th>
                                              <th className="px-2 py-2 text-center">Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {chapitre.postes.map((poste, posteIndex) => (
                                              <tr key={poste.id} className="border-b">
                                                <td className="px-2 py-2">
                                                  <Input
                                                    value={poste.code}
                                                    onChange={(e) =>
                                                      updatePoste(
                                                        lotIndex,
                                                        chapitreIndex,
                                                        posteIndex,
                                                        "code",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-24"
                                                    placeholder="LOT1.1.1"
                                                  />
                                                </td>
                                                <td className="px-2 py-2">
                                                  <Input
                                                    value={poste.designation}
                                                    onChange={(e) =>
                                                      updatePoste(
                                                        lotIndex,
                                                        chapitreIndex,
                                                        posteIndex,
                                                        "designation",
                                                        e.target.value,
                                                      )
                                                    }
                                                    placeholder="Désignation"
                                                  />
                                                </td>
                                                <td className="px-2 py-2">
                                                  <Select
                                                    value={poste.unite}
                                                    onValueChange={(value) =>
                                                      updatePoste(lotIndex, chapitreIndex, posteIndex, "unite", value)
                                                    }
                                                  >
                                                    <SelectTrigger className="w-20">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {UNITES.map((unite) => (
                                                        <SelectItem key={unite} value={unite}>
                                                          {unite}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </td>
                                                <td className="px-2 py-2">
                                                  <Input
                                                    type="number"
                                                    value={poste.quantite}
                                                    onChange={(e) =>
                                                      updatePoste(
                                                        lotIndex,
                                                        chapitreIndex,
                                                        posteIndex,
                                                        "quantite",
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-24 text-right"
                                                    min="0"
                                                    step="0.01"
                                                  />
                                                </td>
                                                <td className="px-2 py-2">
                                                  <Input
                                                    type="number"
                                                    value={poste.prixUnitaireHT}
                                                    onChange={(e) =>
                                                      updatePoste(
                                                        lotIndex,
                                                        chapitreIndex,
                                                        posteIndex,
                                                        "prixUnitaireHT",
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-32 text-right"
                                                    min="0"
                                                    step="1"
                                                  />
                                                </td>
                                                <td className="px-2 py-2 text-right font-semibold">
                                                  {formatCurrency(calculatePosteTotal(poste))}
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                  <Button
                                                    onClick={() => removePoste(lotIndex, chapitreIndex, posteIndex)}
                                                    size="sm"
                                                    variant="ghost"
                                                  >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                  </Button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun lot ajouté. Cliquez sur "Ajouter un lot" pour commencer.
              </div>
            )}
          </Card>

          {/* Section 3: Récapitulatif financier */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h3 className="text-lg font-semibold mb-4">Récapitulatif financier</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total HT :</span>
                <span className="font-bold text-blue-600">{formatCurrency(totalHT)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">TVA ({tauxTVA}%) :</span>
                <span className="font-semibold">{formatCurrency(montantTVA)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center text-xl">
                <span className="font-bold">Total TTC :</span>
                <span className="font-bold text-green-600">{formatCurrency(totalTTC)}</span>
              </div>
              <div className="text-sm text-muted-foreground">Nombre de lots : {formData.lots?.length || 0}</div>
            </div>
          </Card>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.nom || !formData.clientId}>
            {editData ? "Mettre à jour" : "Créer le DQE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
