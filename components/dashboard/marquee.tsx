"use client"
import { cn } from "@/lib/utils"

interface MarqueeProps {
  items: { label: string; value: string }[]
  className?: string
}

export function Marquee({ items, className }: MarqueeProps) {
  return (
    <div
      className={cn("overflow-hidden border-y-4 border-foreground bg-primary text-primary-foreground py-3", className)}
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-2 mx-8">
            <span className="w-3 h-3 rounded-full bg-primary-foreground" />
            <span className="font-bold text-sm">{item.label}:</span>
            <span className="font-mono text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
