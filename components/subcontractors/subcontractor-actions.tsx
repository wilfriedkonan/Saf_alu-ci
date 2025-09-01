"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Eye, Edit, Star, Mail, Phone, UserPlus, UserX, Pause } from "lucide-react"
import { type Subcontractor, updateSubcontractorStatus } from "@/lib/subcontractors"
import { SubcontractorDetailModal } from "./subcontractor-detail-modal"
import { EvaluationModal } from "./evaluation-modal"
import { toast } from "@/hooks/use-toast"

interface SubcontractorActionsProps {
  subcontractor: Subcontractor
  onUpdate: () => void
}

export function SubcontractorActions({ subcontractor, onUpdate }: SubcontractorActionsProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<"actif" | "suspendu" | "inactif">("actif")

  const handleContact = (type: "email" | "phone") => {
    if (type === "email") {
      window.open(`mailto:${subcontractor.email}`)
    } else {
      window.open(`tel:${subcontractor.phone}`)
    }
    toast({
      title: "Contact initié",
      description: `Contact ${type === "email" ? "email" : "téléphonique"} avec ${subcontractor.name}`,
    })
  }

  const handleStatusChange = (status: "actif" | "suspendu" | "inactif") => {
    setNewStatus(status)
    setShowStatusDialog(true)
  }

  const confirmStatusChange = () => {
    updateSubcontractorStatus(subcontractor.id, newStatus)
    onUpdate()
    setShowStatusDialog(false)
    toast({
      title: "Statut modifié",
      description: `${subcontractor.name} est maintenant ${newStatus}`,
    })
  }

  const handleAssignProject = () => {
    toast({
      title: "Assignation de projet",
      description: `Interface d'assignation pour ${subcontractor.name}`,
    })
  }

  const getStatusAction = () => {
    switch (subcontractor.status) {
      case "actif":
        return [
          {
            label: "Suspendre",
            icon: Pause,
            action: () => handleStatusChange("suspendu"),
            color: "text-yellow-600",
          },
          {
            label: "Désactiver",
            icon: UserX,
            action: () => handleStatusChange("inactif"),
            color: "text-red-600",
          },
        ]
      case "suspendu":
        return [
          {
            label: "Réactiver",
            icon: UserPlus,
            action: () => handleStatusChange("actif"),
            color: "text-green-600",
          },
          {
            label: "Désactiver",
            icon: UserX,
            action: () => handleStatusChange("inactif"),
            color: "text-red-600",
          },
        ]
      case "inactif":
        return [
          {
            label: "Réactiver",
            icon: UserPlus,
            action: () => handleStatusChange("actif"),
            color: "text-green-600",
          },
        ]
      default:
        return []
    }
  }

  const statusActions = getStatusAction()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDetail(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Voir détail
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEvaluation(true)}>
            <Star className="mr-2 h-4 w-4" />
            Évaluer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAssignProject}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assigner projet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleContact("email")}>
            <Mail className="mr-2 h-4 w-4" />
            Envoyer email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleContact("phone")}>
            <Phone className="mr-2 h-4 w-4" />
            Appeler
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {statusActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <DropdownMenuItem key={index} onClick={action.action} className={action.color}>
                <IconComponent className="mr-2 h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <SubcontractorDetailModal
        subcontractor={subcontractor}
        open={showDetail}
        onOpenChange={setShowDetail}
        onUpdate={onUpdate}
      />

      <EvaluationModal
        subcontractor={subcontractor}
        open={showEvaluation}
        onOpenChange={setShowEvaluation}
        onUpdate={onUpdate}
      />

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir changer le statut de {subcontractor.name} vers "{newStatus}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Annuler
            </Button>
            <Button onClick={confirmStatusChange}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
