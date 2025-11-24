"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTresorerieStatistiques } from "@/hooks/useTresorerie"
import { formatCurrency } from "@/types/tresorerie"
import { useEffect, useMemo } from "react"

interface CashFlowChartProps {
  dateDebut?: string
  dateFin?: string
}

export function CashFlowChart({ dateDebut, dateFin }: CashFlowChartProps) {
  const statsParams = useMemo(() => {
    if (!dateDebut || !dateFin) {
      // Par défaut, les 6 derniers mois
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return {
        dateDebut: start.toISOString(),
        dateFin: end.toISOString(),
      }
    }
    return {
      dateDebut: new Date(dateDebut).toISOString(),
      dateFin: new Date(dateFin).toISOString(),
    }
  }, [dateDebut, dateFin])

  const { stats, loading, error } = useTresorerieStatistiques(statsParams)

  // Transformer les données de l'API pour le graphique
  const chartData = useMemo(() => {
    if (!stats?.fluxSemestre || stats.fluxSemestre.length === 0) {
      return []
    }

    return stats.fluxSemestre.map((flux) => {
      // Le label peut être au format "2024-01" ou "Janvier 2024"
      // On s'assure d'avoir un format lisible
      const label = flux.label.includes('-') 
        ? new Date(flux.label + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        : flux.label

      return {
        month: label,
        income: flux.metaDonnees?.entrees || 0,
        expenses: flux.metaDonnees?.sorties || 0,
        net: flux.value,
      }
    })
  }, [stats])
useEffect(()=>{console.log('cash Flow data:',chartData)},[chartData])
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flux de trésorerie (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flux de trésorerie (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-red-600">Erreur: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flux de trésorerie (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Aucune donnée disponible pour cette période</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flux de trésorerie (6 derniers mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), ""]}
              labelFormatter={(label) => `Mois: ${label}`}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Recettes" />
            <Bar dataKey="expenses" fill="#ef4444" name="Dépenses" />
            <Bar dataKey="net" fill="#3b82f6" name="Résultat net" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}