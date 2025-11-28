// components/dqe/detail-debourse-sec-viewer.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  Wrench,
  Handshake,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { useDetailDebourseSec } from "@/hooks/useDetailDebourseSec"
import {
  type DQEDetailDebourseSec,
  type TypeDepense,
  formatCurrency,
  getTypeDepenseLabel,
  getTypeDepenseColor,
  TYPES_DEPENSE,
} from "@/types/dqe-debourse-sec"
import { DetailDebourseSecFormModal } from "./detail-debourse-sec-form-modal"
import { toast } from "sonner"

interface DetailDebourseSecViewerProps {
  itemId: number
  itemCode: string
  itemDesignation: string
  totalRevenueHT: number
  deboursseSec: number
  onDebourseChange?: () => void
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

export function DetailDebourseSecViewer({
  itemId,
  itemCode,
  itemDesignation,
  totalRevenueHT,
  deboursseSec,
  onDebourseChange,
}: DetailDebourseSecViewerProps) {
  const {
    details,
    loading,
    fetchDetailsByItemId,
    deleteDetail,
    fetchRecapitulatif,
  } = useDetailDebourseSec()

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingDetail, setEditingDetail] = useState<DQEDetailDebourseSec | null>(null)
  const [recapData, setRecapData] = useState<any>(null)

  // Charger les détails au montage
  useEffect(() => {
    loadDetails()
  }, [itemId])

  const loadDetails = async () => {
    await fetchDetailsByItemId(itemId)
    const recap = await fetchRecapitulatif(itemId)
    setRecapData(recap)
  }

  const handleCreateNew = () => {
    setEditingDetail(null)
    setShowFormModal(true)
  }

  const handleEdit = (detail: DQEDetailDebourseSec) => {
    setEditingDetail(detail)
    setShowFormModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce détail ?')) {
      const success = await deleteDetail(id, itemId)
      if (success && onDebourseChange) {
        onDebourseChange()
      }
    }
  }

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingDetail(null)
    loadDetails()
    if (onDebourseChange) {
      onDebourseChange()
    }
  }

  // Calcul de la marge
  const marge = totalRevenueHT - deboursseSec
  const tauxMarge = totalRevenueHT > 0 ? (marge / totalRevenueHT) * 100 : 0

  if (loading && details.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Détail Déboursé Sec</CardTitle>
              <CardDescription>
                {itemCode} - {itemDesignation}
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Résumé financier */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Revenue HT</p>
              <p className="text-lg font-semibold">{formatCurrency(totalRevenueHT)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Déboursé Sec</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(deboursseSec)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Marge</p>
              <p className={`text-lg font-semibold ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(marge)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Taux de Marge</p>
              <p className={`text-lg font-semibold ${tauxMarge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tauxMarge.toFixed(2)} %
              </p>
            </div>
          </div>

          <Separator />

          {/* Répartition par type */}
          {recapData && recapData.detailParType.length > 0 && (
            <>
              <div>
                <h4 className="font-medium mb-3">Répartition par type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recapData.detailParType.map((type: any) => (
                    <div
                      key={type.typeDepense}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type.typeDepense)}
                        <div>
                          <p className="text-sm font-medium">{type.typeDepenseLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {type.nombreLignes} ligne(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(type.montantTotal)}</p>
                        <p className="text-xs text-muted-foreground">
                          {type.pourcentageTotal.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Liste des détails */}
          {details.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun détail de déboursé ajouté</p>
              <Button onClick={handleCreateNew} variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier détail
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Désignation</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">PU HT</TableHead>
                    <TableHead className="text-right">Coef.</TableHead>
                    <TableHead className="text-right">Montant HT</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(detail.typeDepense)}
                          <Badge variant="outline" className="text-xs">
                            {detail.typeDepenseLabel}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{detail.designation}</p>
                          {detail.description && (
                            <p className="text-xs text-muted-foreground">
                              {detail.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{detail.unite}</TableCell>
                      <TableCell className="text-right">{detail.quantite}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detail.prixUnitaireHT)}
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.coefficient.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(detail.montantHT)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(detail)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(detail.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulaire */}
      <DetailDebourseSecFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingDetail(null)
        }}
        itemId={itemId}
        detail={editingDetail}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}