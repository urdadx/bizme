import { useEffect, useRef, useState } from "react";

import "./select.css";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

export function ShadowSelect<T extends string>({
  label,
  options,
  defaultValue,
  onValueChange,
}: {
  label: string;
  options: readonly SelectOption<T>[];
  defaultValue: T;
  onValueChange?: (value: T) => void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [value, setValue] = useState(defaultValue);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function close(event: PointerEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof PointerEvent && detailsRef.current?.contains(event.target as Node))
        return;
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
    <details ref={detailsRef} className="bizme-select">
      <summary className="bizme-select__trigger" aria-label={label}>
        <span>{selected?.label}</span>
        <ChevronIcon />
      </summary>
      <div className="bizme-select__content" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            role="option"
            aria-selected={option.value === value}
            className="bizme-select__item"
            key={option.value}
            onClick={() => {
              setValue(option.value);
              onValueChange?.(option.value);
              detailsRef.current?.removeAttribute("open");
            }}
          >
            {option.label}
            {option.value === value ? <CheckIcon /> : null}
          </button>
        ))}
      </div>
    </details>
  );
}

function ChevronIcon() {
  return (
    <svg className="bizme-select__chevron" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="bizme-select__check" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m9.55 18-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" />
    </svg>
  );
}
