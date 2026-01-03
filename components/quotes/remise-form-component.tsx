"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Percent, Tag, Calculator, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  calculateMontantHTNet,
  calculateMontantRemiseTotal,
  calculatePourcentageEconomie,
  formatCurrency
} from "@/types/devis"

interface RemiseFormProps {
  montantHTBrut: number
  remiseValeur: number
  remisePourcentage: number
  onRemiseChange: (remiseValeur: number, remisePourcentage: number) => void
  disabled?: boolean
}

export function RemiseForm({ 
  montantHTBrut, 
  remiseValeur, 
  remisePourcentage, 
  onRemiseChange,
  disabled = false
}: RemiseFormProps) {
  const [localRemiseValeur, setLocalRemiseValeur] = useState(remiseValeur.toString())
  const [localRemisePourcentage, setLocalRemisePourcentage] = useState(remisePourcentage.toString())
  
  // Calculer les montants en temps réel
  const remiseValeurNum = parseFloat(localRemiseValeur) || 0
  const remisePourcentageNum = parseFloat(localRemisePourcentage) || 0
  
  const montantRemiseTotal = calculateMontantRemiseTotal(
    montantHTBrut,
    remiseValeurNum,
    remisePourcentageNum
  )
  
  const montantHTNet = calculateMontantHTNet(
    montantHTBrut,
    remiseValeurNum,
    remisePourcentageNum
  )
  
  const pourcentageEconomie = calculatePourcentageEconomie(
    montantHTBrut,
    montantRemiseTotal
  )
  
  const hasRemise = remiseValeurNum > 0 || remisePourcentageNum > 0
  
  // Avertissements
  const remiseTropElevee = montantRemiseTotal >= montantHTBrut
  const pourcentageTropEleve = remisePourcentageNum > 50

  useEffect(() => {
    setLocalRemiseValeur(remiseValeur.toString())
    setLocalRemisePourcentage(remisePourcentage.toString())
  }, [remiseValeur, remisePourcentage])

  const handleRemiseValeurChange = (value: string) => {
    setLocalRemiseValeur(value)
    const numValue = parseFloat(value) || 0
    onRemiseChange(numValue, remisePourcentageNum)
  }

  const handleRemisePourcentageChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    // Limiter entre 0 et 100
    if (numValue >= 0 && numValue <= 100) {
      setLocalRemisePourcentage(value)
      onRemiseChange(remiseValeurNum, numValue)
    }
  }

  const handleReset = () => {
    setLocalRemiseValeur("0")
    setLocalRemisePourcentage("0")
    onRemiseChange(0, 0)
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Remises commerciales
            </CardTitle>
            <CardDescription>
              Appliquez des remises en pourcentage et/ou en valeur
            </CardDescription>
          </div>
          {hasRemise && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Remise active
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Montant de base */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Montant HT brut</span>
          <span className="text-lg font-bold">{formatCurrency(montantHTBrut)}</span>
        </div>

        {/* Formulaire de remise */}
        <div className="grid grid-cols-2 gap-4">
          {/* Remise en pourcentage */}
          <div className="space-y-2">
            <Label htmlFor="remisePourcentage" className="flex items-center gap-1">
              <Percent className="h-4 w-4" />
              Remise en pourcentage
            </Label>
            <div className="relative">
              <Input
                id="remisePourcentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={localRemisePourcentage}
                onChange={(e) => handleRemisePourcentageChange(e.target.value)}
                disabled={disabled}
                className="pr-8"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          {/* Remise en valeur */}
          <div className="space-y-2">
            <Label htmlFor="remiseValeur" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Remise forfaitaire
            </Label>
            <div className="relative">
              <Input
                id="remiseValeur"
                type="number"
                min="0"
                step="1000"
                value={localRemiseValeur}
                onChange={(e) => handleRemiseValeurChange(e.target.value)}
                disabled={disabled}
                className="pr-16"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Avertissements */}
        {remiseTropElevee && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La remise totale dépasse ou égale le montant HT brut. Veuillez réduire les remises.
            </AlertDescription>
          </Alert>
        )}

        {pourcentageTropEleve && !remiseTropElevee && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Attention: La remise en pourcentage est supérieure à 50%.
            </AlertDescription>
          </Alert>
        )}

        {/* Résumé des remises */}
        {hasRemise && (
          <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant HT brut:</span>
              <span className="font-medium">{formatCurrency(montantHTBrut)}</span>
            </div>

            {remisePourcentageNum > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Remise {remisePourcentageNum}%:</span>
                <span>-{formatCurrency(montantHTBrut * (remisePourcentageNum / 100))}</span>
              </div>
            )}

            {remiseValeurNum > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Remise forfaitaire:</span>
                <span>-{formatCurrency(remiseValeurNum)}</span>
              </div>
            )}

            <div className="border-t border-green-300 pt-2 mt-2">
              <div className="flex justify-between text-sm font-semibold text-green-700">
                <span>Remise totale:</span>
                <span>-{formatCurrency(montantRemiseTotal)}</span>
              </div>
            </div>

            <div className="border-t border-green-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold">Montant HT net:</span>
                <span className="font-bold text-lg">{formatCurrency(montantHTNet)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Économie totale:</span>
              <span>{pourcentageEconomie}% ({formatCurrency(montantRemiseTotal)})</span>
            </div>
          </div>
        )}

        {/* Bouton reset */}
        {hasRemise && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="w-full"
          >
            Supprimer les remises
          </Button>
        )}

        {/* Boutons de remise rapide */}
        {!hasRemise && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Remises rapides:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemisePourcentageChange("5")}
                disabled={disabled}
                className="flex-1"
              >
                5%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemisePourcentageChange("10")}
                disabled={disabled}
                className="flex-1"
              >
                10%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemisePourcentageChange("15")}
                disabled={disabled}
                className="flex-1"
              >
                15%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemisePourcentageChange("20")}
                disabled={disabled}
                className="flex-1"
              >
                20%
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}