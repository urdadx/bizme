import { ReactIcon } from "@/assets/icons/react-icon";
import { SvelteIcon } from "@/assets/icons/svelte";
import { VueIcon } from "@/assets/icons/vue-icon";
import { WordPressIcon } from "@/assets/icons/wordpress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

export function LandingShare() {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedCommand, setSelectedCommand] = useState(
    "pnpm add @bizme/react",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const frameworks = [
    {
      id: "react",
      label: "React",
      icon: ReactIcon,
      command: "pnpm add @bizme/react",
    },
    {
      id: "vue",
      label: "Vue",
      icon: VueIcon,
      command: "pnpm add @bizme/vue",
    },
    {
      id: "svelte",
      label: "Svelte",
      icon: SvelteIcon,
      command: "pnpm add @bizme/svelte",
    },
    {
      id: "wordpress",
      label: "WordPress",
      icon: WordPressIcon,
      command:
        '<script src="https://comments.bizme.app/wordpress.js"></script>',
    },
  ];

  return (
    <div className="flex flex-col gap-4 size-full transition-[filter,opacity] duration-300 group-hover:opacity-70 group-hover:blur-[3px]-full w-87.5 mx-auto  mask-[linear-gradient(black_70%,transparent)]">
      <div className="w-full mx-3.5 flex origin-top scale-95 cursor-default flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_20px_0_#00000017]">
        <Tabs
          defaultValue="tab-1"
          className="items-center justify-center mx-auto"
        >
          <TabsList className="bg-transparent grid w-full grid-cols-2 ">
            <TabsTrigger
              value="tab-1"
              className="w-full data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              Frameworks
            </TabsTrigger>

            <TabsTrigger
              value="tab-2"
              className="w-full data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              HTML Embed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab-2">
            <div className="space-y-4 p-3 text-center">
              <div>
                <div className="text-sm font-medium text-neutral-900">
                  Add Bizme with one script tag
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Paste the embed snippet into your site to load your comment
                  section.
                </p>
              </div>
              <div className="rounded-lg border bg-muted px-3 py-2 text-left font-mono text-xs text-neutral-600">
                {
                  '<script src="https://cdn.bizme.com/widget.js" data-site-id="bzm_8x4k2" async></script>'
                }
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tab-1">
            <div className="flex justify-center items-center"></div>
            <div className="space-y-2 pt-3 text-center">
              <div className="text-sm font-medium  text-neutral-900">
                Install your framework integration
              </div>
              <p className="text-xs text-neutral-500">
                Use Bizme with your favorite JavaScript framework.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-5">
              {frameworks.map((framework) => (
                <div
                  key={framework.id}
                  className="flex flex-col items-center gap-2"
                >
                  <Button
                    onClick={() => setSelectedCommand(framework.command)}
                    size="icon"
                    variant="outline"
                    aria-label={`${framework.label} integration`}
                    className={cn(
                      "h-12 w-12 rounded-full hover:bg-gray-100",
                      selectedCommand === framework.command &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <framework.icon className="size-6" />
                  </Button>
                  <span className="text-xs capitalize text-muted-foreground">
                    {framework.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-6 text-start">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id="input-53"
                    className="pe-9"
                    type="text"
                    value={selectedCommand}
                    aria-label="Framework install command"
                    readOnly
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
                          aria-label={copied ? "Copied" : "Copy to clipboard"}
                          disabled={copied}
                        >
                          <div
                            className={cn(
                              "transition-all",
                              copied
                                ? "scale-100 opacity-100"
                                : "scale-0 opacity-0",
                            )}
                          >
                            <Check
                              className="stroke-emerald-500"
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          </div>
                          <div
                            className={cn(
                              "absolute transition-all",
                              copied
                                ? "scale-0 opacity-0"
                                : "scale-100 opacity-100",
                            )}
                          >
                            <Copy
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">
                        Copy to clipboard
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
