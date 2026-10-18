
import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import "./Badge.css";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "danger";

export type BadgeSize = "sm" | "md";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const classes = [
    "krim-badge",
    `krim-badge--${variant}`,
    `krim-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {dot && (
        <span
          className="krim-badge__dot"
          aria-hidden="true"
        />
      )}

      <span className="krim-badge__label">
        {children}
      </span>
    </span>
  );
}
