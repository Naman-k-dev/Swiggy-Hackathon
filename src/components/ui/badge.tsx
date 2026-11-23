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
    default: "bg-charcoal-100 text-charcoal-800 border-charcoal-200",
    success: "bg-veg-light text-veg-dark border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-nonveg-light text-nonveg-dark border-red-200",
    orange: "bg-swiggy-light text-swiggy-dark border-orange-200 font-semibold",
    outline: "bg-transparent text-charcoal-700 border-charcoal-300",
    neutral: "bg-charcoal-900 text-white border-transparent",
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
