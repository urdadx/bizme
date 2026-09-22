import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

import "./comment-composer.css";
import { ImageIcon, XIcon } from "./icons";

type ComposerAttachment = {
  id: string;
  name: string;
  url: string;
  revokeOnRemove: boolean;
  file?: File;
};

type ShadowCommentComposerProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  compact?: boolean;
  previewAttachments?: { name: string; url: string }[];
  submitLabel?: ReactNode;
  onSubmit?: (value: string, files: File[]) => Promise<void> | void;
  onFilesChange?: (files: File[]) => void;
  hideAttachments?: boolean;
};

export function ShadowCommentComposer({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  disabled = false,
  isSubmitting = false,
  compact = false,
  previewAttachments = [],
  submitLabel = "Comment",
  onSubmit,
  onFilesChange,
  hideAttachments = false,
}: ShadowCommentComposerProps) {
  const inputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>(() =>
    previewAttachments.map((attachment, index) => ({
      ...attachment,
      id: `preview-${index}`,
      revokeOnRemove: false,
    })),
  );
  const [files, setFiles] = useState<File[]>([]);

  const value = controlledValue ?? internalValue;
  const isControlled = controlledValue !== undefined;

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      for (const url of objectUrls) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }

  function updateValue(nextValue: string) {
    if (isControlled) {
      onValueChange?.(nextValue);
    } else {
      setInternalValue(nextValue);
    }
    resizeTextarea();
  }

  function addFiles(nextFiles: File[]) {
    const images = nextFiles.filter((file) => file.type.startsWith("image/"));

    setError(images.length === nextFiles.length ? null : "Only image attachments are supported.");
    const newAttachments = images.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        revokeOnRemove: true,
        file,
      };
    });
    setAttachments((current) => [...current, ...newAttachments]);
    setFiles((current) => [...current, ...images]);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function removeAttachment(id: string) {
    const target = attachments.find((item) => item.id === id);

    if (target?.file) {
      setFiles((current) => current.filter((file) => file !== target.file));
    }

    setAttachments((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;
      const attachment = current[index];
      if (attachment.revokeOnRemove) {
        URL.revokeObjectURL(attachment.url);
        objectUrlsRef.current.delete(attachment.url);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function clearTransientAttachments() {
    setAttachments((current) =>
      current.filter((attachment) => {
        if (attachment.revokeOnRemove) {
          URL.revokeObjectURL(attachment.url);
          objectUrlsRef.current.delete(attachment.url);
        }
        return !attachment.revokeOnRemove;
      }),
    );
    setFiles([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = value.trim();
    if (!body || disabled || isSubmitting) return;

    if (onSubmit) {
      try {
        await onSubmit(body, files);
      } catch {
        return;
      }
      if (!isControlled) setInternalValue("");
      clearTransientAttachments();
      resizeTextarea();
      return;
    }

    updateValue("");
    clearTransientAttachments();
    resizeTextarea();
  }

  return (
    <form
      className={`bizme-composer${compact ? " bizme-composer--compact" : ""}${disabled ? " bizme-composer--disabled" : ""}`}
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
          if (!disabled && !isSubmitting && !hideAttachments)
            addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <textarea
          ref={textareaRef}
          className="bizme-composer__textarea"
          value={value}
          onChange={(event) => updateValue(event.target.value)}
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

        {attachments.length > 0 && !hideAttachments ? (
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
                  <XIcon className="bizme-composer__icon" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? <p className="bizme-composer__error">{error}</p> : null}

        <div className="bizme-composer__toolbar">
          <div className="bizme-composer__tools">
            {!hideAttachments ? (
              <>
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
                  <ImageIcon className="bizme-composer__icon" />
                </label>
              </>
            ) : null}
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