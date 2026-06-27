import { Card, CardContent } from "@/components/ui/card";
import { RiRobot2Line, RiUploadCloud2Line } from "@remixicon/react";
import { Sparkles } from "lucide-react";

export function Setup() {
  return (
    <section id="howtouse" className=" py-6 sm:y-0 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative z-10 mx-auto  max-w-xl space-y-4 text-center md:space-y-6">
          <h2 className="instrument-serif-regular text-3xl lg:text-4xl">
            Get started in{" "}
            <span className="text-blue-600 bg-blue-100 px-1 rounded relative inline-block z-1">
              3 easy steps
            </span>{" "}
          </h2>
          <p className="text-pretty text-lg text-neutral-500">
            Setting up your AI-powered customer support is quick and easy. Just follow these simple
            steps to get started.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-4 sm:mt-14">
          {/* Step 1 - PDF Upload */}
          <Card className="relative overflow-visible shadow-sm border p-2 text-shadow-2x bg-gray-50 ring-muted transition-transform duration-170 hover:scale-103">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-sm">
              1
            </div>
            <CardContent className="p-3 bg-white rounded-lg border">
              {/* Visual section with flexible height */}
              <div className="bg-linear-to-br rounded-lg from-blue-200 via-blue-100 to-gray-200 relative min-h-fit flex items-center justify-center py-4">
                <div className="bg-white rounded-lg p-4 shadow-xs min-w-62.5">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <RiUploadCloud2Line className="w-12 h-12 text-blue-400" />
                      {/* <UploadCloud className="w-12 h-12 text-blue-400" /> */}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-normal text-gray-700">refund_policy.pdf</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-2 px-1">
                <h3 className="text-lg font-sans font-normal mb-1">Add your own data</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Train your AI with your own data by uploading documents, website etc.
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
              <div className="bg-linear-to-br rounded-lg from-blue-200 via-blue-100 to-gray-200 relative min-h-fit flex items-center justify-center py-4">
                <div className="bg-white rounded-lg p-3 shadow-xs min-w-62.5">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <RiRobot2Line className="w-12 h-12 text-blue-400" />
                      {/* <Bot className="w-12 h-12 text-blue-400" /> */}
                    </div>
                    <div className="text-center w-full">
                      <div className="text-sm font-sans font-normal text-gray-700 mb-2">
                        Train your bot
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-2 px-1">
                <h3 className="text-lg font-sans font-normal  mb-1">Train your bot</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Train your AI model with the uploaded data accurate responses to questions
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
              <div className="bg-linear-to-br rounded-lg from-blue-200 via-blue-100 to-gray-200 relative py-4 px-4 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4.75 shadow-xs w-full max-w-65">
                  <div className="space-y-3">
                    <div className="flex justify-end items-center space-x-2">
                      <div className="bg-blue-500 text-white text-xs px-3 py-2 rounded-lg max-w-[80%]">
                        Hi! I want a refund
                      </div>
                    </div>

                    <div className="flex justify-start items-center space-x-2">
                      <div className="bg-blue-100 rounded-md px-2 py-1 flex items-center gap-1.5">
                        <div className="rounded-md bg-blue-100 p-1">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-xs text-blue-700">Refund started</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-2 px-1">
                <h3 className="text-lg font-sans font-normal mb-1">Start chatting</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Deploy your AI chatbot and handle your customer's queries on autopilot.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
