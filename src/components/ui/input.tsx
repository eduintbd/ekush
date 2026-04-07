import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-[14px] font-medium text-text-label">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-[50px] w-full rounded-[5px] border border-input-border bg-input-bg px-5 text-[14px] text-text-dark transition-colors duration-200 placeholder:text-text-muted focus:border-ekush-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
