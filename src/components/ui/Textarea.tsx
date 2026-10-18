
import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
} from "react";

import "./FormField.css";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function Textarea(
  {
    id,
    label,
    error,
    helperText,
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
  const textareaId = id ?? `krim-textarea-${generatedId}`;
  const messageId = `${textareaId}-message`;

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
        <label
          className="krim-field__label"
          htmlFor={textareaId}
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
          "krim-field__control--textarea",
          error ? "krim-field__control--error" : "",
          disabled ? "krim-field__control--disabled" : "",
        ].filter(Boolean).join(" ")}
      >
        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          required={required}
          disabled={disabled}
          className={[
            "krim-field__textarea",
            className,
          ].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
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
});

Textarea.displayName = "Textarea";
