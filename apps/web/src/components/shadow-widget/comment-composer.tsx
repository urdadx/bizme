import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import "./comment-composer.css";

type ComposerAttachment = {
  id: string;
  name: string;
  url: string;
  revokeOnRemove: boolean;
};

type ShadowCommentComposerProps = {
  defaultValue?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  previewAttachments?: { name: string; url: string }[];
  submitLabel?: "Comment" | "Reply";
};

export function ShadowCommentComposer({
  defaultValue = "",
  disabled = false,
  isSubmitting = false,
  previewAttachments = [],
  submitLabel = "Comment",
}: ShadowCommentComposerProps) {
  const inputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>(() =>
    previewAttachments.map((attachment, index) => ({
      ...attachment,
      id: `preview-${index}`,
      revokeOnRemove: false,
    })),
  );

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      for (const url of objectUrls) URL.revokeObjectURL(url);
    };
  }, []);

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }

  function addFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));

    setError(images.length === files.length ? null : "Only image attachments are supported.");
    const newAttachments = images.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        revokeOnRemove: true,
      };
    });
    setAttachments((current) => [...current, ...newAttachments]);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const attachment = current.find((item) => item.id === id);
      if (attachment?.revokeOnRemove) {
        URL.revokeObjectURL(attachment.url);
        objectUrlsRef.current.delete(attachment.url);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim() || disabled || isSubmitting) return;
    setValue("");
  }

  return (
    <form
      className={`bizme-composer${disabled ? " bizme-composer--disabled" : ""}`}
      onSubmit={handleSubmit}
    >
      <div
        className={`bizme-composer__shell${isDragging ? " bizme-composer__shell--dragging" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && !isSubmitting) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled && !isSubmitting) addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <textarea
          ref={textareaRef}
          className="bizme-composer__textarea"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            resizeTextarea();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Join the conversation..."
          aria-label="Comment"
          disabled={disabled || isSubmitting}
          rows={1}
        />

        {attachments.length > 0 ? (
          <ul className="bizme-composer__attachments" aria-label="Attachments">
            {attachments.map((attachment) => (
              <li className="bizme-composer__attachment" key={attachment.id}>
                <img className="bizme-composer__attachment-image" src={attachment.url} alt="" />
                <span className="bizme-composer__attachment-name">{attachment.name}</span>
                <button
                  type="button"
                  className="bizme-composer__remove"
                  onClick={() => removeAttachment(attachment.id)}
                  aria-label={`Remove ${attachment.name}`}
                >
                  <XIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? <p className="bizme-composer__error">{error}</p> : null}

        <div className="bizme-composer__toolbar">
          <div className="bizme-composer__tools">
            <input
              id={inputId}
              className="bizme-composer__file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={disabled || isSubmitting}
            />
            <label
              className="bizme-composer__icon-button"
              htmlFor={inputId}
              title="Attach images"
              aria-label="Attach images"
            >
              <ImageIcon />
            </label>
          </div>

          <button
            className="bizme-composer__submit"
            type="submit"
            disabled={disabled || isSubmitting || !value.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="bizme-composer__spinner" aria-hidden />
                Posting
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function ImageIcon() {
  return (
    <svg className="bizme-composer__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
        <path d="M22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2" />
        <path d="m2 12.5 1.752-1.533a2.3 2.3 0 0 1 3.14.105l4.29 4.29a2 2 0 0 0 2.564.222l.299-.21a3 3 0 0 1 3.731.225L21 18.5m-6-13h3.5m0 0H22m-3.5 0V9m0-3.5V2" />
      </g>
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="bizme-composer__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m8 8 8 8m0-8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
