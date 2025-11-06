import * as React from "react"

    import { cn } from "@/lib/utils"

    const Input = React.forwardRef(({ className, type, ...props }, ref) => {
      return (
        (<input
          type={type}
          className={cn(
            "flex h-12 lg:h-14 w-full min-w-0 max-w-full rounded-2xl border border-input bg-background/50 backdrop-blur-sm px-4 lg:px-5 py-3 lg:py-3.5 text-base lg:text-lg text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base lg:file:text-lg file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50",
            className
          )}
          style={{ fontSize: '16px' }}
          ref={ref}
          aria-invalid={props['aria-invalid']}
          {...props} />)
      );
    })
    Input.displayName = "Input"

    export { Input }