import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neoButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-[1rem] border-4 border-foreground",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground neo-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground neo-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground neo-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        outline:
          "bg-background text-foreground neo-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-accent",
        ghost: "border-transparent shadow-none hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface NeoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neoButtonVariants> {}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(neoButtonVariants({ variant, size, className }))} ref={ref} {...props} />
})
NeoButton.displayName = "NeoButton"

export { NeoButton, neoButtonVariants }
