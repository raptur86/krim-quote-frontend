
import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

import "./Modal.css";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title" | "onClose"
  > {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  loading = false,
  className = "",
  ...props
}: ModalProps) {
  const generatedId = useId();

  const titleId = `krim-modal-title-${generatedId}`;
  const descriptionId =
    `krim-modal-description-${generatedId}`;

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const dialog = dialogRef.current;

    const getFocusableElements = () => {
      if (!dialog) return [];

      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        )
      ).filter((element) => {
        return (
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true"
        );
      });
    };

    const focusableElements = getFocusableElements();

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      dialog?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (closeOnEscape && !loading) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== "Tab") return;

      const elements = getFocusableElements();

      if (elements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === dialog) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || active === dialog) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocusRef.current?.focus();
    };
  }, [open, closeOnEscape, loading]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleOverlayClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target === event.currentTarget &&
      closeOnOverlayClick &&
      !loading
    ) {
      onClose();
    }
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="krim-modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        {...props}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          description ? descriptionId : undefined
        }
        tabIndex={-1}
        className={[
          "krim-modal",
          `krim-modal--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="krim-modal__header">
          <div className="krim-modal__heading">
            <h2
              id={titleId}
              className="krim-modal__title"
            >
              {title}
            </h2>

            {description && (
              <p
                id={descriptionId}
                className="krim-modal__description"
              >
                {description}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              className="krim-modal__close"
              onClick={onClose}
              disabled={loading}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="krim-modal__body">
          {children}
        </div>

        {footer && (
          <div className="krim-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
