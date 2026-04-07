import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[5px] text-[13px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ekush-orange/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-ekush-orange border border-ekush-orange text-white hover:bg-white hover:text-ekush-orange",
        destructive:
          "bg-red-500 border border-red-500 text-white hover:bg-white hover:text-red-500",
        outline:
          "border border-navy bg-white text-navy hover:bg-navy hover:text-white",
        secondary:
          "bg-white text-text-dark border border-input-border hover:bg-navy hover:text-white hover:border-navy",
        ghost:
          "text-text-dark hover:bg-page-bg hover:text-ekush-orange",
        link:
          "text-ekush-orange underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
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
