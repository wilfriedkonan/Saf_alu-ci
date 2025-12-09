"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, UserPlus } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface InviteFormData {
  email: string
  prenom: string
  nom: string
  telephone: string
  roleId: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL /* || 'http://localhost:5264/api' */

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InviteFormData>({
    email: "",
    prenom: "",
    nom: "",
    telephone: "",
    roleId: 3 // chef_projet par défaut
  })

  const [errors, setErrors] = useState<Partial<InviteFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<InviteFormData> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide"
    }

    // Nom et prénom validation
    if (!formData.prenom?.trim()) {
      newErrors.prenom = "Prénom requis"
    }

    if (!formData.nom?.trim()) {
      newErrors.nom = "Nom requis"
    }

    // Téléphone validation (optionnel mais format si fourni)
    if (formData.telephone && !/^[\d\s+()-]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = "Format de téléphone invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('safalu_token')
      
      const response = await axios.post(
        `${API_BASE_URL}/utilisateurs/inviter`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        toast.success(
          <div>
            <p className="font-semibold">Invitation envoyée !</p>
            <p className="text-sm">Un email a été envoyé à {formData.email}</p>
          </div>,
          { duration: 5000 }
        )
        
        // Reset form
        setFormData({
          email: "",
          prenom: "",
          nom: "",
          telephone: "",
          roleId: 3
        })
        
        onSuccess()
        onClose()
      } else {
        toast.error(response.data.message || "Erreur lors de l'invitation")
      }
    } catch (error: any) {
      console.error('Erreur invitation:', error)
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.[0]
        || "Erreur lors de l'envoi de l'invitation"
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof InviteFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter un nouvel utilisateur
          </DialogTitle>
          <DialogDescription>
            L'utilisateur recevra un email pour compléter son inscription
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => handleChange("prenom", e.target.value)}
                placeholder="Jean"
                disabled={loading}
                className={errors.prenom ? "border-destructive" : ""}
              />
              {errors.prenom && (
                <p className="text-xs text-destructive">{errors.prenom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                placeholder="Dupont"
                disabled={loading}
                className={errors.nom ? "border-destructive" : ""}
              />
              {errors.nom && (
                <p className="text-xs text-destructive">{errors.nom}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="jean.dupont@safalu.ci"
                disabled={loading}
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
              placeholder="+225 07 12 34 56 78"
              disabled={loading}
              className={errors.telephone ? "border-destructive" : ""}
            />
            {errors.telephone && (
              <p className="text-xs text-destructive">{errors.telephone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Rôle <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.roleId.toString()}
              onValueChange={(value) => handleChange("roleId", parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Super Admin</SelectItem>
                <SelectItem value="2">Admin</SelectItem>
                <SelectItem value="3">Chef de Projet</SelectItem>
                <SelectItem value="4">Comptable</SelectItem>
                <SelectItem value="5">Commercial</SelectItem>
                <SelectItem value="6">Sous-traitant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-900">
              <strong>📧 Email automatique :</strong> L'utilisateur recevra un lien pour définir son mot de passe et activer son compte.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer l'invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}