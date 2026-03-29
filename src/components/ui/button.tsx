import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27023]/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#F27023] to-[#e85d04] text-white shadow-[0_4px_15px_rgba(242,112,35,0.3)] hover:shadow-[0_6px_20px_rgba(242,112,35,0.4)] hover:-translate-y-[2px]",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md hover:-translate-y-[1px]",
        outline:
          "border-2 border-[#e8ecef] bg-white text-[#495057] shadow-sm hover:bg-[#f8f9fa] hover:border-[#F27023]/30 hover:text-[#F27023]",
        secondary:
          "bg-[#f8f9fa] text-[#495057] border border-[#e8ecef] hover:bg-[#e9ecef]",
        ghost:
          "text-[#495057] hover:bg-[#f8f9fa] hover:text-[#F27023]",
        link:
          "text-[#F27023] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-12 rounded-[12px] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
