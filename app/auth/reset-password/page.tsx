"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, Lock } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [tokenValide, setTokenValide] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nouveauMotDePasse: "",
    confirmationMotDePasse: ""
  })

  const [errors, setErrors] = useState<any>({})

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      toast.error("Token manquant")
      router.push('/auth/forgot-password')
      return
    }

    validerToken()
  }, [token])

  const validerToken = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/validate-reset-token?token=${token}`
      )

      if (response.data.success && response.data.tokenValide) {
        setTokenInfo(response.data)
        setTokenValide(true)
      } else {
        toast.error(response.data.message || "Token invalide ou expiré")
        setTokenValide(false)
      }
    } catch (error: any) {
      console.error('Erreur validation token:', error)
      toast.error("Erreur lors de la validation du token")
      setTokenValide(false)
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password: string): string[] => {
    const errors = []
    
    if (password.length < 8) {
      errors.push("Au moins 8 caractères")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Une lettre majuscule")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Une lettre minuscule")
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Un chiffre")
    }
    
    return errors
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}

    const passwordErrors = validatePassword(formData.nouveauMotDePasse)
    if (passwordErrors.length > 0) {
      newErrors.nouveauMotDePasse = passwordErrors
    }

    if (formData.nouveauMotDePasse !== formData.confirmationMotDePasse) {
      newErrors.confirmationMotDePasse = "Les mots de passe ne correspondent pas"
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

    setSubmitting(true)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        {
          token,
          ...formData
        }
      )

      if (response.data.success) {
        setResetSuccess(true)
        toast.success("Mot de passe réinitialisé avec succès !")

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        toast.error(response.data.message || "Erreur lors de la réinitialisation")
      }
    } catch (error: any) {
      console.error('Erreur réinitialisation:', error)
      
      const errorMessage = error.response?.data?.message 
        || "Erreur lors de la réinitialisation. Veuillez réessayer."
      
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Vérification du lien...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Token invalide
  if (!tokenValide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Lien invalide ou expiré</CardTitle>
            <CardDescription>
              Ce lien de réinitialisation n'est plus valide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Ce lien a peut-être expiré ou a déjà été utilisé. Les liens de réinitialisation sont valables pendant 1 heure seulement.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full" 
              onClick={() => router.push('/auth/forgot-password')}
            >
              Faire une nouvelle demande
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Succès
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Mot de passe réinitialisé !</CardTitle>
            <CardDescription>
              Votre mot de passe a été modifié avec succès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-center text-muted-foreground mt-4">
              Redirection automatique dans 3 secondes...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passwordStrength = validatePassword(formData.nouveauMotDePasse)
  const passwordScore = 4 - passwordStrength.length

  // Formulaire de réinitialisation
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>
            Choisissez un mot de passe sécurisé pour votre compte
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Infos utilisateur */}
          <Alert className="mb-6">
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">{tokenInfo.nomComplet}</p>
                <p className="text-sm text-muted-foreground">{tokenInfo.email}</p>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="nouveauMotDePasse">
                Nouveau mot de passe <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nouveauMotDePasse"
                  type={showPassword ? "text" : "password"}
                  value={formData.nouveauMotDePasse}
                  onChange={(e) => setFormData(prev => ({ ...prev, nouveauMotDePasse: e.target.value }))}
                  placeholder="••••••••"
                  disabled={submitting}
                  className={errors.nouveauMotDePasse ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Force du mot de passe */}
              {formData.nouveauMotDePasse && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordScore
                            ? passwordScore === 4
                              ? 'bg-green-500'
                              : passwordScore === 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Requis : {passwordStrength.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmationMotDePasse">
                Confirmer le mot de passe <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmationMotDePasse"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmationMotDePasse}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmationMotDePasse: e.target.value }))}
                  placeholder="••••••••"
                  disabled={submitting}
                  className={errors.confirmationMotDePasse ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmationMotDePasse && (
                <p className="text-xs text-destructive">{errors.confirmationMotDePasse}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Réinitialiser mon mot de passe
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}