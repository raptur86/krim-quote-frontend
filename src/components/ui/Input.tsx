
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import "./FormField.css";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
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
    const inputId = id ?? `krim-input-${generatedId}`;
    const messageId = `${inputId}-message`;

    const describedBy = [
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
        ].filter(Boolean).join(" ")}
      >
        {label && (
          <label className="krim-field__label" htmlFor={inputId}>
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
            error ? "krim-field__control--error" : "",
            disabled ? "krim-field__control--disabled" : "",
          ].filter(Boolean).join(" ")}
        >
          {leftIcon && (
            <span
              className="krim-field__icon"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            {...props}
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            className={[
              "krim-field__input",
              className,
            ].filter(Boolean).join(" ")}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />

          {rightIcon && (
            <span
              className="krim-field__icon"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={messageId}
            className={[
              "krim-field__message",
              error ? "krim-field__message--error" : "",
            ].filter(Boolean).join(" ")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
