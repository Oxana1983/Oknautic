import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "brand"
  | "category"
  | "pending"
  | "accepted"
  | "withdrawn"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:   "bg-navy-100 text-navy-800",
  brand:     "bg-navy-800 text-white",
  category:  "bg-teal-100 text-teal-700",
  pending:   "bg-gold-100 text-gold-700",
  accepted:  "bg-teal-100 text-teal-700",
  withdrawn: "bg-gray-100 text-gray-500",
  success:   "bg-green-100 text-green-700",
  warning:   "bg-amber-100 text-amber-700",
  danger:    "bg-red-100 text-red-700",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-display",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
