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
  const { canManageUsers } = usePermissions()

  useEffect(() => {
    const currentUser = getStoredUser()
    if (!currentUser) {
      router.push("/")
    } /* else {
      setUser(currentUser)
    } */
  }, [router])

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user.Prenom} {user.Nom} - {[user.Role?.Nom as UserRole]}
          </p>
        </div>
        <DashboardWidgets user={user} />
      </div>
    </DashboardLayout>
  )
}
