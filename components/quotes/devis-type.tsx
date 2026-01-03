"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Wrench, Check } from "lucide-react"

interface DevisTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectType: (type: 'technique' | 'classique') => void
}

export function DevisTypeModal({ open, onOpenChange, onSelectType }: DevisTypeModalProps) {
  const handleSelect = (type: 'technique' | 'classique') => {
    onSelectType(type)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choisir le type de devis</DialogTitle>
          <DialogDescription>
            Sélectionnez le format de devis qui correspond à vos besoins
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* Devis Technique */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group"
            onClick={() => handleSelect('technique')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl mt-4">Devis Technique</CardTitle>
              <CardDescription>
                Format détaillé avec sections et spécifications techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Caractéristiques :
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Organisation par sections (Restauration, Office, Bureau...)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Détails techniques (dimensions L×H, type d'élément)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Qualité matériel et type de vitrage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Chantier et contact projet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Gestion des remises (% et valeur)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-primary">
                  ✨ Recommandé pour les projets de menuiserie aluminium
                </p>
              </div>

              <Button 
                className="w-full mt-4" 
                size="lg"
                onClick={() => handleSelect('technique')}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Créer un devis technique
              </Button>
            </CardContent>
          </Card>

          {/* Devis Classique */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group"
            onClick={() => handleSelect('classique')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl mt-4">Devis Classique</CardTitle>
              <CardDescription>
                Format simple et rapide pour devis standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Caractéristiques :
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Liste simple de lignes de devis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Saisie rapide et intuitive</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Calcul automatique des montants</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Format épuré et professionnel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Idéal pour devis simples</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-blue-600">
                  ⚡ Parfait pour les devis rapides et simples
                </p>
              </div>

              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
                size="lg"
                onClick={() => handleSelect('classique')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Créer un devis classique
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          💡 Astuce : Vous pouvez changer de type de devis à tout moment depuis la liste des devis
        </div>
      </DialogContent>
    </Dialog>
  )
}