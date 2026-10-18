
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./Card.css";

/* -----------------------------------------
   Card
----------------------------------------- */

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "flat" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

export function Card({
  children,
  variant = "default",
  padding = "none",
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        "krim-card",
        `krim-card--${variant}`,
        `krim-card--padding-${padding}`,
        hoverable ? "krim-card--hoverable" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/* -----------------------------------------
   Card Header
----------------------------------------- */

export interface CardHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export function CardHeader({
  title,
  description,
  action,
  children,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      {...props}
      className={[
        "krim-card__header",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="krim-card__header-content">
        {title && (
          <h3 className="krim-card__title">
            {title}
          </h3>
        )}

        {description && (
          <p className="krim-card__description">
            {description}
          </p>
        )}

        {children}
      </div>

      {action && (
        <div className="krim-card__action">
          {action}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------
   Card Body
----------------------------------------- */

export interface CardBodyProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({
  children,
  className = "",
  ...props
}: CardBodyProps) {
  return (
    <div
      {...props}
      className={[
        "krim-card__body",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/* -----------------------------------------
   Card Footer
----------------------------------------- */

export interface CardFooterProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      {...props}
      className={[
        "krim-card__footer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/* -----------------------------------------
   Dashboard Stat Card
----------------------------------------- */

export interface StatCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  trend?: ReactNode;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  accentColor,
  className = "",
  style,
  ...props
}: StatCardProps) {
  const customStyle: CSSProperties = {
    ...style,
    ...(accentColor
      ? {
          "--krim-stat-accent": accentColor,
        } as CSSProperties
      : {}),
  };

  return (
    <Card
      {...props}
      variant="default"
      padding="md"
      className={[
        "krim-stat-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={customStyle}
    >
      <div className="krim-stat-card__top">
        <span className="krim-stat-card__title">
          {title}
        </span>

        {icon && (
          <span
            className="krim-stat-card__icon"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div className="krim-stat-card__value">
        {value}
      </div>

      {(description || trend) && (
        <div className="krim-stat-card__bottom">
          {trend && (
            <span className="krim-stat-card__trend">
              {trend}
            </span>
          )}

          {description && (
            <span className="krim-stat-card__description">
              {description}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
