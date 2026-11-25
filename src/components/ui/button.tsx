import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swiggy-orange focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-swiggy-orange text-white hover:bg-swiggy-hover shadow-sm hover:shadow",
      secondary:
        "bg-charcoal-900 dark:bg-slate-800 text-white hover:bg-charcoal-800 dark:hover:bg-slate-700 shadow-sm",
      outline:
        "border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 hover:border-charcoal-300 dark:hover:border-slate-600",
      ghost:
        "text-charcoal-700 dark:text-slate-300 hover:bg-charcoal-100/70 dark:hover:bg-slate-800 hover:text-charcoal-900 dark:hover:text-white",
      danger:
        "bg-red-500 text-white hover:bg-red-600 shadow-sm",
      soft:
        "bg-swiggy-light dark:bg-orange-500/20 text-swiggy-orange dark:text-orange-300 hover:bg-swiggy-soft dark:hover:bg-orange-500/30 font-semibold",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
