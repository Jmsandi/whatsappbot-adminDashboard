"use client"

import * as React from "react"
import { NeoCard } from "@/components/ui/neo-card"
import { NeoInput } from "@/components/ui/neo-input"
import { NeoButton } from "@/components/ui/neo-button"
import { cn } from "@/lib/utils"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  actions?: (item: T) => React.ReactNode
  className?: string
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <NeoCard className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b-4 border-foreground">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <NeoInput placeholder={searchPlaceholder} value={searchQuery} onChange={handleSearch} className="pl-12" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-4 border-foreground bg-secondary">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn("px-4 py-3 text-left text-sm font-bold uppercase tracking-wide", column.className)}
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b-2 border-muted transition-colors hover:bg-accent",
                  index % 2 === 0 ? "bg-card" : "bg-secondary/30",
                )}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={cn("px-4 py-3 text-sm", column.className)}>
                    {column.render ? column.render(item) : String(item[column.key as keyof T] ?? "")}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(item)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t-4 border-foreground flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <NeoButton
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </NeoButton>
            <NeoButton
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </NeoButton>
          </div>
        </div>
      )}
    </NeoCard>
  )
}
