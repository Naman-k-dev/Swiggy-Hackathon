import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "orange" | "outline" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-charcoal-100 dark:bg-slate-800 text-charcoal-800 dark:text-slate-200 border-charcoal-200 dark:border-slate-700",
    success: "bg-veg-light dark:bg-emerald-950/50 text-veg-dark dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger: "bg-nonveg-light dark:bg-red-950/50 text-nonveg-dark dark:text-red-300 border-red-200 dark:border-red-800",
    orange: "bg-swiggy-light dark:bg-orange-500/20 text-swiggy-dark dark:text-orange-300 border-orange-200 dark:border-orange-500/30 font-semibold",
    outline: "bg-transparent text-charcoal-700 dark:text-slate-300 border-charcoal-300 dark:border-slate-700",
    neutral: "bg-charcoal-900 dark:bg-slate-800 text-white border-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] rounded-full",
    md: "px-2.5 py-1 text-xs rounded-full",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-medium border transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
