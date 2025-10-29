"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, FileSpreadsheet, Briefcase, Edit, Link2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/dashboard-layout"
import { mockDQEs, getStatutLabel, getStatutColor, formatCurrency } from "@/lib/dqe"

export default function DQEDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const dqe = mockDQEs.find((d) => d.id === params.id)

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

  const tva = dqe.budgetTotalHT * 0.18
  const totalTTC = dqe.budgetTotalHT + tva

  const handleConvertToProject = () => {
    alert("Conversion en projet en cours...")
  }

  const handleEdit = () => {
    alert("Édition du DQE...")
  }

  const handleExportPDF = () => {
    alert("Export PDF en cours...")
  }

  const handleExportExcel = () => {
    alert("Export Excel en cours...")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dqe")} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{dqe.reference}</h1>
              <Badge className={getStatutColor(dqe.statut)}>{getStatutLabel(dqe.statut)}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{dqe.nomProjet}</p>
          </div>
        </div>

        {/* Conversion Banner - Converted */}
        {dqe.conversionState === "converted" && (
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <Link2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold text-purple-900 dark:text-purple-100">CE DQE EST CONVERTI EN PROJET</p>
                <div className="flex flex-col gap-2 text-sm text-purple-800 dark:text-purple-200">
                  <p>
                    Projet :{" "}
                    <span className="font-medium">
                      {dqe.projetReference} - {dqe.nomProjet}
                    </span>
                  </p>
                  <p>
                    Statut :{" "}
                    <span className="font-medium">
                      {dqe.projetStatut} ({dqe.projetAvancement}%)
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900 bg-transparent"
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
        {dqe.conversionState === "convertible" && (
          <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Ce DQE est validé et prêt à être converti
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={handleConvertToProject} className="bg-emerald-600 hover:bg-emerald-700">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Convertir en projet
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportPDF}>
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
                <p className="font-medium">{dqe.client}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de création</p>
                <p className="font-medium">{dqe.dateCreation.toLocaleDateString("fr-FR")}</p>
              </div>
              {dqe.dateValidation && (
                <div>
                  <p className="text-sm text-muted-foreground">Date de validation</p>
                  <p className="font-medium">{dqe.dateValidation.toLocaleDateString("fr-FR")}</p>
                </div>
              )}
              {dqe.validePar && (
                <div>
                  <p className="text-sm text-muted-foreground">Validé par</p>
                  <p className="font-medium">{dqe.validePar}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Budget Total HT</p>
                <p className="font-medium text-lg">{formatCurrency(dqe.budgetTotalHT)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TVA (18%)</p>
                <p className="font-medium text-lg">{formatCurrency(tva)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total TTC</p>
                <p className="font-medium text-lg text-primary">{formatCurrency(totalTTC)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structure DQE */}
        <Card>
          <CardHeader>
            <CardTitle>Structure du DQE</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {dqe.lots.map((lot) => (
                <AccordionItem key={lot.id} value={lot.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{lot.numero}</span>
                        <Separator orientation="vertical" className="h-6" />
                        <span className="font-semibold">{lot.designation}</span>
                      </div>
                      <span className="text-sm font-medium text-primary">{formatCurrency(lot.montantHT)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-4 space-y-4">
                      {lot.chapitres.map((chapitre) => (
                        <div key={chapitre.id} className="border-l-2 border-muted pl-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-muted-foreground">{chapitre.numero}</span>
                              <span className="font-medium">{chapitre.designation}</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(chapitre.montantHT)}</span>
                          </div>

                          <div className="space-y-2">
                            {chapitre.postes.map((poste) => (
                              <div key={poste.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {poste.numero} - {poste.designation}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-sm whitespace-nowrap">
                                    {formatCurrency(poste.montantHT)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="font-medium">{poste.unite}</span>
                                  <Separator orientation="vertical" className="h-3" />
                                  <span>{poste.quantite.toLocaleString("fr-FR")}</span>
                                  <span>×</span>
                                  <span>{formatCurrency(poste.prixUnitaire)}</span>
                                  <span>→</span>
                                  <span className="font-medium">{formatCurrency(poste.montantHT)}</span>
                                </div>
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
          </CardContent>
        </Card>

        {/* Récapitulatif Financier */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Récapitulatif Financier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-semibold">{formatCurrency(dqe.budgetTotalHT)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">TVA (18%)</span>
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
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
          {dqe.conversionState === "convertible" && (
            <Button onClick={handleConvertToProject} className="bg-emerald-600 hover:bg-emerald-700">
              <Briefcase className="h-4 w-4 mr-2" />
              Convertir en projet
            </Button>
          )}
          {dqe.conversionState !== "converted" && (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Éditer
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
