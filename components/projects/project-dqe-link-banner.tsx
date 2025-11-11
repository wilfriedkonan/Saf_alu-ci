"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProjectDQELinkBannerProps {
  project: {
    linkedDqeId: string | null
    linkedDqeReference: string
    linkedDqeName: string
    linkedDqeBudgetHT: number
    clientName: string
    convertedAt: string
    convertedByName: string
  }
}

export function ProjectDQELinkBanner({ project }: ProjectDQELinkBannerProps) {
  const router = useRouter()

  // Don't render if no linked DQE
  if (!project.linkedDqeId) {
    return null
  }

  const handleViewDQE = () => {
    router.push(`/dqe/${project.linkedDqeId}`)
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download logic
    console.log("Downloading DQE PDF...")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount)
  }

  return (
    <Alert className="border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20 mb-6">
      <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
      <AlertTitle className="text-violet-900 dark:text-violet-100 font-semibold text-lg mb-3">
        Projet créé depuis un DQE
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-violet-700 dark:text-violet-300">DQE source :</span>{" "}
              <span className="text-violet-900 dark:text-violet-100">
                {project.linkedDqeReference} - {project.linkedDqeName}
              </span>
            </div>
            <div>
              <span className="font-medium text-violet-700 dark:text-violet-300">Budget DQE HT :</span>{" "}
              <span className="text-violet-900 dark:text-violet-100 font-semibold">
                {formatCurrency(project.linkedDqeBudgetHT)} FCFA
              </span>
            </div>
            <div>
              <span className="font-medium text-violet-700 dark:text-violet-300">Client :</span>{" "}
              <span className="text-violet-900 dark:text-violet-100">{project.clientName}</span>
            </div>
            <div>
              <span className="font-medium text-violet-700 dark:text-violet-300">Converti le :</span>{" "}
              <span className="text-violet-900 dark:text-violet-100">
                {project.convertedAt} par {project.convertedByName}
              </span>
            </div>
          </div>

          {/* Info Badge */}
          <Badge
            variant="outline"
            className="border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
          >
            <Info className="h-3 w-3 mr-1" />
            Les étapes correspondent aux lots du DQE
          </Badge>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleViewDQE}
              variant="outline"
              size="sm"
              className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/30 bg-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Voir le DQE complet
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/30 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger DQE PDF
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
