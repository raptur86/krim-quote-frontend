
import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

import "./FormField.css";
import "./Select.css";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "children"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options?: SelectOption[];
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
}

export const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(function Select(
  {
    id,
    label,
    error,
    helperText,
    placeholder,
    options,
    children,
    size = "md",
    required,
    disabled,
    className = "",
    containerClassName = "",
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? `krim-select-${generatedId}`;
  const messageId = `${selectId}-message`;

  const describedBy =
    [
      ariaDescribedBy,
      error || helperText ? messageId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className={[
        "krim-field",
        containerClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label
          className="krim-field__label"
          htmlFor={selectId}
        >
          {label}
          {required && (
            <span
              className="krim-field__required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <div
        className={[
          "krim-field__control",
          "krim-select-control",
          `krim-select-control--${size}`,
          error ? "krim-field__control--error" : "",
          disabled ? "krim-field__control--disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <select
          {...props}
          ref={ref}
          id={selectId}
          required={required}
          disabled={disabled}
          className={[
            "krim-select",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options
            ? options.map((option) => (
                <option
                  key={String(option.value)}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>

        <ChevronDown
          className="krim-select__arrow"
          size={17}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </div>

      {(error || helperText) && (
        <p
          id={messageId}
          className={[
            "krim-field__message",
            error
              ? "krim-field__message--error"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";
