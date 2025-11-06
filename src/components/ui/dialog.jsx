import * as React from "react"
    import * as DialogPrimitive from "@radix-ui/react-dialog"
    import { X } from "lucide-react"

    import { cn } from "@/lib/utils"

    const Dialog = DialogPrimitive.Root

    const DialogTrigger = DialogPrimitive.Trigger

    const DialogPortal = ({
      className,
      ...props
    }) => (
      <DialogPrimitive.Portal className={cn(className)} {...props} />
    )
    DialogPortal.displayName = DialogPrimitive.Portal.displayName

    const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-300 overflow-hidden",
          className
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        {...props} />
    ))
    DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

    const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg lg:max-w-2xl xl:max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-3 sm:gap-4 lg:gap-6 glass-effect custom-scrollbar rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto overflow-x-hidden duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] transition-all ease-out",
            className
          )}
          {...props}>
          {children}
          <DialogPrimitive.Close
            className="absolute right-3 top-3 sm:right-4 sm:top-4 lg:right-6 lg:top-6 rounded-full p-2 lg:p-2.5 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-primary/10 hover:text-primary active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center">
            <X className="h-5 w-5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    ))
    DialogContent.displayName = DialogPrimitive.Content.displayName

    const DialogHeader = ({
      className,
      ...props
    }) => (
      <div
        className={cn("flex flex-col space-y-2 sm:space-y-3 text-center sm:text-left pb-3 sm:pb-4 border-b border-border/30 mb-4 sm:mb-6", className)}
        {...props} />
    )
    DialogHeader.displayName = "DialogHeader"

    const DialogFooter = ({
      className,
      ...props
    }) => (
      <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-border/30 mt-4 sm:mt-6", className)}
        {...props} />
    )
    DialogFooter.displayName = "DialogFooter"

    const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
      <DialogPrimitive.Title
        ref={ref}
        className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground", className)}
        {...props} />
    ))
    DialogTitle.displayName = DialogPrimitive.Title.displayName

    const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
      <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm sm:text-base md:text-lg lg:text-xl text-text-secondary leading-relaxed mt-1 sm:mt-2", className)}
        {...props} />
    ))
    DialogDescription.displayName = DialogPrimitive.Description.displayName

    export {
      Dialog,
      DialogTrigger,
      DialogContent,
      DialogHeader,
      DialogFooter,
      DialogTitle,
      DialogDescription,
    }