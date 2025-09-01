export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isActive: boolean
}

export type UserRole = "super_admin" | "admin" | "chef_projet" | "comptable" | "commercial" | "sous_traitant"

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  chef_projet: "Chef de Projet",
  comptable: "Comptable",
  commercial: "Commercial",
  sous_traitant: "Sous-traitant",
}

export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    "dashboard",
    "devis",
    "projets",
    "factures",
    "sous_traitants",
    "tresorerie",
    "utilisateurs",
    "notifications",
  ],
  admin: ["dashboard", "devis", "projets", "factures", "sous_traitants", "tresorerie", "utilisateurs", "notifications"],
  chef_projet: ["dashboard", "projets", "sous_traitants"],
  comptable: ["dashboard", "factures", "tresorerie"],
  commercial: ["dashboard", "devis"],
  sous_traitant: ["dashboard", "projets"],
}

// Mock users for development
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@construction.fr",
    name: "Admin Principal",
    role: "super_admin",
    isActive: true,
  },
  {
    id: "2",
    email: "marie.chef@construction.fr",
    name: "Marie Dubois",
    role: "chef_projet",
    isActive: true,
  },
  {
    id: "3",
    email: "pierre.commercial@construction.fr",
    name: "Pierre Martin",
    role: "commercial",
    isActive: true,
  },
  {
    id: "4",
    email: "sophie.compta@construction.fr",
    name: "Sophie Leroy",
    role: "comptable",
    isActive: true,
  },
]

// Mock authentication functions
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple mock authentication
  const user = mockUsers.find((u) => u.email === email && u.isActive)
  if (user && password === "password123") {
    return user
  }
  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false
  return rolePermissions[user.role]?.includes(permission) || false
}
