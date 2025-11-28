"use client"

import { useRouter } from "next/navigation"
import { use, useState, useEffect } from "react"
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Briefcase,
  Edit,
  Link2,
  BarChart3,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ConvertToProjectModal } from "@/components/dqe/convert-to-project-modal"
import { useDqe, useDqeExport } from "@/hooks/useDqe"
import {
  type DQE,
  formatCurrency,
  formatDate,
  formatDateTime,
  DQE_STATUT_LABELS,
  DQE_STATUT_COLORS,
  isDQEConvertible,
  isDQEEditable,
  getConversionStatus,
} from "@/types/dqe"
import { toast } from "sonner"
import DQEService from "@/services/dqeService"
import axios from "axios"
import { DQEFormModal } from "@/components/dqe/dqe-form-modal"
import { DetailDebourseSecViewer } from "@/components/dqe/detail-debourse-sec-viewer"
import { DebourseStatisticsCard } from "@/components/dqe/debourse-statistics-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign } from "lucide-react"

export default function DQEDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const dqeId = parseInt(id)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDQE, setEditingDQE] = useState<DQE | null>(null)
  const [activeTab, setActiveTab] = useState("structure")

  // Hooks
  const { fetchDQEById, validateDQE, fetchDQE, loading, error } = useDqe()
  const { exportExcel, exportPDF, loading: exportLoading } = useDqeExport()
  const reloadDQE = async () => {
    const data = await fetchDQEById(dqeId)
    setDqe(data)
  }
  const [dqe, setDqe] = useState<DQE | null>(null)
  const [loadingDQE, setLoadingDQE] = useState(true)

  // Charger le DQE
  useEffect(() => {
    const loadDQE = async () => {
      setLoadingDQE(true)
      const data = await fetchDQEById(dqeId)
      setDqe(data)
      setLoadingDQE(false)
    }

    loadDQE()
  }, [dqeId, fetchDQEById])

  if (loadingDQE) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!dqe) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">DQE non trouvé</p>
              <Button onClick={() => router.push("/dqe")} className="w-full mt-4">
                Retour à la liste
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const tva = dqe.totalRevenueHT * (dqe.tauxTVA / 100)
  const totalTTC = dqe.totalRevenueHT + tva

  // Calcul du total des déboursés secs pour tous les lots
  const totalDeboursseSec = dqe.lots?.reduce((lotTotal: number, lot: any) => {
    const chapterTotal = lot.chapters?.reduce((chapterSum: number, chapter: any) => {
      const itemsTotal = chapter.items?.reduce((itemSum: number, item: any) => {
        return itemSum + (item.deboursseSec || 0);
      }, 0) || 0;
      return chapterSum + itemsTotal;
    }, 0) || 0;
    return lotTotal + chapterTotal;
  }, 0) || 0

  // Calcul de la marge bénéficiaire globale
  const margeBeneficiaire = dqe.totalRevenueHT - totalDeboursseSec

  const conversionStatus = getConversionStatus(dqe)

  const handleConvertToProject = () => {
    setShowConvertModal(true)
  }

  const handleEdit = (dqe: DQE) => {
    setEditingDQE(dqe)
    setShowCreateModal(true)
  }

  const handleValidate = async () => {
    if (confirm("Êtes-vous sûr de vouloir valider ce DQE ?")) {
      try {
        const response = await DQEService.validateDQE(dqeId)
        toast.success(response.message || 'DQE validé avec succès')
        // Recharger le DQE
        const updatedDQE: DQE | null = await fetchDQEById(dqeId)
        setDqe(updatedDQE)
      } catch (err) {
        // Afficher les erreurs de validation de l'API
        let errorMessage = 'Erreur lors de la validation du DQE'
        let errorDetails: string[] = []

        if (axios.isAxiosError(err) && err.response) {
          const apiResponse = err.response.data

          // Récupérer le message principal
          if (apiResponse?.message) {
            errorMessage = apiResponse.message
          } else if (typeof apiResponse === 'string') {
            errorMessage = apiResponse
          } else if (apiResponse?.title) {
            errorMessage = apiResponse.title
          }

          // Récupérer les erreurs de validation détaillées
          if (apiResponse?.errors && Array.isArray(apiResponse.errors)) {
            // Format: { errors: [{ field, message, code }] }
            errorDetails = apiResponse.errors.map((errItem: any) =>
              errItem.field ? `${errItem.field}: ${errItem.message || errItem}` : (errItem.message || errItem)
            )
          } else if (apiResponse?.validationErrors && typeof apiResponse.validationErrors === 'object') {
            // Format: { validationErrors: { field: [messages] } }
            errorDetails = Object.entries(apiResponse.validationErrors).flatMap(([field, messages]) =>
              Array.isArray(messages)
                ? messages.map((msg: string) => `${field}: ${msg}`)
                : [`${field}: ${messages}`]
            )
          } else if (apiResponse?.error) {
            errorDetails = [typeof apiResponse.error === 'string' ? apiResponse.error : JSON.stringify(apiResponse.error)]
          }
        } else if (err instanceof Error) {
          // L'erreur est déjà formatée par handleError du service
          errorMessage = err.message
        }

        // Afficher le message d'erreur avec les détails
        let messageToShow = errorMessage || 'Une erreur est survenue lors de la validation'

        if (errorDetails.length > 0) {
          // Plusieurs erreurs de validation - combiner tout en un message lisible
          messageToShow = `${messageToShow}\n\n${errorDetails.map(d => `• ${d}`).join('\n')}`
        }

        // Afficher le toast
        toast.error(messageToShow, {
          duration: 10000,
        })
      }
    }
  }

  const handleExportPDF = async () => {
    await exportPDF(dqeId)
  }

  const handleExportExcel = async () => {
    await exportExcel(dqeId)
  }

  const handleProjectConversion = async (projectData: any) => {
    console.log("Converting DQE to project:", projectData)
    setShowConvertModal(false)

    // Recharger le DQE pour voir le statut "converti"
    const updatedDQE = await fetchDQEById(dqeId)
    setDqe(updatedDQE)

    // Rediriger vers le projet créé
    if (projectData.projetId) {
      router.push(`/projets/${projectData.projetId}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dqe")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{dqe.reference}</h1>
              <Badge className={DQE_STATUT_COLORS[dqe.statut]}>
                {DQE_STATUT_LABELS[dqe.statut]}
              </Badge>
              {dqe.isConverted && (
                <Badge className="bg-purple-500">Converti</Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{dqe.nom}</p>
          </div>
        </div>

        {/* Conversion Banner - Converted */}
        {conversionStatus === "converted" && dqe.linkedProjectId && (
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <Link2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  CE DQE EST CONVERTI EN PROJET
                </p>
                <div className="flex flex-col gap-2 text-sm text-purple-800 dark:text-purple-200">
                  <p>
                    Projet :{" "}
                    <span className="font-medium">
                      {dqe.linkedProjectNumber} - {dqe.nom}
                    </span>
                  </p>
                  {dqe.convertedAt && (
                    <p>
                      Converti le : <span className="font-medium">{formatDateTime(dqe.convertedAt)}</span>
                    </p>
                  )}
                  {dqe.convertedBy && (
                    <p>
                      Par : <span className="font-medium">
                        {dqe.convertedBy.prenom} {dqe.convertedBy.nom}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900 bg-transparent"
                    onClick={() => router.push(`/projets/${dqe.linkedProjectId}`)}
                  >
                    Voir le projet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900 bg-transparent"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tableau de bord
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Conversion Banner - Convertible */}
        {conversionStatus === "convertible" && (
          <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Ce DQE est validé et prêt à être converti en projet
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={handleConvertToProject}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Convertir en projet
                  </Button>
                  {isDQEEditable(dqe) && (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(dqe)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Éditer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportPDF}
                    disabled={exportLoading}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{dqe.client?.nom || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de création</p>
                <p className="font-medium">{formatDate(dqe.dateCreation)}</p>
              </div>
              {dqe.dateValidation && (
                <div>
                  <p className="text-sm text-muted-foreground">Date de validation</p>
                  <p className="font-medium">{formatDate(dqe.dateValidation)}</p>
                </div>
              )}
              {dqe.validatedBy && (
                <div>
                  <p className="text-sm text-muted-foreground">Validé par</p>
                  <p className="font-medium">
                    {dqe.validatedBy.prenom} {dqe.validatedBy.nom}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Budget Total HT</p>
                <p className="font-medium text-lg">{formatCurrency(dqe.totalRevenueHT)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Débourssé séc Total</p>
                <p className="font-medium text-lg">{formatCurrency(totalDeboursseSec)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marge bénéficiaire globale</p>
                <p className="font-medium text-lg text-emerald-600">{formatCurrency(margeBeneficiaire)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TVA ({dqe.tauxTVA}%)</p>
                <p className="font-medium text-lg">{formatCurrency(tva)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total TTC</p>
                <p className="font-medium text-lg text-primary">{formatCurrency(totalTTC)}</p>
              </div>
            </div>
          </CardContent>
        </Card>


        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="structure">Structure DQE</TabsTrigger>
            <TabsTrigger value="debourses">
              <DollarSign className="h-4 w-4 mr-2" />
              Déboursés Secs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structure">
            {/* Structure DQE */}
            <Card>
              <CardHeader>
                <CardTitle>Structure du DQE</CardTitle>
              </CardHeader>
              <CardContent>
                {dqe.lots && dqe.lots.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {dqe.lots.map((lot: any) => (
                      <AccordionItem key={lot.id} value={lot.id.toString()}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg">{lot.code}</span>
                              <Separator orientation="vertical" className="h-6" />
                              <span className="font-semibold">{lot.nom}</span>
                            </div>
                            <div className="flex flex-col items-end text-sm">
                              <span className="font-medium text-primary">
                                {formatCurrency(lot.totalRevenueHT)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Déboursés secs: {formatCurrency(
                                  lot.chapters?.reduce((chapterTotal: number, chapter: any) => {
                                    const itemsTotal = chapter.items?.reduce((itemTotal: number, item: any) => {
                                      return itemTotal + (item.deboursseSec || 0);
                                    }, 0) || 0;
                                    return chapterTotal + itemsTotal;
                                  }, 0) || 0
                                )}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 space-y-4">
                            {lot.chapters?.map((chapter: any) => (
                              <div key={chapter.id} className="border-l-2 border-muted pl-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-muted-foreground">
                                      {chapter.code}
                                    </span>
                                    <span className="font-medium">{chapter.nom}</span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(chapter.totalRevenueHT)}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {chapter.items?.map((item: any) => (
                                    <div key={item.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">
                                            {item.code} - {item.designation}
                                          </p>
                                        </div>
                                        <p className="font-semibold text-sm whitespace-nowrap">
                                          {formatCurrency(item.totalRevenueHT)}
                                        </p>

                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="font-medium">{item.unite}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span>{item.quantite.toLocaleString("fr-FR")}</span>
                                        <span>×</span>
                                        <span>{formatCurrency(item.prixUnitaireHT)}</span>
                                        <span>→</span>
                                        <span className="font-medium">
                                          {formatCurrency(item.totalRevenueHT)}
                                        </span>
                                        <span>déboursé sec:</span>
                                        <span>{formatCurrency(item.deboursseSec)}</span>
                                        <span>Marge brute:</span>
                                        <span className={item.deboursseSec > 0 ? "text-green-600" : "text-red-600"}>
                                          {item.deboursseSec > 0 ? formatCurrency(item.totalRevenueHT - item.deboursseSec) : "Veuillez renseigner le débourssé sec"}
                                        </span>                                  </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun lot défini
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debourses" className="space-y-6">
            {/* Statistiques globales */}
            <DebourseStatisticsCard dqeId={dqeId} />

            {/* Détails par item */}
            {dqe.lots?.map(lot => (
              lot.chapters?.map(chapter => (
                chapter.items?.map(item => (
                  <DetailDebourseSecViewer
                    itemId={item.id}
                    itemCode={item.code}
                    itemDesignation={item.designation}
                    totalRevenueHT={item.totalRevenueHT}
                    deboursseSec={item.deboursseSec}
                    onDebourseChange={reloadDQE}
                  />
                ))
              ))
            ))}
          </TabsContent>
        </Tabs>
        {/* Récapitulatif Financier */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Récapitulatif Financier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-semibold">{formatCurrency(dqe.totalRevenueHT)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">TVA ({dqe.tauxTVA}%)</span>
                <span className="font-semibold">{formatCurrency(tva)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-2xl">
                <span className="font-bold">TOTAL TTC</span>
                <span className="font-bold text-primary">{formatCurrency(totalTTC)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pb-6">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Exporter PDF
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Exporter Excel
          </Button>
          {dqe.statut === 'brouillon' && (
            <Button onClick={handleValidate} variant="outline">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Valider le DQE
            </Button>
          )}
          {isDQEConvertible(dqe) && (
            <Button
              onClick={handleConvertToProject}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Convertir en projet
            </Button>
          )}
          {isDQEEditable(dqe) && (
            <Button onClick={() => handleEdit(dqe)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Éditer
            </Button>
          )}
        </div>
      </div>

      {/* Convert to Project Modal */}
      {dqe && (
        <ConvertToProjectModal
          open={showConvertModal}
          onOpenChange={setShowConvertModal}
          dqe={dqe}
          onConvert={handleProjectConversion}
        />
      )}
      {/* Modal de création/édition */}
      <DQEFormModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open)
          if (!open) setEditingDQE(null)
        }}
        editData={editingDQE}
        onSubmit={async () => {
          const updated = await fetchDQEById(dqeId)
          setDqe(updated)
          setShowCreateModal(false)
          setEditingDQE(null)
        }}
      />
    </DashboardLayout>
  )
}