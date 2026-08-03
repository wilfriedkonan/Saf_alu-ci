"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Check, ChevronsUpDown, Loader2, Building2, FolderKanban, Layers, X as XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useArticlesList } from "@/hooks/useStock"
import { useProjetsByChefProjet } from "@/hooks/useProjet"
import { useAuth } from "@/contexts/AuthContext"
import { getRoleLabel } from "@/types/Utilisateurs"
import type { Article, CreateDemandeRequest } from "@/types/stock"

interface ArticleLigne {
  id: string
  articleId?: number
  article?: Article
  isHorsCatalogue: boolean
  designationLibre: string
  unite: string
  quantiteDemandee: number
  notes: string
}

interface DemandeFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateDemandeRequest) => void
}

export function DemandeFormSheet({ open, onOpenChange, onSubmit }: DemandeFormSheetProps) {
  const { user } = useAuth()
  const { items: catalogueArticles } = useArticlesList({ page: 1, pageSize: 200 })
  const { projets, loading: projetsLoading } = useProjetsByChefProjet(user?.Id ?? null)

  const nomDemandeur = user ? `${user.Prenom ?? ""} ${user.Nom ?? ""}`.trim() : ""
  const posteDemandeur = user?.Role?.Nom ? getRoleLabel(user.Role.Nom) : ""

  const [typeDestination, setTypeDestination] = useState<"Administration" | "Projet">("Administration")
  const [projetId, setProjetId] = useState("")
  const [etapeProjetId, setEtapeProjetId] = useState("")
  const [projetOpen, setProjetOpen] = useState(false)
  const [etapeOpen, setEtapeOpen] = useState(false)
  const [motifDemande, setMotifDemande] = useState("")
  const [lignes, setLignes] = useState<ArticleLigne[]>([
    { id: "1", isHorsCatalogue: false, designationLibre: "", unite: "", quantiteDemandee: 1, notes: "" }
  ])

  const selectedProject = useMemo(
    () => projets.find(p => String(p.id) === projetId),
    [projets, projetId]
  )
  const etapes = useMemo(
    () => (selectedProject?.etapes ?? []).filter(e => e.typeEtape === "Lot"),
    [selectedProject]
  )
  const selectedEtape = useMemo(
    () => etapes.find(e => String(e.id) === etapeProjetId),
    [etapes, etapeProjetId]
  )

  useEffect(() => {
    if (!open) {
      setTypeDestination("Administration")
      setProjetId("")
      setEtapeProjetId("")
      setMotifDemande("")
      setLignes([{ id: "1", isHorsCatalogue: false, designationLibre: "", unite: "", quantiteDemandee: 1, notes: "" }])
    }
  }, [open])

  const handleAddLigne = () => {
    setLignes([
      ...lignes,
      { id: Date.now().toString(), isHorsCatalogue: false, designationLibre: "", unite: "", quantiteDemandee: 1, notes: "" }
    ])
  }

  const handleRemoveLigne = (id: string) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter(l => l.id !== id))
    }
  }

  const handleLigneChange = (id: string, field: keyof ArticleLigne, value: unknown) => {
    setLignes(lignes.map(l => {
      if (l.id !== id) return l
      if (field === "articleId" && typeof value === "number") {
        const article = catalogueArticles.find(a => a.id === value)
        return { ...l, articleId: value, article, unite: article?.unite || "" }
      }
      return { ...l, [field]: value }
    }))
  }

  const handleSubmit = () => {
    const data: CreateDemandeRequest = {
      nomDemandeur,
      posteDemandeur: posteDemandeur || undefined,
      typeDestination,
      projetId: typeDestination === "Projet" && projetId ? Number(projetId) || undefined : undefined,
      etapeProjetId: typeDestination === "Projet" && etapeProjetId ? Number(etapeProjetId) || undefined : undefined,
      motifDemande,
      utilisateurId: user?.Id,
      DemandeurId: user?.Id ?? 0,
      articles: lignes.map(l => ({
        articleId: l.isHorsCatalogue ? undefined : l.articleId,
        designation: l.article?.Nom ?? l.article?.description,
        designationLibre: l.isHorsCatalogue ? l.designationLibre : undefined,
        isHorsCatalogue : l.isHorsCatalogue ? true : false,
        unite: l.unite,
        quantiteDemandee: l.quantiteDemandee,
        notes: l.notes || undefined,
      })),
    }
    onSubmit(data)
  }

  const isValid = nomDemandeur && motifDemande &&
    lignes.every(l => (l.isHorsCatalogue ? l.designationLibre : l.articleId) && l.unite && l.quantiteDemandee > 0) &&
    (typeDestination === "Administration" || (projetId && etapeProjetId))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <div className="flex-none px-6 py-5 border-b border-gray-200">
          <SheetTitle className="text-lg font-semibold text-gray-900">Nouvelle demande de stock</SheetTitle>
          <SheetDescription className="mt-0.5 text-sm text-gray-500">
            Remplissez le formulaire pour soumettre une nouvelle demande de materiel.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 sidebar-nav">
          {/* Informations demandeur */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informations demandeur</h3>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-sm font-semibold select-none">
                {nomDemandeur
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0].toUpperCase())
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{nomDemandeur}</p>
                {posteDemandeur && (
                  <p className="truncate text-xs text-gray-500">{posteDemandeur}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 ring-1 ring-blue-200">
                Connecté
              </span>
            </div>
          </div>

          {/* Destination */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Destination</h3>

            {/* Toggle cards Administration / Projet */}
            <div className="grid grid-cols-2 gap-3">
              {(["Administration", "Projet"] as const).map((type) => {
                const active = typeDestination === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTypeDestination(type)
                      setProjetId("")
                      setEtapeProjetId("")
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                      active
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      active ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {type === "Administration" ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <FolderKanban className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", active ? "text-[#1e3a5f]" : "text-gray-700")}>
                        {type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {type === "Administration" ? "Usage interne" : "Chantier / projet"}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Sélection projet */}
            {typeDestination === "Projet" && (
              <div className="space-y-3">

                {/* Select projet */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Projet <span className="text-red-500">*</span>
                  </Label>
                  {projetsLoading ? (
                    <div className="flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement des projets…
                    </div>
                  ) : projets.length === 0 ? (
                    <div className="flex h-10 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-sm text-amber-600">
                      <FolderKanban className="h-4 w-4 shrink-0" />
                      Aucun projet assigné
                    </div>
                  ) : (
                    <Popover open={projetOpen} onOpenChange={setProjetOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={projetOpen}
                          className="w-full justify-between h-10 font-normal"
                        >
                          {selectedProject ? (
                            <span className="truncate flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-400">{selectedProject.numero}</span>
                              <span className="font-medium text-gray-800">{selectedProject.nom}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Sélectionner un projet…</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher par nom ou numéro…" className="h-9" />
                          <CommandList className="max-h-[264px] overflow-y-auto overflow-x-auto">
                            <CommandEmpty>Aucun projet trouvé.</CommandEmpty>
                            <CommandGroup>
                              {projets.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={`${p.numero} ${p.nom}`}
                                  onSelect={() => {
                                    setProjetId(String(p.id))
                                    setEtapeProjetId("")
                                    setProjetOpen(false)
                                  }}
                                  className="flex items-center gap-3 py-2.5 pr-3"
                                >
                                  <Check className={cn("h-4 w-4 shrink-0 text-[#1e3a5f]", projetId === String(p.id) ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[11px] text-gray-400 whitespace-nowrap">{p.numero}</span>
                                      <span className="font-medium text-sm text-gray-800 whitespace-nowrap">{p.nom}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {p.client?.nom && <span className="text-xs text-gray-400 whitespace-nowrap">{p.client.nom}</span>}
                                      <span className={cn(
                                        "shrink-0 rounded-full px-1.5 py-0 text-[10px] font-semibold",
                                        p.statut === "EnCours" ? "bg-green-100 text-green-700" :
                                        p.statut === "Planification" ? "bg-blue-50 text-blue-600" :
                                        p.statut === "Suspendu" ? "bg-amber-100 text-amber-700" :
                                        "bg-gray-100 text-gray-500"
                                      )}>
                                        {p.statut === "EnCours" ? "En cours" : p.statut}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Carte récap projet sélectionné */}
                {selectedProject && (
                  <div className="flex items-start gap-3 rounded-lg border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 px-4 py-3">
                    <FolderKanban className="mt-0.5 h-4 w-4 shrink-0 text-[#1e3a5f]" />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-[#1e3a5f]">{selectedProject.nom}</p>
                      <p className="text-xs text-gray-500">
                        {selectedProject.client?.nom ?? `Client #${selectedProject.clientId}`}
                        {" · "}
                        <span className={cn(
                          "font-medium",
                          selectedProject.statut === "EnCours" ? "text-green-600" :
                          selectedProject.statut === "Planification" ? "text-blue-600" :
                          selectedProject.statut === "Suspendu" ? "text-amber-600" : "text-gray-500"
                        )}>
                          {selectedProject.statut}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setProjetId(""); setEtapeProjetId("") }}
                      className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-[#1e3a5f]/10 hover:text-[#1e3a5f]"
                      aria-label="Désélectionner le projet"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Select étape — visible seulement si projet sélectionné */}
                {projetId && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Étape de réalisation <span className="text-red-500">*</span>
                    </Label>
                    {etapes.length === 0 ? (
                      <div className="flex h-10 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-sm text-amber-600">
                        <Layers className="h-4 w-4 shrink-0" />
                        Aucune étape définie pour ce projet
                      </div>
                    ) : (
                      <Popover open={etapeOpen} onOpenChange={setEtapeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={etapeOpen}
                            className="w-full justify-between h-10 font-normal"
                          >
                            {selectedEtape ? (
                              <span className="flex items-center gap-2 truncate">
                                <span className={cn(
                                  "shrink-0 rounded px-1.5 py-0 text-[10px] font-semibold uppercase",
                                  selectedEtape.statut === "EnCours" ? "bg-green-100 text-green-700" :
                                  selectedEtape.statut === "Termine" ? "bg-gray-100 text-gray-500" :
                                  selectedEtape.statut === "Suspendu" ? "bg-amber-100 text-amber-700" :
                                  "bg-blue-50 text-blue-600"
                                )}>
                                  {selectedEtape.statut === "NonCommence" ? "À faire" : selectedEtape.statut}
                                </span>
                                <span className="truncate font-medium text-gray-800">{selectedEtape.nom}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Sélectionner une étape…</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une étape…" className="h-9" />
                            <CommandList className="max-h-[264px] overflow-y-auto overflow-x-auto">
                              <CommandEmpty>Aucune étape trouvée.</CommandEmpty>
                              <CommandGroup>
                                {etapes.map((e) => (
                                  <CommandItem
                                    key={e.id}
                                    value={e.nom}
                                    onSelect={() => { setEtapeProjetId(String(e.id)); setEtapeOpen(false) }}
                                    className="flex items-center gap-3 py-2.5 pr-3"
                                  >
                                    <Check className={cn("h-4 w-4 shrink-0 text-[#1e3a5f]", etapeProjetId === String(e.id) ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "shrink-0 rounded px-1.5 py-0 text-[10px] font-semibold uppercase",
                                          e.statut === "EnCours" ? "bg-green-100 text-green-700" :
                                          e.statut === "Termine" ? "bg-gray-100 text-gray-500" :
                                          e.statut === "Suspendu" ? "bg-amber-100 text-amber-700" :
                                          "bg-blue-50 text-blue-600"
                                        )}>
                                          {e.statut === "NonCommence" ? "À faire" : e.statut}
                                        </span>
                                        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{e.nom}</span>
                                      </div>
                                      {(e.dateFinPrevue || e.pourcentageAvancement > 0) && (
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 whitespace-nowrap">
                                          {e.dateFinPrevue && <span>Fin : {new Date(e.dateFinPrevue).toLocaleDateString("fr-FR")}</span>}
                                          {e.pourcentageAvancement > 0 && <span>{e.pourcentageAvancement}% réalisé</span>}
                                        </div>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Récap étape sélectionnée */}
                    {selectedEtape && (
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        <Layers className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="font-medium">{selectedEtape.nom}</span>
                        {selectedEtape.dateFinPrevue && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>Fin prévue : {new Date(selectedEtape.dateFinPrevue).toLocaleDateString("fr-FR")}</span>
                          </>
                        )}
                        {selectedEtape.pourcentageAvancement > 0 && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>{selectedEtape.pourcentageAvancement}%</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="motif">Motif de la demande *</Label>
            <Textarea
              id="motif"
              value={motifDemande}
              onChange={(e) => setMotifDemande(e.target.value)}
              placeholder="Decrivez le besoin et la justification de cette demande..."
              rows={3}
            />
          </div>

          {/* Articles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">Articles demandes</h3>
            <div className="space-y-4">
              {lignes.map((ligne, index) => (
                <div key={ligne.id} className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Article {index + 1}</span>
                    {lignes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLigne(ligne.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`hors-catalogue-${ligne.id}`}
                      checked={ligne.isHorsCatalogue}
                      onCheckedChange={(checked) => handleLigneChange(ligne.id, "isHorsCatalogue", checked)}
                    />
                    <Label htmlFor={`hors-catalogue-${ligne.id}`} className="text-sm">Article hors catalogue</Label>
                  </div>

                  {ligne.isHorsCatalogue ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Designation *</Label>
                        <Input
                          value={ligne.designationLibre}
                          onChange={(e) => handleLigneChange(ligne.id, "designationLibre", e.target.value)}
                          placeholder="Nom de l'article"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unite *</Label>
                        <Input
                          value={ligne.unite}
                          onChange={(e) => handleLigneChange(ligne.id, "unite", e.target.value)}
                          placeholder="Ex: Piece, ML, M2..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Article du catalogue *</Label>
                      <ArticleCombobox
                        value={ligne.articleId}
                        articles={catalogueArticles}
                        onValueChange={(value) => handleLigneChange(ligne.id, "articleId", value)}
                      />
                      {ligne.article && (
                        <p className="text-xs text-gray-500">
                          Unite: {ligne.article.unite} | Ref: {ligne.article.articleReference || ligne.article.code}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantite demandee *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ligne.quantiteDemandee}
                        onChange={(e) => handleLigneChange(ligne.id, "quantiteDemandee", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optionnel)</Label>
                      <Input
                        value={ligne.notes}
                        onChange={(e) => handleLigneChange(ligne.id, "notes", e.target.value)}
                        placeholder="Precision supplementaire"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={handleAddLigne} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un article
            </Button>
          </div>
        </div>

        <div className="flex-none px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
          >
            Soumettre la demande
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ArticleCombobox({
  value,
  articles,
  onValueChange,
}: {
  value?: number
  articles: Article[]
  onValueChange: (value: number | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedArticle = articles.find(a => a.id === value)
  const displayName = (a: Article) => a.Nom || a.description || a.articleReference || a.reference || a.code || ""

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 font-normal"
          >
            {selectedArticle ? (
              <span className="truncate text-gray-800">{displayName(selectedArticle)}</span>
            ) : (
              <span className="text-muted-foreground">Rechercher un article…</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Désignation, référence, catégorie…" className="h-9" />
            <CommandList className="max-h-[264px] overflow-y-auto overflow-x-auto">
              <CommandEmpty>Aucun article trouvé.</CommandEmpty>
              <CommandGroup heading="Catalogue">
                {articles.map((article) => (
                  <CommandItem
                    key={article.id}
                    value={`${displayName(article)} ${article.reference ?? ""} ${article.categorie?.nom ?? ""}`}
                    onSelect={() => { onValueChange(article.id); setOpen(false) }}
                    className="flex items-center gap-3 py-2.5 pr-3"
                  >
                    <Check className={cn("h-4 w-4 shrink-0 text-[#1e3a5f]", value === article.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {article.categorie?.nom && (
                          <span className="shrink-0 rounded px-1.5 py-0 text-[10px] font-semibold bg-gray-100 text-gray-500 uppercase whitespace-nowrap">
                            {article.categorie.nom}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{displayName(article)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 whitespace-nowrap">
                        {article.reference && <span className="font-mono">{article.reference}</span>}
                        <span>·</span>
                        <span>{article.unite}</span>
                        {article.prixUnitaire != null && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-gray-500">{article.prixUnitaire.toLocaleString("fr-FR")} F CFA</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Carte récap article sélectionné */}
      {selectedArticle && (
        <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-700">{displayName(selectedArticle)}</p>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
              {selectedArticle.reference && <span className="font-mono">{selectedArticle.reference}</span>}
              <span>·</span>
              <span>{selectedArticle.unite}</span>
              {selectedArticle.prixUnitaire != null && (
                <>
                  <span>·</span>
                  <span>{selectedArticle.prixUnitaire.toLocaleString("fr-FR")} F CFA</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onValueChange(undefined)}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label="Retirer l'article"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
