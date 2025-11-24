"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardWidgets } from "@/components/dashboard-widgets"
import { getStoredUser, /* roleLabels */ } from "@/lib/auth"
import { UserRole, Utilisateur } from "@/types/Utilisateurs"
import { useAuth, usePermissions } from "@/contexts/AuthContext"


export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth() 
  const { canAccessDashboard } = usePermissions()

  // Vérification des permissions
  useEffect(() => {      console.log('debug User:',user,'canAccessDashboard:',canAccessDashboard)

    /* if (!user || !canAccessDashboard) {
      router.push("/")
      return
    } */
  }, [user, router, canAccessDashboard])

 // Vérification des permissions avant rendu
/*  if (!user || !canAccessDashboard) {
  return null
} */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
          Bienvenue, {user?.Prenom} {user?.Nom} - {[user?.Role?.Nom as UserRole]}
          </p>
        </div>
{        <DashboardWidgets user={user} />
}      </div>
    </DashboardLayout>
  )
}
