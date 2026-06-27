import { AnalyticsCard } from "./analytics-card";
import { FeatureCard } from "./feature-card";
import { LandingShare } from "./landing-share";
import { LandingThemes } from "./landing-themes";
import { SampleChat } from "./sample-chat";

export default function Features() {
  return (
    <section id="features" className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-6">
          <h2 className="instrument-serif-regular italic text-3xl lg:text-4xl">
            <span className="text-primary  bg-primary/10 px-1 rounded relative inline-block z-1">
              Powerful{" "}
            </span>{" "}
            features for your content
          </h2>
          <p className="text-pretty text-lg text-neutral-500">
            Enhance your content with our comprehensive features, designed to
            provide a seamless and engaging experience for your audience.
          </p>
        </div>
        <div className="mx-auto mt-14 grid w-full max-w-5xl grid-cols-1 px-4 sm:grid-cols-2">
          <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x">
            <FeatureCard
              title="Live comments from your audience"
              description="Receive real-time comments from your audience and with engage them"
            >
              <SampleChat />
            </FeatureCard>

            <FeatureCard
              title="Analytics and insights"
              description="Gain valuable insights into customer interactions and bot performance with our analytics tools."
            >
              <AnalyticsCard />
            </FeatureCard>
          </div>

          <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x *:border-t *:border-neutral-200">
            <FeatureCard
              title="Highly customizable"
              description="Customize with colors that match your brand's identity."
            >
              <LandingThemes />
            </FeatureCard>
            <FeatureCard
              title="Embed everywhere"
              description="Share via an embed widget on any website"
            >
              <LandingShare />
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
}
