"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PackageMinus } from "lucide-react"
import { BordereauForm } from "@/components/stock/bordereau/BordereauForm"

export default function BordereauSortiePage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/stock/mouvements")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux mouvements
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PackageMinus className="h-6 w-6 text-orange-600" />
            Bordereau de sortie de stock
          </h1>
          <p className="text-muted-foreground">
            Enregistrez la sortie de plusieurs articles d'un dépôt en une seule fois.
          </p>
        </div>

        <BordereauForm type="sortie" />
      </div>
    </DashboardLayout>
  )
}
