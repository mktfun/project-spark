import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    floatingLabel?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, floatingLabel, id, ...props }, ref) => {
        // Determine the unique ID for the label
        const inputId = id || React.useId()

        return (
            <div className="relative w-full">
                {label && !floatingLabel && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <input
                    id={inputId}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-crm-secondary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:bg-crm-primary/50 dark:border-slate-700 dark:text-white",
                        error && "border-crm-error focus:ring-crm-error",
                        floatingLabel && "peer placeholder-transparent pt-5 pb-1 h-12",
                        className
                    )}
                    ref={ref}
                    placeholder={floatingLabel ? label : props.placeholder}
                    {...props}
                />

                {label && floatingLabel && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "absolute left-3 top-1 text-xs text-slate-500 transition-all",
                            "peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400",
                            "peer-focus:top-1 peer-focus:text-xs peer-focus:text-crm-secondary",
                            error && "peer-focus:text-crm-error text-crm-error"
                        )}
                    >
                        {label}
                    </label>
                )}

                {error && (
                    <p className="mt-1 text-xs text-crm-error font-medium animate-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"
