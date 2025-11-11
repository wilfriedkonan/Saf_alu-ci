"use client"

import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useRouter } from "next/navigation"

interface StageDQEBadgeProps {
  linkedDqeLotCode?: string // "LOT 2"
  linkedDqeLotName?: string // "GROS ŒUVRE"
  linkedDqeReference?: string // "DQE-2024-023"
}

export function StageDQEBadge({ linkedDqeLotCode, linkedDqeLotName, linkedDqeReference }: StageDQEBadgeProps) {
  const router = useRouter()

  if (!linkedDqeLotCode) {
    return null
  }

  const handleClick = () => {
    if (linkedDqeReference) {
      // Extract ID from reference (e.g., "DQE-2024-023" -> "DQE-2024-023")
      router.push(`/dqe/${linkedDqeReference}`)
    }
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className="cursor-pointer bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900/40 text-xs px-2 py-0.5 transition-colors"
          onClick={handleClick}
        >
          <span className="mr-1">📋</span>
          {linkedDqeLotCode}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-2">
          <p className="text-sm font-medium">Étape créée depuis un lot DQE</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">{linkedDqeLotCode}</span>
              {linkedDqeLotName && ` - ${linkedDqeLotName}`}
            </p>
            {linkedDqeReference && (
              <p className="text-xs">
                DQE: <span className="font-mono">{linkedDqeReference}</span>
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground italic">Cliquez pour voir le DQE complet</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
