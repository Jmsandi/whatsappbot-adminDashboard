import * as React from "react"
import { cn } from "@/lib/utils"

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const NeoCard = React.forwardRef<HTMLDivElement, NeoCardProps>(({ className, hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[1rem] border-4 border-foreground bg-card text-card-foreground neo-shadow transition-all duration-200",
      hover && "hover:translate-x-[-4px] hover:translate-y-[-4px] hover:neo-shadow-hover cursor-pointer",
      className,
    )}
    {...props}
  />
))
NeoCard.displayName = "NeoCard"

const NeoCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
NeoCardHeader.displayName = "NeoCardHeader"

const NeoCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-bold leading-none tracking-tight", className)} {...props} />
  ),
)
NeoCardTitle.displayName = "NeoCardTitle"

const NeoCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
NeoCardDescription.displayName = "NeoCardDescription"

const NeoCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
NeoCardContent.displayName = "NeoCardContent"

const NeoCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
NeoCardFooter.displayName = "NeoCardFooter"

export { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardDescription, NeoCardContent, NeoCardFooter }
