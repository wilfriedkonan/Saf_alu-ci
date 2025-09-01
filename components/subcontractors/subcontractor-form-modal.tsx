"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import type { SubcontractorSpecialty } from "@/lib/subcontractors"

interface SubcontractorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subcontractor: any) => void
}

export function SubcontractorFormModal({ isOpen, onClose, onSubmit }: SubcontractorFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    siret: "",
    description: "",
    website: "",
  })

  const [specialties, setSpecialties] = useState<SubcontractorSpecialty[]>([])
  const [newSpecialty, setNewSpecialty] = useState<SubcontractorSpecialty | "">("")

  const availableSpecialties: SubcontractorSpecialty[] = [
    "electricite",
    "plomberie",
    "peinture",
    "carrelage",
    "menuiserie",
    "couverture",
    "isolation",
    "chauffage",
    "climatisation",
    "terrassement",
  ]

  const specialtyLabels: Record<SubcontractorSpecialty, string> = {
    electricite: "Électricité",
    plomberie: "Plomberie",
    peinture: "Peinture",
    carrelage: "Carrelage",
    menuiserie: "Menuiserie",
    couverture: "Couverture",
    isolation: "Isolation",
    chauffage: "Chauffage",
    climatisation: "Climatisation",
    terrassement: "Terrassement",
  }

  const addSpecialty = () => {
    if (newSpecialty && !specialties.includes(newSpecialty as SubcontractorSpecialty)) {
      setSpecialties([...specialties, newSpecialty as SubcontractorSpecialty])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: SubcontractorSpecialty) => {
    setSpecialties(specialties.filter((s) => s !== specialty))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subcontractor = {
      ...formData,
      specialties,
      averageRating: 0,
      totalProjects: 0,
      completedProjects: 0,
      onTimeDelivery: 0,
      evaluations: [],
      projects: [],
      documents: [],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    onSubmit(subcontractor)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[95vw] lg:max-w-[80vw] xl:max-w-[70vw] h-[95vh] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Nouveau Sous-traitant</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-50 hover:scrollbar-thumb-green-500 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900/20 dark:hover:scrollbar-thumb-green-500">
            <form onSubmit={handleSubmit} className="space-y-6 pb-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name">Nom de l'entreprise</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="siret">SIRET</Label>
                      <Input
                        id="siret"
                        value={formData.siret}
                        onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Description des services et compétences..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Spécialités */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spécialités</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={newSpecialty} onValueChange={setNewSpecialty}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sélectionner une spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSpecialties
                          .filter((specialty) => !specialties.includes(specialty))
                          .map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialtyLabels[specialty]}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addSpecialty} disabled={!newSpecialty}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                        {specialtyLabels[specialty]}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {specialties.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucune spécialité sélectionnée. Ajoutez au moins une spécialité.
                    </p>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="border-t px-6 py-4 flex justify-end space-x-3 flex-shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={specialties.length === 0}>
              Créer le sous-traitant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
