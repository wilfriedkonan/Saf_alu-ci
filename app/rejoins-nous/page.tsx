"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, Shield } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL /* || 'http://localhost:5264/api' */
const INDEX_URL = process.env.NEXT_INDEX 

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [tokenValide, setTokenValide] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    motDePasse: "",
    confirmationMotDePasse: ""
  })

  const [errors, setErrors] = useState<any>({})

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      toast.error("Token manquant")
      router.push(API_BASE_URL)
      return
    }

    validerToken()
  }, [token])

  const validerToken = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/utilisateurs/invitation/valider?token=${token}`
      )

      if (response.data.success && response.data.data.tokenValide) {
        setTokenInfo(response.data.data)
        setTokenValide(true)
        
        // Préremplir le username avec email prefix
        const emailPrefix = response.data.data.email.split('@')[0]
        setFormData(prev => ({ ...prev, username: emailPrefix }))
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

    if (!formData.username.trim()) {
      newErrors.username = "Nom d'utilisateur requis"
    } else if (formData.username.length < 3) {
      newErrors.username = "Minimum 3 caractères"
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = "Caractères alphanumériques uniquement (.,_,-)"
    }

    const passwordErrors = validatePassword(formData.motDePasse)
    if (passwordErrors.length > 0) {
      newErrors.motDePasse = passwordErrors
    }

    if (formData.motDePasse !== formData.confirmationMotDePasse) {
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
        `${API_BASE_URL}/utilisateurs/completer-inscription`,
        {
          token,
          ...formData
        }
      )

      if (response.data.success) {
        toast.success(
          <div>
            <p className="font-semibold">Inscription complétée !</p>
            <p className="text-sm">Vous pouvez maintenant vous connecter</p>
          </div>,
          { duration: 5000 }
        )

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        toast.error(response.data.message || "Erreur lors de l'inscription")
      }
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      
      const errorMessage = error.response?.data?.message 
        || "Erreur lors de la complétion de l'inscription"
      
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Vérification de votre invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invitation invalide</CardTitle>
            <CardDescription>
              Ce lien d'invitation est invalide ou a expiré
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur pour recevoir une nouvelle invitation.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full" 
              onClick={() => router.push('/auth/login')}
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passwordStrength = validatePassword(formData.motDePasse)
  const passwordScore = 4 - passwordStrength.length

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Bienvenue chez SAF ALU-CI !</CardTitle>
          <CardDescription>
            Complétez votre inscription pour accéder à la plateforme
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Infos utilisateur */}
          <Alert className="mb-6">
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">{tokenInfo.prenom} {tokenInfo.nom}</p>
                <p className="text-sm text-muted-foreground">{tokenInfo.email}</p>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Nom d'utilisateur <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="jean.dupont"
                disabled={submitting}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Uniquement lettres, chiffres et .,_,-
              </p>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="motDePasse">
                Mot de passe <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="motDePasse"
                  type={showPassword ? "text" : "password"}
                  value={formData.motDePasse}
                  onChange={(e) => setFormData(prev => ({ ...prev, motDePasse: e.target.value }))}
                  placeholder="••••••••"
                  disabled={submitting}
                  className={errors.motDePasse ? "border-destructive pr-10" : "pr-10"}
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
              {formData.motDePasse && (
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
                  Inscription en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Finaliser mon inscription
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}