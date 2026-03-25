"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "@/lib/utils"

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=default]:bg-primary data-[variant=default]:text-primary-foreground data-[variant=default]:hover:bg-primary/90 data-[variant=destructive]:bg-destructive data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/90 data-[variant=outline]:border data-[variant=outline]:border-input data-[variant=outline]:bg-background data-[variant=outline]:hover:bg-accent data-[variant=outline]:hover:text-accent-foreground data-[variant=secondary]:bg-secondary data-[variant=secondary]:text-secondary-foreground data-[variant=secondary]:hover:bg-secondary/80 data-[variant=ghost]:hover:bg-accent data-[variant=ghost]:hover:text-accent-foreground data-[variant=link]:text-primary data-[variant=link]:underline-offset-4 hover:data-[variant=link]:underline data-[size=default]:h-9 data-[size=default]:px-4 data-[size=default]:py-2 data-[size=sm]:h-8 data-[size=sm]:px-3 data-[size=lg]:h-10 data-[size=lg]:px-8 data-[size=icon]:size-9",
        className
      )}
      {...props}
    />
  )
}

export { Button }
