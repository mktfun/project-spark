import * as React from "react"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Since class-variance-authority wasn't explicitly in the dependencies list I saw earlier (I saw clsx and tailwind-merge), 
// I will implement this WITHOUT cva if it's not installed. 
// checking package.json content again from memory... 
// It had "clsx", "tailwind-merge", "framer-motion", "lucide-react". 
// It did NOT have "class-variance-authority". 
// I will rewrite this to use plain objects/switch for variants to avoid adding a dependency.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crm-secondary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-crm-primary"

        const variants = {
            primary: "bg-crm-primary text-white hover:bg-crm-primary/90 active:bg-crm-primary/95", // Deep Navy
            secondary: "bg-crm-secondary text-white hover:bg-crm-secondary/90 active:bg-crm-secondary/95", // Royal Blue
            ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-crm-primary/50",
            danger: "bg-crm-error text-white hover:bg-crm-error/90 active:bg-crm-error/95", // Crimson
        }

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
        }

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"
