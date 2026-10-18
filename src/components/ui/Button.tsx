
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

import "./Button.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className = "",
    type = "button",
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  const classes = [
    "krim-button",
    `krim-button--${variant}`,
    `krim-button--${size}`,
    fullWidth ? "krim-button--full" : "",
    loading ? "krim-button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <LoaderCircle
          className="krim-button__spinner"
          size={17}
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span
            className="krim-button__icon"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )
      )}

      {children != null && (
        <span className="krim-button__label">
          {children}
        </span>
      )}

      {!loading && rightIcon && (
        <span
          className="krim-button__icon"
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = "Button";
