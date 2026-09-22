import { Card, CardContent } from "@/components/ui/card";
import { DitherGradient } from "@/components/dither-kit/gradient";
import { RiCodeSSlashLine, RiGlobalLine } from "@remixicon/react";

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
          {/* Step 1 - Create site */}
          <Card className="relative overflow-visible shadow-sm border p-2 text-shadow-2x bg-gray-50 ring-muted transition-transform duration-170 hover:scale-103">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-sm">
              1
            </div>
            <CardContent className="p-3 bg-white rounded-lg border">
              {/* Visual section with flexible height */}
              <div className="relative min-h-fit overflow-hidden rounded-lg flex items-center justify-center py-4">
                <DitherGradient from="red" direction="up" cell={4} opacity={0.5} />
                <div className="relative w-full max-w-62.5 rounded-lg bg-white p-4 shadow-xs">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <RiGlobalLine className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-normal text-gray-700">New blog</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-2 px-1">
                <h3 className="text-base font-sans font-normal mb-1">Create your site</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Create a new site in Bizme with your website name and URL
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-visible border shadow-sm bg-gray-50 ring-muted p-2 transition-transform duration-170 hover:scale-103">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-sm">
              2
            </div>
            <CardContent className="p-3 bg-white rounded-lg border">
              {/* Visual section with flexible height */}
              <div className="relative min-h-fit overflow-hidden rounded-lg flex items-center justify-center py-4">
                <DitherGradient from="green" direction="up" cell={4} opacity={0.5} />
                <div className="relative w-full max-w-62.5 rounded-lg bg-white p-3 shadow-xs">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <RiCodeSSlashLine className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="text-center w-full">
                      <div className="text-sm font-sans font-normal text-gray-700 mb-2">
                        &lt;script src=&quot;bizme.js&quot;&gt;
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-2 px-1">
                <h3 className="text-base font-sans font-normal  mb-1">Install Bizme</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Copy and paste a single script tag into your website.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-visible border shadow-sm bg-gray-50 ring-muted p-2 transition-transform duration-170 hover:scale-103">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-sm">
              3
            </div>
            <CardContent className="p-3 bg-white rounded-lg border">
              {/* Visual section with flexible height */}
              <div className="relative overflow-hidden rounded-lg py-4 px-4 flex items-center justify-center">
                <DitherGradient from="blue" direction="up" cell={4} opacity={0.5} />
                <div className="relative bg-white rounded-lg p-4.75 shadow-xs w-full max-w-65">
                  <div className="space-y-3">
                    <div className="flex justify-end items-center space-x-2">
                      <div className="bg-blue-500 text-white text-xs px-3 py-2 rounded-lg max-w-[80%]">
                        Love this update!
                      </div>
                    </div>

                    <div className="flex justify-start items-center space-x-2">
                      <div className="bg-blue-400 rounded-md px-2 py-1 flex items-center gap-1.5">
                        <span className="text-xs text-white px-3 py-1">
                          Let me know what you think
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-2 px-1">
                <h3 className="text-base font-sans font-normal mb-1">Start engaging</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your comment section is now live. Your audience can engage with you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
