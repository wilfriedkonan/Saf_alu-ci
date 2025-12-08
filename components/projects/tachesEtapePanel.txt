// components/projets/TachesEtapePanel.tsx
"use client"

import React, { useState } from 'react'
import { 
  TacheProjet, 
  tacheStatusLabels,
  tacheStatusColors,
  uniteSymbols,
  formatQuantiteAvecUnite,
  formatEcartBudget,
  calculerEcartsTache,
  isTacheEnRetard,
  getTacheStatusClass
} from '@/types/projet'
import { useTachesEtape } from '@/hooks/useProjet'
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Package,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface TachesEtapePanelProps {
  etapeId: number
  etapeNom: string
  readonly?: boolean
}

export default function TachesEtapePanel({ 
  etapeId, 
  etapeNom,
  readonly = false 
}: TachesEtapePanelProps) {
  const { taches, loading, error, deleteTache, refreshTaches } = useTachesEtape(etapeId)
  const [expandedTacheId, setExpandedTacheId] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Calculer les statistiques
  const stats = {
    total: taches.length,
    nonCommence: taches.filter(t => t.statut === 'NonCommence').length,
    enCours: taches.filter(t => t.statut === 'EnCours').length,
    termine: taches.filter(t => t.statut === 'Termine').length,
    budgetTotal: taches.reduce((sum, t) => sum + t.budgetPrevu, 0),
    coutTotal: taches.reduce((sum, t) => sum + t.coutReel, 0),
  }

  const ecartBudgetTotal = stats.coutTotal - stats.budgetTotal
  const ecartBudgetPourcentage = stats.budgetTotal > 0 
    ? (ecartBudgetTotal / stats.budgetTotal) * 100 
    : 0

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'NonCommence':
        return <Circle className="w-4 h-4 text-gray-400" />
      case 'EnCours':
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      case 'Termine':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const handleDeleteTache = async (tacheId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTache(tacheId)
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
      }
    }
  }

  const toggleExpand = (tacheId: number) => {
    setExpandedTacheId(expandedTacheId === tacheId ? null : tacheId)
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Chargement des tâches...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (taches.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Aucune tâche
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cette étape ne contient pas encore de tâches
        </p>
        {!readonly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une tâche
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Tâches de l'étape: {etapeNom}
          </h3>
          {!readonly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          )}
        </div>

        {/* Statistiques en grille */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">En cours</div>
            <div className="text-2xl font-bold text-blue-700">{stats.enCours}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 mb-1">Terminé</div>
            <div className="text-2xl font-bold text-green-700">{stats.termine}</div>
          </div>
          <div className={`rounded-lg p-3 ${ecartBudgetTotal > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`text-xs mb-1 ${ecartBudgetTotal > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Écart budget
            </div>
            <div className={`text-lg font-bold ${ecartBudgetTotal > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {ecartBudgetPourcentage > 0 ? '+' : ''}{ecartBudgetPourcentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-2">
        {taches.map((tache) => {
          const tacheAvecEcarts = calculerEcartsTache(tache)
          const isExpanded = expandedTacheId === tache.id
          const isRetard = isTacheEnRetard(tache)
          const statusClass = getTacheStatusClass(tache)

          return (
            <div 
              key={tache.id}
              className={`bg-white rounded-lg border transition-all ${
                isRetard ? 'border-red-300 shadow-sm' : 'border-gray-200'
              }`}
            >
              {/* Ligne principale */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatutIcon(tache.statut)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-500">
                            {tache.code}
                          </span>
                          <h4 className="font-medium text-gray-900 truncate">
                            {tache.nom}
                          </h4>
                        </div>
                        {tache.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {tache.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Informations principales en ligne */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {tacheStatusLabels[tache.statut]}
                      </span>
                      
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>
                          {formatQuantiteAvecUnite(tache.quantitePrevue, tache.unite)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {new Intl.NumberFormat('fr-FR').format(tache.budgetPrevu)} FCFA
                        </span>
                      </div>

                      {/* Avancement */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              tache.pourcentageAvancement === 100
                                ? 'bg-green-500'
                                : tache.pourcentageAvancement > 0
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            }`}
                            style={{ width: `${tache.pourcentageAvancement}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 min-w-[3ch]">
                          {tache.pourcentageAvancement}%
                        </span>
                      </div>

                      {isRetard && (
                        <div className="flex items-center gap-1 text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">En retard</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleExpand(tache.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title={isExpanded ? "Réduire" : "Développer"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {!readonly && (
                      <>
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTache(tache.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Détails développés */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quantités */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">
                        Quantités
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prévue:</span>
                          <span className="font-medium">
                            {formatQuantiteAvecUnite(tache.quantitePrevue, tache.unite)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Réalisée:</span>
                          <span className="font-medium">
                            {formatQuantiteAvecUnite(tache.quantiteRealisee, tache.unite)}
                          </span>
                        </div>
                        {tacheAvecEcarts.ecartQuantite !== 0 && (
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Écart:</span>
                            <span className={`font-medium flex items-center gap-1 ${
                              tacheAvecEcarts.ecartQuantite! > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {tacheAvecEcarts.ecartQuantite! > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(tacheAvecEcarts.ecartQuantite!).toFixed(2)} {uniteSymbols[tache.unite]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">
                        Budget
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prévu:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('fr-FR').format(tache.budgetPrevu)} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Réel:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('fr-FR').format(tache.coutReel)} FCFA
                          </span>
                        </div>
                        {tacheAvecEcarts.ecartBudget !== 0 && (
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Écart:</span>
                            <span className={`font-medium ${
                              formatEcartBudget(tacheAvecEcarts.ecartBudget!).couleur
                            }`}>
                              {formatEcartBudget(tacheAvecEcarts.ecartBudget!).texte}
                              {' '}({tacheAvecEcarts.ecartBudgetPourcentage!.toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">
                        Planning
                      </h5>
                      <div className="space-y-2 text-sm">
                        {tache.dateDebut && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-gray-600">Début:</div>
                              <div className="font-medium">
                                {new Date(tache.dateDebut).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        )}
                        {tache.dateFinPrevue && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-gray-600">Fin prévue:</div>
                              <div className="font-medium">
                                {new Date(tache.dateFinPrevue).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        )}
                        {tache.dateFinReelle && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                              <div className="text-gray-600">Fin réelle:</div>
                              <div className="font-medium text-green-700">
                                {new Date(tache.dateFinReelle).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Traçabilité DQE */}
                  {tache.linkedDqeItemCode && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold">Lié au DQE:</span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {tache.linkedDqeReference} / {tache.linkedDqeLotCode} / {tache.linkedDqeChapterCode} / {tache.linkedDqeItemCode}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}