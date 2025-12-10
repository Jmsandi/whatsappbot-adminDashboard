"use client"
import { NeoCard, NeoCardContent } from "@/components/ui/neo-card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <NeoCard hover className={cn("", className)}>
      <NeoCardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold">{value}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-bold",
                  trend.isPositive ? "text-success" : "text-destructive",
                )}
              >
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground font-medium">vs last week</span>
              </div>
            )}
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </NeoCardContent>
    </NeoCard>
  )
}
