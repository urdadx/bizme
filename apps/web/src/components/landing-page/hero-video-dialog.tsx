import LandingImage from "@/assets/landing-showcase.png";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface HeroVideoProps {
  videoSrc: string;
  thumbnailAlt?: string;
  className?: string;
}

export default function HeroVideoDialog({
  videoSrc,
  thumbnailAlt = "Video thumbnail",
  className,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className={cn("relative bg-gray-50 p-2 rounded-lg shadow-sm", className)}>
      <div className="bg-white rounded-lg border p-3">
        <button
          type="button"
          aria-label="Play video"
          className="group relative cursor-pointer border-0 bg-transparent p-0 w-full block"
          onClick={() => setIsVideoOpen(true)}
        >
          <img
            src={LandingImage}
            alt={thumbnailAlt}
            width={1920}
            height={1080}
            className="w-full rounded-md shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.99]"
          />

        </button>
      </div>

      {typeof document !== "undefined" &&
        isVideoOpen &&
        createPortal(
          <div
            // biome-ignore lint/a11y/useSemanticElements: closes when users click outside the video.
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                setIsVideoOpen(false);
              }
            }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <div className="relative mx-4 w-full max-w-4xl md:mx-0 bg-gray-50 p-2 rounded-lg shadow-sm">
              <button
                type="button"
                aria-label="Close video"
                className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
                onClick={() => setIsVideoOpen(false)}
              >
                <XIcon className="size-5" />
              </button>
              <div className="bg-white rounded-lg border p-3">
                <div className="relative isolate z-1 aspect-video w-full overflow-hidden rounded-md">
                  <iframe
                    src={videoSrc}
                    title="Hero Video player"
                    className="size-full rounded-md"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
