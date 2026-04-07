import { cn } from "@/lib/utils";
import { Info, CreditCard, CheckCircle, Trophy, type LucideIcon } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  icons?: LucideIcon[];
}

const defaultIcons = [Info, CreditCard, CheckCircle, Trophy];

export function StepIndicator({ currentStep, steps, icons }: StepIndicatorProps) {
  const stepIcons = icons || defaultIcons;
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const Icon = stepIcons[idx] || Info;
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-ekush-orange text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-[12px] mt-2 font-medium",
                  isActive ? "text-text-dark" : "text-text-muted"
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-20 h-[2px] mx-2 mt-[-20px]",
                  idx < currentStep ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
