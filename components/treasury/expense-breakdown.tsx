"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTresorerieStatistiques } from "@/hooks/useTresorerie"
import { formatCurrency } from "@/types/tresorerie"
import { useMemo } from "react"

interface ExpenseBreakdownProps {
  dateDebut?: string
  dateFin?: string
}

export function ExpenseBreakdown({ dateDebut, dateFin }: ExpenseBreakdownProps) {
  const statsParams = useMemo(() => {
    if (!dateDebut || !dateFin) {
      // Par défaut, le mois en cours
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
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

  // Transformer les données pour le pie chart
  const pieData = useMemo(() => {
    if (!stats?.repartitionParCategorie || stats.repartitionParCategorie.length === 0) {
      return []
    }

    // Palette de couleurs pour les catégories
    const colors = [
      "#ef4444", // Rouge
      "#f97316", // Orange
      "#f59e0b", // Amber
      "#84cc16", // Lime
      "#10b981", // Emerald
      "#06b6d4", // Cyan
      "#3b82f6", // Blue
      "#8b5cf6", // Violet
      "#ec4899", // Pink
      "#6b7280", // Gray
    ]

    return stats.repartitionParCategorie.map((cat, index) => ({
      name: cat.label,
      value: cat.value,
      color: cat.color || colors[index % colors.length],
    }))
  }, [stats])

  // Catégories avec budgets (pour l'instant, on affiche juste les dépenses sans budget)
  // Dans une version future, vous pourriez ajouter des budgets par catégorie dans l'API
  const categories = useMemo(() => {
    if (!stats?.repartitionParCategorie) return []
    
    return stats.repartitionParCategorie.map((cat) => ({
      id: cat.label,
      name: cat.label,
      spent: cat.value,
      budget: cat.metaDonnees?.budget as number | undefined,
      color: cat.color,
    }))
  }, [stats])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suivi des budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-red-600">Erreur: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (pieData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Aucune donnée de dépenses pour cette période
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune catégorie de dépenses
            </p>
          ) : (
            categories.map((category) => {
              const percentage = category.budget ? (category.spent / category.budget) * 100 : 0
              const isOverBudget = percentage > 100
              const hasBudget = category.budget && category.budget > 0

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(category.spent)}
                      {hasBudget && ` / ${formatCurrency(category.budget)}`}
                    </span>
                  </div>
                  {hasBudget && (
                    <>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`}
                      />
                      {isOverBudget && (
                        <p className="text-xs text-red-600">
                          Dépassement de {(percentage - 100).toFixed(1)}%
                        </p>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}