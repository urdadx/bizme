import type { ReactNode } from "react";

import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RiHeart3Fill, RiLockLine } from "@remixicon/react";

export function Setup() {
  return (
    <section id="setup" className="px-4 py-6 sm:py-0">
      <div className="max-w-5xl mx-auto">
        <div className="relative z-10 mx-auto  max-w-xl space-y-4 text-center md:space-y-6">
          <h2 className="instrument-serif-regular text-3xl lg:text-4xl">
            Get started in{" "}
            <span className="text-blue-600 bg-blue-100 px-1 rounded relative inline-block z-1">
              3 easy steps
            </span>{" "}
          </h2>
          <p className="text-pretty text-md sm:text-lg text-neutral-500">
            Add Bizme to your website in minutes. Create your site, install the script, and start
            engaging.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-10 pt-4 sm:mt-14 md:grid-cols-3 md:gap-6 lg:gap-8">
          <SetupStep
            step={1}
            title="Create your site"
            description="Create a new site in Bizme with your website name and URL"
            sceneClassName="setup-scene-sky"
            scene={<CreateSiteScene />}
          />
          <SetupStep
            step={2}
            title="Install Bizme"
            description="Copy and paste a single script tag into your website."
            sceneClassName="setup-scene-sunset"
            scene={<InstallScene />}
          />
          <SetupStep
            step={3}
            title="Start engaging"
            description="Your comment section is now live. Your audience can engage with you."
            sceneClassName="setup-scene-meadow"
            scene={<EngageScene />}
          />
        </div>
      </div>
    </section>
  );
}

function SetupStep({
  step,
  title,
  description,
  sceneClassName,
  scene,
}: {
  step: number;
  title: string;
  description: string;
  sceneClassName: string;
  scene: ReactNode;
}) {
  return (
    <Card className="group relative overflow-visible border bg-white p-2 shadow-sm ring-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute top-0 left-1/2 z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm ring-4 ring-white">
        {step}
      </div>
      <CardContent className="rounded-lg border bg-white p-3">
        <div
          className={cn(
            "setup-grain relative flex h-48 items-end justify-center overflow-hidden rounded-lg px-4 pb-4 ring-1 ring-inset ring-black/5",
            sceneClassName,
          )}
        >
          {scene}
        </div>

        <div className="p-2 px-1">
          <h3 className="mb-1 font-sans text-base font-normal">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateSiteScene() {
  return (
    <>
      <div className="relative z-1 w-full max-w-62.5 overflow-hidden rounded-md border border-white/80 bg-white/95 shadow-lg shadow-sky-900/10">
        <div className="flex items-center gap-1.5 border-b bg-gray-50/80 px-3 py-2">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <div className="ml-2 flex h-5 flex-1 items-center gap-1 rounded-full bg-white px-2 font-mono text-[10px] text-gray-500 ring-1 ring-black/5">
            <RiLockLine className="size-2.5 shrink-0" />
            <span className="setup-type-url">yourblog.com</span>
            <span className="setup-caret -ml-0.5 h-3 w-px bg-gray-500" />
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <BrandLogo className="size-7" />
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded-full bg-gray-200" />
              <div className="h-1.5 w-10 rounded-full bg-gray-100" />
            </div>
          </div>
          <span className="setup-created inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            <CheckMarkIcon color="#059669" className="size-3.5" />
            Site created
          </span>
        </div>
      </div>
    </>
  );
}

function InstallScene() {
  return (
    <>
      <div className="relative z-1 w-full max-w-62.5 overflow-hidden rounded-md bg-[#1f2330] shadow-lg shadow-orange-900/20 ring-1 ring-black/20">
        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="ml-2 font-mono text-[10px] text-white/40">index.html</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80">
            <CheckMarkIcon color="#34d399" className="size-3.5" />
            Copied
          </span>
        </div>
        <pre className="px-3 py-2.5 font-mono text-[10.5px] leading-5">
          <span className="block">
            <span className="text-[#f28b82]">&lt;script</span>
          </span>
          <span className="block pl-3">
            <span className="text-[#c3a6ff]">src</span>
            <span className="text-white/50">=</span>
            <span className="text-[#a8e6a3]">"bizme.js"</span>
          </span>
          <span className="block">
            <span className="text-[#f28b82]">&gt;&lt;/script&gt;</span>
          </span>
        </pre>
      </div>
    </>
  );
}

const engageComments = [
  { avatar: "https://i.pravatar.cc/64?img=47", text: "Love this update!", delay: "0s" },
  { avatar: "https://i.pravatar.cc/64?img=12", text: "Let me know what you think", delay: "0.7s" },
];

function EngageScene() {
  return (
    <>
      <div aria-hidden className="absolute right-6 bottom-16 z-2">
        {["0s", "1s", "2s"].map((delay, index) => (
          <RiHeart3Fill
            key={delay}
            className={cn("setup-heart size-4 text-rose-500", index === 1 && "left-3 size-3")}
            style={{ animationDelay: delay }}
          />
        ))}
      </div>

      <div className="relative z-1 w-full max-w-62.5 space-y-2">
        {engageComments.map((comment) => (
          <div
            key={comment.text}
            className="setup-pop flex items-center gap-2 rounded-md bg-white/95 p-2 shadow-md shadow-emerald-900/10 ring-1 ring-black/5"
            style={{ animationDelay: comment.delay }}
          >
            <img
              src={comment.avatar}
              alt=""
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-xs text-gray-700">{comment.text}</span>
            <RiHeart3Fill className="ml-auto size-3 shrink-0 text-rose-400" />
          </div>
        ))}
      </div>
    </>
  );
}
