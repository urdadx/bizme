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
			question: "How do I add Bizme comments to my website?",
			answer: "Create a site in the Bizme dashboard, copy your Site ID, and install the script tag or framework integration on your website.",
		},
		{
			id: "item-2",
			question: "Can I moderate comments before they appear?",
			answer: "Yes. You can review, approve, hide, and manage conversations from the Bizme dashboard so your comment section stays on topic.",
		},
		{
			id: "item-3",
			question: "Will Bizme work with my existing website or framework?",
			answer: "Yes. Bizme can be added with a single script tag, and official integrations are available for supported frameworks.",
		},
		{
			id: "item-4",
			question: "Can I customize how the comment section looks?",
			answer: "Yes. You can adjust the comment section to match your site's design and branding from the dashboard.",
		},
		{
			id: "item-5",
			question: "Is Bizme free to use?",
			answer: "Yes. Bizme is free and open source. You can use the hosted version or self-host it on your own infrastructure.",
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
						Find quick answers about installing, customizing, and moderating
						comments with Bizme.
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
