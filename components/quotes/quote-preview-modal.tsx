"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Percent, Tag } from "lucide-react"
import { 
  Devis, 
  DevisStatutLabels, 
  DevisStatutColors,
  calculateMontantHTBrut,
  calculateMontantRemiseTotal,
  formatCurrency
} from "@/types/devis"
import { useEffect, Fragment } from "react"

interface QuotePreviewModalProps {
  quote: Devis
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuotePreviewModal({ quote, open, onOpenChange }: QuotePreviewModalProps) {
  // Calculer les montants avec remises
  const montantHTBrut = calculateMontantHTBrut(quote)
  const montantRemiseTotal = calculateMontantRemiseTotal(
    montantHTBrut,
    quote.remiseValeur || 0,
    quote.remisePourcentage || 0
  )
  useEffect(()=>{console.log('valeur remise: ', quote.remiseValeur, 'valeur remise Pourcentage: ', quote.remisePourcentage)},[])
  const hasRemise = (quote.remiseValeur && quote.remiseValeur > 0) || 
                    (quote.remisePourcentage && quote.remisePourcentage > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prévisualisation - {quote.numero}</span>
            <div className="flex items-center gap-2">
              {hasRemise && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Tag className="h-3 w-3 mr-1" />
                  Remise appliquée
                </Badge>
              )}
              <Badge className={DevisStatutColors[quote.statut]}>
                {DevisStatutLabels[quote.statut]}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ===== HEADER - Style SAF ALU-CI ===== */}
          <div className="border-b-2 border-primary pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary rounded flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">SAF ALU-CI</h2>
                  <p className="text-xs text-muted-foreground italic">BTP - MENUISERIE ALUMINIUM - DIVERS</p>
                  <p className="text-xs text-muted-foreground mt-1">+225 27 22 23 39 64 / 07 07 08 08 36</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== INFORMATIONS PROFORMAT ===== */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Proformat N° {quote.numero}</h3>
              <span className="text-sm text-muted-foreground">
                Date : {new Date(quote.dateCreation).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {quote.client?.nom && (
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium">Client :</span>
                <span className="text-sm font-bold">{quote.client.nom}</span>
              </div>
            )}

            {quote.contact && (
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium">Contact :</span>
                <span className="text-sm">{quote.contact}</span>
              </div>
            )}

            {quote.chantier && (
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium">Chantier :</span>
                <span className="text-sm font-bold">{quote.chantier}</span>
              </div>
            )}
          </div>

          {/* ===== QUALITÉ MATÉRIEL ===== */}
          {(quote.qualiteMateriel || quote.typeVitrage) && (
            <div>
              <h4 className="text-sm font-bold text-destructive mb-2">QUALITE MATERIEL</h4>
              {quote.qualiteMateriel && (
                <p className="text-sm font-bold">{quote.qualiteMateriel}</p>
              )}
              {quote.typeVitrage && (
                <p className="text-sm">{quote.typeVitrage}</p>
              )}
            </div>
          )}

          <Separator />

          {/* ===== TABLEAU DES SECTIONS ET LIGNES ===== */}
          <div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 font-bold">DESIGNATION</th>
                    <th className="text-center p-3 font-bold w-16">L</th>
                    <th className="text-center p-3 font-bold w-16">H</th>
                    <th className="text-center p-3 font-bold w-16">QTE</th>
                    <th className="text-right p-3 font-bold w-28">P.UNITAIRE</th>
                    <th className="text-right p-3 font-bold w-28">P.TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.sections?.map((section) => (
                    <Fragment key={`section-${section.id}`}>
                      {/* En-tête de section */}
                      <tr className="bg-muted/50">
                        <td colSpan={6} className="p-3 font-bold text-primary">
                          {section.nom}
                        </td>
                      </tr>
                      
                      {/* Lignes de la section */}
                      {section.lignes?.map((ligne) => (
                        <tr key={`ligne-${ligne.id}`} className="border-t hover:bg-muted/20">
                          <td className="p-3">
                            <div className="font-medium text-xs">
                              {ligne.typeElement || ligne.designation}
                            </div>
                          </td>
                          <td className="text-center p-3 text-xs">
                            {ligne.longueur ? formatCurrency(ligne.longueur) : "-"}
                          </td>
                          <td className="text-center p-3 text-xs">
                            {ligne.hauteur ? formatCurrency(ligne.hauteur) : "-"}
                          </td>
                          <td className="text-center p-3 text-xs">
                            {formatCurrency(ligne.quantite)}
                          </td>
                          <td className="text-right p-3 text-xs">
                            {formatCurrency(ligne.prixUnitaireHT)}
                          </td>
                          <td className="text-right p-3 font-bold text-xs">
                            {formatCurrency(ligne.totalHT)}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== TOTAUX AVEC REMISES ===== */}
          <div className="flex justify-end pt-4">
            <div className="w-96 space-y-3">
              {/* Montant HT Brut */}
              {hasRemise && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Montant HT brut :</span>
                  <span>{formatCurrency(montantHTBrut)}</span>
                </div>
              )}

              {/* Remise en pourcentage */}
              {quote.remisePourcentage && quote.remisePourcentage > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Remise {quote.remisePourcentage}% :
                  </span>
                  <span>-{formatCurrency(montantHTBrut * (quote.remisePourcentage / 100))}</span>
                </div>
              )}

              {/* Remise en valeur */}
              {quote.remiseValeur && quote.remiseValeur > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Remise forfaitaire :
                  </span>
                  <span>-{formatCurrency(quote.remiseValeur)}</span>
                </div>
              )}

              {/* Montant total de la remise */}
              {hasRemise && (
                <div className="flex justify-between text-sm font-semibold text-green-600 border-t pt-2">
                  <span>Remise totale :</span>
                  <span>-{formatCurrency(montantRemiseTotal)}</span>
                </div>
              )}

              {/* Montant HT Net */}
              <div className="border-t-2 border-black pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">MONTANT TOTAL HT</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(quote.montantHT)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== ESPACE SIGNATURES ===== */}
          <div className="grid grid-cols-2 gap-16 pt-8">
            <div className="space-y-12">
              <p className="text-sm font-bold">Signature Client</p>
              <div className="border-t border-muted-foreground"></div>
            </div>
            <div className="space-y-12">
              <p className="text-sm font-bold">Signature et cachet</p>
              <div className="border-t border-muted-foreground"></div>
            </div>
          </div>

          <Separator className="bg-destructive" />

          {/* ===== FOOTER ===== */}
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              Abidjan, Akouedo route de Bingerville | Email infos@safalu-ci.com - 27 22 23 29 64 / 08 BP 2932 Abidjan 08
            </p>
            <p className="text-xs text-muted-foreground">
              RC N°: CI ABJ-2018-B-29139 / CCN° 1858272P centre des impôts Abidjan Cocody - Bridge Bank 01105110006 27
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}