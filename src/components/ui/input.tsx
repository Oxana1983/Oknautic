import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy-800 font-display"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-navy-400 text-sm select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-900",
              "placeholder:text-navy-400",
              "focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-150",
              "disabled:bg-navy-50 disabled:text-navy-400 disabled:cursor-not-allowed",
              error && "border-red-400 focus:ring-red-400",
              prefix && "pl-8",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
