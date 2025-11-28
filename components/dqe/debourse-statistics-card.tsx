// components/dqe/debourse-statistics-card.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  Package,
  Users,
  Wrench,
  Handshake,
  MoreHorizontal,
  BarChart3,
} from "lucide-react"
import { useDetailDebourseSec } from "@/hooks/useDetailDebourseSec"
import {
  type DebourseStatistics,
  type TypeDepense,
  formatCurrency,
  formatPercentage,
} from "@/types/dqe-debourse-sec"

interface DebourseStatisticsCardProps {
  dqeId: number
}

const getTypeIcon = (type: TypeDepense) => {
  switch (type) {
    case 'MainOeuvre':
      return <Users className="h-4 w-4" />
    case 'Materiaux':
      return <Package className="h-4 w-4" />
    case 'Materiel':
      return <Wrench className="h-4 w-4" />
    case 'SousTraitance':
      return <Handshake className="h-4 w-4" />
    default:
      return <MoreHorizontal className="h-4 w-4" />
  }
}

export function DebourseStatisticsCard({ dqeId }: DebourseStatisticsCardProps) {
  const { fetchDebourseStatistics, loading } = useDetailDebourseSec()
  const [stats, setStats] = useState<DebourseStatistics | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadStatistics()
  }, [dqeId])

  const loadStatistics = async () => {
    const data = await fetchDebourseStatistics(dqeId)
    setStats(data)
  }

  if (loading && !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const hasDebourse = stats.nombreItemsAvecDebourse > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyse Déboursés Secs
            </CardTitle>
            <CardDescription>
              {stats.nombreItemsAvecDebourse} sur {stats.nombreItems} items avec détails
            </CardDescription>
          </div>
          {hasDebourse && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Masquer' : 'Détails'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Revenue Total HT</p>
            <p className="text-xl font-bold">{formatCurrency(stats.totalRevenueHT)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Déboursé Sec Total</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(stats.totalDeboursseSec)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Marge Globale</p>
            <p
              className={`text-xl font-bold ${
                stats.margeGlobale >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(stats.margeGlobale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Taux de Marge</p>
            <div className="flex items-center gap-2">
              <p
                className={`text-xl font-bold ${
                  stats.tauxMargeGlobal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercentage(stats.tauxMargeGlobal)}
              </p>
              {stats.tauxMargeGlobal >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {showDetails && hasDebourse && (
          <>
            <Separator />

            {/* Répartition par type */}
            {stats.repartitionParType.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Répartition par type de dépense</h4>
                <div className="space-y-2">
                  {stats.repartitionParType.map((type) => (
                    <div
                      key={type.typeDepense}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(type.typeDepense)}
                        <div>
                          <p className="font-medium">{type.typeDepenseLabel}</p>
                          <p className="text-sm text-muted-foreground">
                            {type.nombreLignes} ligne(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(type.montantTotal)}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatPercentage(type.pourcentageTotal)} du déboursé
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Top 10 items */}
            {stats.top10ItemsParDebourse.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Top 10 items par déboursé</h4>
                <div className="space-y-2">
                  {stats.top10ItemsParDebourse.map((item, index) => (
                    <div
                      key={item.itemId}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.itemCode} - {item.itemDesignation}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Revenue: {formatCurrency(item.totalRevenueHT)}</span>
                          <span>Déboursé: {formatCurrency(item.deboursseSec)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            item.marge >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(item.marge)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(item.tauxMarge)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}