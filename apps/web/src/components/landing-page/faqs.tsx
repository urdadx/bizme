import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQs() {
	const faqItems = [
		{
			id: "item-1",
			question: "How does the AI customer support bot work?",
			answer: "The bot is trained on your knowledge base (files, youtube videos etc) and support documentation, allowing it to instantly answer customer questions 24/7 across all supported channels.",
		},
		{
			id: "item-2",
			question: "What integrations does the platform support?",
			answer: "We integrate with major communication channels including WhatsApp, Calendly, Cal.com and Slack. More integrations coming soon.",
		},
		{
			id: "item-3",
			question: "Can I customize the responses of the AI?",
			answer: "Yes. You can customize your bot's personality, language and tone in the dashboard's playground.",
		},
		{
			id: "item-4",
			question: "Do I need any technical experience to set up the bot?",
			answer: "No. You can easily set up and deploy the bot easily in just a few minutes",
		},
		{
			id: "item-5",
			question: "Do I need to pay for the service?",
			answer: "No - the service is completely free to use and opensource. You can also self-host on your own server if you prefer.",
		},
	];

	return (
		<section id="faqs" className="py-10 md:pt-14 md:pb-2">
			<div className="mx-auto max-w-5xl px-4 md:px-6">
				<div className="mx-auto max-w-xl text-center">
					<h2 className="text-balance instrument-serif-regular text-3xl font-bold md:text-3xl lg:text-4xl">
						Frequently Asked{" "}
						<span className="text-primary bg-primary/10 px-1 rounded relative inline-block z-1">
							Questions
						</span>{" "}
					</h2>
					<p className="text-muted-foreground text-lg mt-4 text-balance">
						Discover quick and comprehensive answers to common questions
						about our platform, services, and features.
					</p>
				</div>

				<div className="mx-auto mt-12 max-w-xl">
					<Accordion className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-8 dark:ring-0">
						{faqItems.map((item) => (
							<AccordionItem
								key={item.id}
								value={item.id}
								className="border-dashed">
								<AccordionTrigger className="cursor-pointer font-sans text-base hover:no-underline">
									{item.question}
								</AccordionTrigger>
								<AccordionContent>
									<p className="text-base">{item.answer}</p>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
