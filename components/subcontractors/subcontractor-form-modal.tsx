"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { useCreateSpecialite, useSpecialiteList } from "@/hooks/useSoustraitant"
import { toast } from "@/hooks/use-toast"

interface SubcontractorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subcontractor: any) => Promise<void>
  editData?: any
}

export function SubcontractorFormModal({ isOpen, onClose, onSubmit, editData }: SubcontractorFormModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    raisonSociale: "",
    ncc: "",
    email: "",
    telephone: "",
    ville: "",
    adresse: "",
    contactNom: "",
    contactEmail: "",
    contactTelephone: "",
  })

  const [specialties, setSpecialties] = useState<string[]>([])
  const [newSpecialty, setNewSpecialty] = useState("")
  const [isCreateSpecialtyOpen, setIsCreateSpecialtyOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [specialtyForm, setSpecialtyForm] = useState({ nom: "", designation: "" })
  const { createSpecialite, loading: isCreatingSpecialite } = useCreateSpecialite()
  const { specialite: apiSpecialites } = useSpecialiteList()

  const defaultSpecialties: string[] = [
    "electricite",
    "plomberie",
    "maconnerie",
    "peinture",
    "carrelage",
    "menuiserie",
    "toiture",
    "climatisation",
    "securite",
    "jardinage",
    "couverture",
    "isolation",
    "chauffage",
    "terrassement"
  ]

  const specialtyLabels: Record<string, string> = {
    electricite: "Électricité",
    plomberie: "Plomberie",
    maconnerie: "Maçonnerie",
    peinture: "Peinture",
    carrelage: "Carrelage",
    menuiserie: "Menuiserie",
    toiture: "Toiture",
    climatisation: "Climatisation",
    securite: "Sécurité",
    jardinage: "Jardinage",
    couverture: "Couverture",
    isolation: "Isolation",
    chauffage: "Chauffage",
    terrassement: "Terrassement",
  }

  const apiSpecialtyLabels = (apiSpecialites || []).reduce<Record<string, string>>((acc, item) => {
    const key = item.nom?.trim()
    if (!key) return acc
    acc[key] = item.description?.trim() || getPrettySpecialtyName(key)
    return acc
  }, {})

  const apiSpecialtyValues = (apiSpecialites || [])
    .map((item) => item.nom?.trim())
    .filter((item): item is string => Boolean(item))

  function getPrettySpecialtyName(specialty: string) {
    return specialty
      .replace(/[_-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const getSpecialtyLabel = (specialty: string) => {
    if (specialtyLabels[specialty]) return specialtyLabels[specialty]
    if (apiSpecialtyLabels[specialty]) return apiSpecialtyLabels[specialty]
    return getPrettySpecialtyName(specialty)
  }

  const normalizeSpecialties = (rawSpecialties: unknown): string[] => {
    if (!Array.isArray(rawSpecialties)) return []

    return rawSpecialties
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object") {
          const description = (item as { description?: unknown }).description
          const name = (item as { nom?: unknown }).nom
          if (typeof description === "string") return description
          if (typeof name === "string") return name
        }
        return null
      })
      .filter((item): item is string => item !== null)
  }

  useEffect(() => {
    if (editData) {
      setFormData({
        nom: editData.nom || "",
        raisonSociale: editData.raisonSociale || "",
        ncc: editData.ncc || "",
        email: editData.email || "",
        telephone: editData.telephone || "",
        ville: editData.ville || "",
        adresse: editData.adresse || "",
        contactNom: editData.contact?.nomContact|| "",
        contactEmail: editData.contact?.emailContact || "",
        contactTelephone: editData.contact?.telephoneContact || "",
      })
      setSpecialties(normalizeSpecialties(editData?.specialites ?? editData?.specialties))
    } else {
      setFormData({
        nom: "",
        raisonSociale: "",
        ncc: "",
        email: "",
        telephone: "",
        ville: "",
        adresse: "",
        contactNom: "",
        contactEmail: "",
        contactTelephone: "",
      })
      setSpecialties([])
    }
  }, [editData, isOpen])

  const addSpecialty = () => {
    if (newSpecialty && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty))
  }

  const handleCreateSpecialty = async (e: React.FormEvent) => {
    e.preventDefault()
    const nom = specialtyForm.nom.trim()
    const designation = specialtyForm.designation.trim()

    if (!nom) {
      toast({
        title: "Champ requis",
        description: "Le nom de la spécialité est obligatoire.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await createSpecialite({
        nom,
        description: designation || null,
      })

      const createdSpecialty = response.data?.nom || nom
      setNewSpecialty(createdSpecialty)
      setIsCreateSpecialtyOpen(false)
      setSpecialtyForm({ nom: "", designation: "" })

      toast({
        title: "Succès",
        description: "La spécialité a été créée et sélectionnée.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la spécialité",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
console.log('formData:',formData)
console.log('specialties:',specialties)
console.log('editData:',editData)
    const subcontractor = {
      ...formData,
      ...(editData && { id: editData.id }),
      specialties,
      averageRating: editData?.averageRating || 0,
      totalProjects: editData?.totalProjects || 0,
      completedProjects: editData?.completedProjects || 0,
      onTimeDelivery: editData?.onTimeDelivery || 0,
      evaluations: editData?.evaluations || [],
      projects: editData?.projects || [],
      documents: editData?.documents || [],
      createdAt: editData?.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    try {
      setIsSubmitting(true)
      await onSubmit(subcontractor)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[95vw] lg:max-w-[80vw] xl:max-w-[70vw] h-[95vh] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">
              {editData ? "Modifier le sous-traitant" : "Nouveau Sous-traitant"}
            </DialogTitle>
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
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="siret">Ncc</Label>
                      <Input
                        id="siret"
                        value={formData.ncc}
                        onChange={(e) => setFormData({ ...formData, ncc: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Ville</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Raison sociale</Label>
                    <Input
                      id="description"
                      value={formData.raisonSociale}
                      onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                      placeholder="Raison sociale..."
                    />
                  </div>
                  </div>

               
                </CardContent>
              </Card>
              {/* Personne contact */}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personne de contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contactNom">Nom du contact</Label>
                      <Input
                        id="contactNom"
                        value={formData.contactNom}
                        onChange={(e) => setFormData({ ...formData, contactNom: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Email du contact</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactTelephone">Téléphone du contact</Label>
                      <Input
                        id="contactTelephone"
                        value={formData.contactTelephone}
                        onChange={(e) => setFormData({ ...formData, contactTelephone: e.target.value })}
                        required
                      />
                    </div>
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
                        {[...new Set([...defaultSpecialties, ...apiSpecialtyValues, ...specialties, newSpecialty].filter(Boolean))]
                          .filter((specialty) => !specialties.includes(specialty))
                          .map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {getSpecialtyLabel(specialty)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addSpecialty} disabled={!newSpecialty}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateSpecialtyOpen(true)}>
                      Ajouter spécialité
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                        {getSpecialtyLabel(specialty)}
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
            <Button type="submit" onClick={handleSubmit} disabled={specialties.length === 0 || isSubmitting}>
              {editData ? "Enregistrer les modifications" : "Créer le sous-traitant"}
            </Button>
          </div>
        </div>
      </DialogContent>
      <Dialog open={isCreateSpecialtyOpen} onOpenChange={setIsCreateSpecialtyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle spécialité</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSpecialty} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialite-nom">Nom</Label>
              <Input
                id="specialite-nom"
                value={specialtyForm.nom}
                onChange={(e) => setSpecialtyForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: domotique"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialite-designation">Désignation</Label>
              <Textarea
                id="specialite-designation"
                value={specialtyForm.designation}
                onChange={(e) => setSpecialtyForm((prev) => ({ ...prev, designation: e.target.value }))}
                placeholder="Description courte..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateSpecialtyOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isCreatingSpecialite}>
                Valider
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
