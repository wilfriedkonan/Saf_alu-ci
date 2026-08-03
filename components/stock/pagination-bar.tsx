"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export const PAGE_SIZE_OPTIONS = [20, 50, 100]

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  loading: boolean
  itemLabel?: string
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  itemLabel = "élément(s)",
}: PaginationBarProps) {
  if (totalPages <= 0) return null

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const end = Math.min(currentPage * pageSize, totalItems)

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "ellipsis")[] = [1]
    const left = Math.max(2, currentPage - 1)
    const right = Math.min(totalPages - 1, currentPage + 1)
    if (left > 2) pages.push("ellipsis")
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push("ellipsis")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {loading ? "Chargement…" : `${start}–${end} sur ${totalItems} ${itemLabel}`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Lignes :</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-0.5">
          <PaginationItem>
            <Button variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(1)} disabled={currentPage === 1 || loading}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          {getPageNumbers().map((page, i) =>
            page === "ellipsis" ? (
              <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <Button
                  variant={page === currentPage ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 text-xs ${page === currentPage ? "bg-[#1e3a5f] hover:bg-[#15293f] text-white" : ""}`}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                >
                  {page}
                </Button>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <Button variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || loading}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
