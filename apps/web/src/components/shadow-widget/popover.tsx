import { useEffect, useRef, type ReactNode } from "react";

import "./popover.css";

export function ShadowPopover({
  trigger,
  triggerLabel,
  children,
}: {
  trigger: ReactNode;
  triggerLabel: string;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function close(event: PointerEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof PointerEvent && detailsRef.current) {
        if (event.composedPath().includes(detailsRef.current)) return;
      }
      detailsRef.current?.removeAttribute("open");
    }

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  return (
    <details ref={detailsRef} className="bizme-popover">
      <summary aria-label={triggerLabel}>{trigger}</summary>
      <div className="bizme-popover__content bizme-popover__content--compact">
        <div onClick={() => detailsRef.current?.removeAttribute("open")}>{children}</div>
      </div>
    </details>
  );
}
