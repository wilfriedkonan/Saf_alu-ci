"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
import { useParametresSysteme } from "@/hooks/useParametres"
import { formatParametreValue } from "@/types/parametres"

export function SystemTab() {
  const { parametres, loading, updateParametre } = useParametresSysteme()
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const handleUpdate = async (cle: string, valeur: string) => {
    setSavingKey(cle)
    try {
      await updateParametre({ Cle: cle, Valeur: valeur })
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSavingKey(null)
    }
  }
  const renderParametreInput = (parametre: any) => {
    const isSaving = savingKey === parametre.cle
    
    switch (parametre.typeValeur) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label>{parametre.description || parametre.cle}</Label>
              {parametre.description && (
                <p className="text-sm text-muted-foreground">{parametre.cle}</p>
              )}
            </div>
            <Switch
              checked={parametre.valeur === 'true'}
              onCheckedChange={(checked) => handleUpdate(parametre.cle, checked ? 'true' : 'false')}
              disabled={isSaving}
            />
          </div>
        )
      
      case 'integer':
      case 'decimal':
        return (
          <div className="space-y-2">
            <Label htmlFor={parametre.Cle}>{parametre.description || parametre.cle}</Label>
            <div className="flex gap-2">
              <Input
                id={parametre.cle}
                type="number"
                defaultValue={parametre.valeur}
                onBlur={(e) => {
                  if (e.target.value !== parametre.valeur) {
                    handleUpdate(parametre.Cle, e.target.value)
                  }
                }}
                disabled={isSaving}
              />
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={parametre.Cle}>{parametre.description || parametre.cle}</Label>
            <div className="flex gap-2">
              <Input
                id={parametre.cle}
                defaultValue={parametre.valeur}
                onBlur={(e) => {
                  if (e.target.value !== parametre.valeur) {
                    handleUpdate(parametre.Cle, e.target.value)
                  }
                }}
                disabled={isSaving}
              />
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Chargement des paramètres...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {parametres && parametres.length > 0 ? (
        parametres.map((categorie) => (
          <Card key={categorie.categorie}>
            <CardHeader>
              <CardTitle>{categorie.categorie}</CardTitle>
              <CardDescription>
                Configuration des paramètres de {categorie.categorie?.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categorie.parametres?.map((parametre) => (
                  <div key={parametre.id}>
                    {renderParametreInput(parametre)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Aucun paramètre système configuré
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Les modifications sont automatiquement sauvegardées.
            Certains paramètres peuvent nécessiter un redémarrage de l'application pour prendre effet.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}