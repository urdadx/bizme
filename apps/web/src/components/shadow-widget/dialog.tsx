import { useRef, type ReactNode } from "react";

import "./dialog.css";

export function ShadowDialog({
  triggerLabel,
  title,
  description,
  children,
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="bizme-dialog__button bizme-dialog__button--primary"
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="bizme-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="bizme-dialog__content">
          <header className="bizme-dialog__header">
            <h2 className="bizme-dialog__title">{title}</h2>
            {description ? <p className="bizme-dialog__description">{description}</p> : null}
          </header>

          <button
            type="button"
            className="bizme-dialog__close"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>

          {children ? <div className="bizme-dialog__body">{children}</div> : null}

          <footer className="bizme-dialog__footer">
            <button
              type="button"
              className="bizme-dialog__button"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bizme-dialog__button bizme-dialog__button--primary"
              onClick={() => dialogRef.current?.close()}
            >
              Continue
            </button>
          </footer>
        </div>
      </dialog>
    </>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
