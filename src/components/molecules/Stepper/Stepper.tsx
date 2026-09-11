import { Check } from "lucide-react";
import type { Step } from "@/lib/constants/solicitud";

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  return (
    <nav
      aria-label="Pasos del formulario"
      className={`flex items-start justify-between w-full ${className}`}
    >
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive    = step.id === currentStep;
        const isLast      = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-start flex-1">
            {/* Paso + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              {/* Círculo */}
              <div
                aria-current={isActive ? "step" : undefined}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  text-sm font-bold shrink-0
                  transition-colors duration-200
                  ${isCompleted
                    ? "bg-[var(--color-primary)] text-white"
                    : isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-white border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }
                `}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              {/* Label */}
              <span
                className={`
                  text-xs font-medium text-center leading-tight max-w-[80px]
                  ${isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)]"
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora (excepto el último) */}
            {!isLast && (
              <div
                className={`
                  flex-1 h-[2px] mt-4 mx-2
                  ${isCompleted
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-border)]"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
