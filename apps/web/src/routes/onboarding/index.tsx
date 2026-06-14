import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/onboarding/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex min-h-svh h-full w-full items-center justify-center bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[28px_28px] p-6">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle className="font-semibold font-display text-2xl">
						Set up your workspace
					</CardTitle>
					<CardDescription>
						Let's start by setting up your workspace
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<FieldGroup className="gap-3">
							<Field>
								<FieldLabel htmlFor="workspace-name">
									Workspace name
								</FieldLabel>
								<Input
									id="workspace-name"
									name="workspaceName"
									placeholder="Acme Inc."
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="website-url">
									Website URL
								</FieldLabel>
								<Input
									id="website-url"
									name="websiteUrl"
									type="url"
									placeholder="https://example.com"
									required
								/>
							</Field>
							<Field>
								<Button type="submit">Continue</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
