import * as React from "react"

    import { cn } from "@/lib/utils"

    const Textarea = React.forwardRef(({ className, ...props }, ref) => {
      return (
        (<textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-2xl border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-base text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 resize-y",
            className
          )}
          style={{ fontSize: '16px' }}
          ref={ref}
          aria-invalid={props['aria-invalid']}
          {...props} />)
      );
    })
    Textarea.displayName = "Textarea"

    export { Textarea }