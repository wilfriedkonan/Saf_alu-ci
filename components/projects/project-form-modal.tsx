"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { ProjectPriority, ProjectStatus } from "@/lib/projects"

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (project: any) => void
}

interface ProjectStage {
  name: string
  description: string
  startDate: Date | undefined
  endDate: Date | undefined
  assignedTo: string
  estimatedHours: number
}

export function ProjectFormModal({ open, onOpenChange, onSubmit }: ProjectFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    status: "planification" as ProjectStatus,
    priority: "normale" as ProjectPriority,
    budget: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    projectManager: "",
    workers: [] as string[],
    notes: "",
  })

  const [stages, setStages] = useState<ProjectStage[]>([
    {
      name: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      assignedTo: "",
      estimatedHours: 0,
    },
  ])

  const [newWorker, setNewWorker] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const projectData = {
      ...formData,
      budget: Number.parseFloat(formData.budget) || 0,
      stages: stages.filter((stage) => stage.name.trim() !== ""),
      team: {
        projectManager: formData.projectManager,
        workers: formData.workers,
        subcontractors: [],
      },
    }

    onSubmit(projectData)
    onOpenChange(false)

    // Reset form
    setFormData({
      name: "",
      description: "",
      client: { name: "", email: "", phone: "", address: "" },
      status: "planification",
      priority: "normale",
      budget: "",
      startDate: undefined,
      endDate: undefined,
      projectManager: "",
      workers: [],
      notes: "",
    })
    setStages([
      {
        name: "",
        description: "",
        startDate: undefined,
        endDate: undefined,
        assignedTo: "",
        estimatedHours: 0,
      },
    ])
  }

  const addWorker = () => {
    if (newWorker.trim() && !formData.workers.includes(newWorker.trim())) {
      setFormData((prev) => ({
        ...prev,
        workers: [...prev.workers, newWorker.trim()],
      }))
      setNewWorker("")
    }
  }

  const removeWorker = (worker: string) => {
    setFormData((prev) => ({
      ...prev,
      workers: prev.workers.filter((w) => w !== worker),
    }))
  }

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        startDate: undefined,
        endDate: undefined,
        assignedTo: "",
        estimatedHours: 0,
      },
    ])
  }

  const removeStage = (index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index))
  }

  const updateStage = (index: number, field: keyof ProjectStage, value: any) => {
    setStages((prev) => prev.map((stage, i) => (i === index ? { ...stage, [field]: value } : stage)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">Nouveau Projet</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du projet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Rénovation Villa Cocody"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as ProjectStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planification">Planification</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="en_retard">En retard</SelectItem>
                        <SelectItem value="termine">Terminé</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, priority: value as ProjectPriority }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basse">Basse</SelectItem>
                        <SelectItem value="normale">Normale</SelectItem>
                        <SelectItem value="haute">Haute</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du projet..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="clientName">Nom du client *</Label>
                    <Input
                      id="clientName"
                      value={formData.client.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client: { ...prev.client, name: e.target.value },
                        }))
                      }
                      placeholder="Nom du client"
                      required
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.client.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client: { ...prev.client, email: e.target.value },
                        }))
                      }
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Téléphone</Label>
                    <Input
                      id="clientPhone"
                      value={formData.client.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client: { ...prev.client, phone: e.target.value },
                        }))
                      }
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Adresse</Label>
                    <Input
                      id="clientAddress"
                      value={formData.client.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client: { ...prev.client, address: e.target.value },
                        }))
                      }
                      placeholder="Adresse du client"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget et dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget et planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (FCFA)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate
                            ? format(formData.startDate, "PPP", { locale: fr })
                            : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin prévue</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Équipe */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Équipe du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectManager">Chef de projet</Label>
                    <Select
                      value={formData.projectManager}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, projectManager: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un chef de projet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marie Dubois">Marie Dubois</SelectItem>
                        <SelectItem value="Jean Kouame">Jean Kouame</SelectItem>
                        <SelectItem value="Paul Traore">Paul Traore</SelectItem>
                        <SelectItem value="Aya Diallo">Aya Diallo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ouvriers</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newWorker}
                        onChange={(e) => setNewWorker(e.target.value)}
                        placeholder="Nom de l'ouvrier"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addWorker())}
                      />
                      <Button type="button" onClick={addWorker} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.workers.map((worker, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {worker}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeWorker(worker)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Étapes du projet */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Étapes du projet</CardTitle>
                <Button type="button" onClick={addStage} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une étape
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Étape {index + 1}</h4>
                      {stages.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeStage(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nom de l'étape</Label>
                        <Input
                          value={stage.name}
                          onChange={(e) => updateStage(index, "name", e.target.value)}
                          placeholder="Ex: Démolition"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Assigné à</Label>
                        <Select
                          value={stage.assignedTo}
                          onValueChange={(value) => updateStage(index, "assignedTo", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Marie Dubois">Marie Dubois</SelectItem>
                            <SelectItem value="Jean Kouame">Jean Kouame</SelectItem>
                            <SelectItem value="Paul Traore">Paul Traore</SelectItem>
                            <SelectItem value="Aya Diallo">Aya Diallo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Heures estimées</Label>
                        <Input
                          type="number"
                          value={stage.estimatedHours}
                          onChange={(e) => updateStage(index, "estimatedHours", Number.parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={stage.description}
                        onChange={(e) => updateStage(index, "description", e.target.value)}
                        placeholder="Description de l'étape..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date de début</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !stage.startDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {stage.startDate ? format(stage.startDate, "PPP", { locale: fr }) : "Sélectionner"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={stage.startDate}
                              onSelect={(date) => updateStage(index, "startDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Date de fin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !stage.endDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {stage.endDate ? format(stage.endDate, "PPP", { locale: fr }) : "Sélectionner"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={stage.endDate}
                              onSelect={(date) => updateStage(index, "endDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes additionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes, remarques ou informations supplémentaires..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Créer le projet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
