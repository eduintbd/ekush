import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ekush-orange/10 text-ekush-orange",
        success: "border-transparent bg-green-50 text-green-700",
        warning: "border-transparent bg-amber-50 text-amber-700",
        danger: "border-transparent bg-red-50 text-red-700",
        outline: "text-text-body border-input-border",
        active: "border-transparent bg-green-50 text-green-600 font-medium",
        pending: "border-transparent bg-amber-50 text-[#E09079] font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
