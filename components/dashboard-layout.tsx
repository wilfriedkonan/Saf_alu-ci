"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Building2,
  LayoutDashboard,
  FileText,
  Hammer,
  Receipt,
  Users,
  Wallet,
  UserCog,
  Bell,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { hasPermission, Utilisateur, type Utilisateur as AuthUser } from "@/types/Utilisateurs"
import { getStoredUser, setStoredUser } from "@/lib/auth"
import { useAuth, usePermissions } from "@/contexts/AuthContext"


interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission: string
}

const navigation: NavigationItem[] = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { name: "Devis", href: "/devis", icon: FileText, permission: "devis" },
  { name: "Projets", href: "/projets", icon: Hammer, permission: "projets" },
  { name: "DQE", href: "/dqe", icon: Bell, permission: "dqe" },
  { name: "Factures", href: "/factures", icon: Receipt, permission: "factures" },
  { name: "Clients", href: "/clients", icon: Users, permission: "clients" },
  { name: "Sous-traitants", href: "/sous-traitants", icon: Users, permission: "sous_traitants" },
  { name: "Trésorerie", href: "/tresorerie", icon: Wallet, permission: "tresorerie" },
  { name: "Paramètres", href: "/parametres", icon: UserCog, permission: "utilisateurs" },
  { name: "Notifications", href: "/notifications", icon: Bell, permission: "notifications" },

]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
/*   const [user, setUser] = useState<Utilisateur | null>(() => getStoredUser())
 */  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter();
  const { user } = useAuth();  

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [router, user])

  useEffect(() => {
    
  }, [user])

  const handleLogout = () => {
    setStoredUser(null)
    router.push("/")
  }

  if (!user) {
    return null
  }

  const filteredNavigation = navigation.filter((item) => hasPermission(user, item.permission))

  useEffect(() => {
    
  }, [filteredNavigation])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
          <div className="flex h-16 items-center px-6">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">SAF ALU-CI</span>
          </div>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => {
                return (
                  <li key={item.name}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="flex flex-col flex-grow bg-card border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <div className={cn("flex items-center", sidebarCollapsed && "justify-center w-full")}>
              <Building2 className="h-8 w-8 text-primary" />
              {!sidebarCollapsed && <span className="ml-2 text-xl font-bold">SAF ALU-CI</span>}
            </div>
            {!sidebarCollapsed && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(true)} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {sidebarCollapsed && (
            <div className="flex justify-center px-2 pb-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(false)} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <nav className="mt-4 flex-1 px-2">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full transition-all duration-200",
                      sidebarCollapsed ? "justify-center px-2" : "justify-start px-4",
                    )}
                    onClick={() => router.push(item.href)}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {(() => {
                        const anyUser = user as any;
                        const displayName = (typeof user.Nom === "string" && user.Nom)
                          || (typeof anyUser?.Nom === "string" && anyUser.Nom)
                          || (typeof user?.Username === "string" && user.Username)
                          || user?.Email
                          || "U";
                        return (String(displayName).trim().split(/\s+/).map((n: string) => n[0]).join("") || "U").toUpperCase();
                      })()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.Nom || (user as any).Nom || user.Username || user.Email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.Email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
