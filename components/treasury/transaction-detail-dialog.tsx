"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  FileText, 
  Tag, 
  CreditCard,
  ArrowRightLeft,
  Loader2
} from "lucide-react"
import { formatCurrency, formatDate, typeMouvementColors, MouvementFinancier } from "@/types/tresorerie"
import { TresorerieService } from "@/services/tresorerieService"
import { toast } from "sonner"

interface TransactionDetailDialogProps {
  transactionId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailDialog({ 
  transactionId, 
  open, 
  onOpenChange 
}: TransactionDetailDialogProps) {
  const [transaction, setTransaction] = useState<MouvementFinancier | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && transactionId) {
      fetchTransactionDetails()
    }
  }, [open, transactionId])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`📋 Chargement détails transaction #${transactionId}`)
      const data = await TresorerieService.getMouvementById(transactionId)
      
      setTransaction(data)
      console.log("✅ Détails chargés:", data)
    } catch (err: any) {
      console.error("❌ Erreur chargement détails:", err)
      setError(err.message || "Erreur lors du chargement des détails")
      toast.error("Impossible de charger les détails de la transaction")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const isEntree = transaction?.typeMouvement === "Entree"
  const isSortie = transaction?.typeMouvement === "Sortie"
/*   const isVirement = transaction?.typeMouvement === "Virement"
 */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
         {    <div className={`p-2 rounded-full ${
              isEntree ? "bg-green-100" : "bg-red-100" /* sVirement ? "bg-blue-100" : "bg-red-100" */
            }`}>
              {isEntree ? (
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              ) /* : isVirement ? (
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              ) */ : (
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              )}
            </div> }
            Détails de la transaction
          </DialogTitle>
          <DialogDescription>
            Transaction #{transactionId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Chargement des détails...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 font-medium mb-2">❌ Erreur</div>
            <div className="text-muted-foreground text-sm">{error}</div>
          </div>
        ) : transaction ? (
          <div className="space-y-6">
            {/* Montant et type */}
            <div className="text-center py-6 bg-muted/30 rounded-lg">
              { <div className={`text-4xl font-bold mb-2 ${
                isEntree ? "text-green-600" : "text-red-600" /* isVirement ? "text-blue-600" : "text-red-600" */
              }`}>
                {isEntree ? "+" : "-" /* isVirement ? "→" : "-" */}
                {formatCurrency(transaction.montant)}
              </div> }
              <Badge 
                variant="outline" 
                className={`text-sm ${typeMouvementColors[transaction.typeMouvement as keyof typeof typeMouvementColors] || ''}`}
              >
                {transaction.typeMouvement}
              </Badge>
            </div>

            <Separator />

            {/* Informations principales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations</h3>
              
              {/* Libellé */}
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Libellé</div>
                  <div className="font-medium">{transaction.libelle}</div>
                </div>
              </div>

              {/* Description */}
              {transaction.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="text-sm">{transaction.description}</div>
                  </div>
                </div>
              )}

              {/* Catégorie */}
              {transaction.categorie && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Catégorie</div>
                    <Badge variant="secondary">{transaction.categorie}</Badge>
                    
                  </div>
                </div>
              )}

                {/* Facture */}
                {transaction.facture && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Facture</div>
                    <Badge variant="secondary">{transaction.facture.numero}</Badge>
                    <p><Badge variant="secondary">{transaction.facture?.referenceClient}</Badge></p>

                  </div>
                </div>
              )}

                {/* Projet */}
                {transaction.projet && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Projet</div>
                    <Badge variant="secondary">{transaction.projet.numero}</Badge>
                    <p><Badge>{transaction.projet?.description}</Badge></p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Date du mouvement</div>
                  <div className="font-medium">{formatDate(transaction.dateMouvement)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Comptes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Comptes</h3>

              {/* Compte source */}
              {transaction.compte && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                       "Compte"
                    </div>
                    <div className="font-medium">{transaction.compte.nom}</div>
                    
                  </div>
                </div>
              )}

              {/* Compte destination (pour virements) */}
              {transaction.compteDestination && (
                <>
                  <div className="flex justify-center">
                    <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-blue-600 mb-1 font-medium">
                        Compte destination
                      </div>
                      <div className="font-medium">{transaction.compteDestination.nom}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Type: {transaction.compteDestination.typeCompte} • 
                        Solde: {formatCurrency(transaction.compteDestination.soldeActuel)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Métadonnées */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Métadonnées</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">ID Transaction</div>
                  <div className="font-mono">#{transaction.id}</div>
                </div>
                
                {transaction.dateMouvement && (
                  <div>
                    <div className="text-muted-foreground mb-1">Date de création</div>
                    <div>{formatDate(transaction.dateMouvement)}</div>
                  </div>
                )}
                
                {transaction.dateMouvement && (
                  <div>
                    <div className="text-muted-foreground mb-1">Dernière modification</div>
                    <div>{formatDate(transaction.dateMouvement)}</div>
                  </div>
                )}

                {transaction.utilisateurSaisieProp && (
                  <div>
                    <div className="text-muted-foreground mb-1">Créé par</div>
                    <div>Utilisateur #{transaction.utilisateurSaisieProp.prenom +' '+ transaction.utilisateurSaisieProp.nom }</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pièces jointes (si implémenté) */}
         {/*    {transaction.pieceJointe && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Pièce jointe</h3>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{transaction.pieceJointe}</div>
                    </div>
                  </div>
                </div>
              </>
            )} */}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}