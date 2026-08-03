"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PackagePlus } from "lucide-react"
import { BordereauForm } from "@/components/stock/bordereau/BordereauForm"

export default function BordereauEntreePage() {
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
            <PackagePlus className="h-6 w-6 text-green-600" />
            Bordereau d'entrée de stock
          </h1>
          <p className="text-muted-foreground">
            Enregistrez la réception de plusieurs articles dans un dépôt en une seule fois.
          </p>
        </div>

        <BordereauForm type="entree" />
      </div>
    </DashboardLayout>
  )
}
