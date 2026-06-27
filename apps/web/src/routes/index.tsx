import { createFileRoute } from "@tanstack/react-router";

import { HeroHeader } from "@/components/landing-page/hero-header";
import { CTASession } from "@/components/landing-page/cta-section";
import HeroVideoDialog from "@/components/landing-page/hero-video-dialog";
import Features from "@/components/landing-page/features-section";
import { Setup } from "@/components/landing-page/landing-setup";
import { FooterSection } from "@/components/landing-page/footer";
import FAQs from "@/components/landing-page/faqs";

export const Route = createFileRoute("/")({
	pendingComponent: () => null,
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<main className="min-h-screen w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[42px_42px] p-6">
			<HeroHeader />
			<div className="relative z-10 space-y-12">
				<CTASession />
				<div className="max-w-6xl px-3 sm:px-0 mx-auto relative flex justify-center items-center sm:flex-col sm:items-center">
					<HeroVideoDialog
						className="block"
						videoSrc="https://www.youtube.com/embed/WZ7hLRLdTIw?si=q7T9MsErVoRWKTgj"
						thumbnailAlt="Hero Video"
					/>
				</div>
				<Features />
				<Setup />

				<FAQs />
				<FooterSection />
			</div>
		</main>
	);
}
