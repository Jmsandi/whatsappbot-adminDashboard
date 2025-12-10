import * as React from "react"
import { cn } from "@/lib/utils"

export interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[1rem] border-4 border-foreground bg-input px-4 py-2 text-sm font-medium transition-all neo-shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:translate-x-[-2px] focus:translate-y-[-2px] focus:neo-shadow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
NeoInput.displayName = "NeoInput"

export { NeoInput }
