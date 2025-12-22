import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, noPadding, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-white dark:bg-crm-primary/40 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800",
                    !noPadding && "p-6",
                    className
                )}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"
