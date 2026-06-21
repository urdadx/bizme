import { GalleryLinear } from "@/assets/icons/gallery-icon";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { X } from "lucide-react";
import type { CSSProperties, ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

type SelectedImage = {
  file: File;
  previewUrl: string;
};

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function CommentComposer({
  uploadId = "comment-file-upload",
  onSubmit,
  isSubmitting = false,
  customization,
}: {
  uploadId?: string;
  onSubmit?: (body: string, images: File[]) => Promise<void> | void;
  isSubmitting?: boolean;
  customization?: {
    brandColor?: string;
    textColor?: string;
  };
}) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);
  const colorStyle = {
    "--comment-brand-color": customization?.brandColor ?? "var(--ring)",
    "--comment-text-color": customization?.textColor ?? "currentColor",
    color: customization?.textColor,
    borderColor: customization?.brandColor,
  } as CSSProperties;

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, []);

  const handleSubmit = async () => {
    const body = input.trim();

    if (body) {
      await onSubmit?.(
        body,
        images.map((image) => image.file),
      );
      for (const image of images) {
        URL.revokeObjectURL(image.previewUrl);
      }
      setInput("");
      setImages([]);
      setFileError(null);

      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const validImages: SelectedImage[] = [];
    const rejectedFiles: string[] = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        rejectedFiles.push(`${file.name} is not an image.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        rejectedFiles.push(`${file.name} is larger than 2 MB.`);
        continue;
      }

      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setFileError(rejectedFiles[0] ?? null);
    setImages((prev) => [...prev, ...validImages]);

    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];

      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return prev.filter((_, i) => i !== index);
    });
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  return (
    <PromptInput
      value={input}
      onValueChange={setInput}
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
      style={colorStyle}
      className="flex w-full min-w-0 flex-col rounded-xl shadow-none focus-within:ring-2 focus-within:ring-[var(--comment-brand-color)]"
    >
      {images.length > 0 && (
        <div className="grid max-h-44 w-full min-w-0 grid-cols-2 gap-2 overflow-y-auto pb-2 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image.file.name}-${image.previewUrl}`}
              className="group relative overflow-hidden rounded-lg border bg-secondary"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={image.previewUrl}
                alt={image.file.name}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[11px] text-white">
                <div className="truncate">{image.file.name}</div>
                <div>{formatFileSize(image.file.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {fileError ? <p className="pb-2 text-xs text-destructive">{fileError}</p> : null}

      <div className="flex min-w-0 items-end gap-2">
        <PromptInputAction tooltip="Attach files">
          <label
            htmlFor={uploadId}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-2xl hover:bg-secondary-foreground/10"
          >
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id={uploadId}
            />
            <GalleryLinear color={customization?.textColor ?? "currentColor"} className="size-5" />
          </label>
        </PromptInputAction>

        <PromptInputTextarea
          placeholder="Write a reply..."
          style={{ color: customization?.textColor }}
          className="min-h-8 flex-1 py-1"
        />

        <PromptInputActions className="shrink-0">
          <PromptInputAction tooltip="Submit reply">
            <Button
              variant="default"
              size="sm"
              style={{
                backgroundColor: customization?.brandColor,
                color: customization?.textColor,
              }}
              disabled={isSubmitting || input.trim().length === 0}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Replying..." : "Reply"}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </div>
    </PromptInput>
  );
}
