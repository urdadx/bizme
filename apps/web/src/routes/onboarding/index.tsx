import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import LoadingDots from "@/components/loading-dots";
import { getWebsiteFaviconUrl, normalizeWebsiteUrl } from "@/lib/utils";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/onboarding/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const createSite = useMutation(trpc.sites.create.mutationOptions());
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("workspaceName") ?? "").trim();
		const websiteUrl = normalizeWebsiteUrl(String(formData.get("websiteUrl") ?? ""));
		const logo = getWebsiteFaviconUrl(websiteUrl);

		setError(null);
		setIsPending(true);

		try {
			await createSite.mutateAsync({
				name,
				logo: logo || undefined,
				websiteUrl,
			});

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
				queryClient.invalidateQueries({ queryKey: ["auth", "organizations"] }),
				queryClient.invalidateQueries({
					queryKey: trpc.getSession.queryOptions().queryKey,
				}),
			]);

			await navigate({ to: "/overview" });
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Unable to create your workspace. Please try again.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<main className="flex min-h-svh h-full w-full items-center justify-center bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[28px_28px] p-6">
			<Card className="w-full max-w-lg rounded-2xl">
				<CardHeader>
					<CardTitle className="font-semibold font-display text-2xl">
						Set up your workspace
					</CardTitle>
					<CardDescription>
						Let's start by setting up your workspace
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup className="gap-3">
							<Field>
								<FieldLabel htmlFor="workspace-name">
									Site name
								</FieldLabel>
								<Input
									id="workspace-name"
									name="workspaceName"
									placeholder="Acme Inc."
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="site-url">Site URL</FieldLabel>
								<Input
									id="site-url"
									name="websiteUrl"
									type="text"
									placeholder="https://example.com"
									required
								/>
							</Field>
							<FieldError>{error}</FieldError>
							<Field>
								<Button type="submit" disabled={isPending}>
									{isPending ? (
										<LoadingDots color="currentColor" />
									) : (
										"Continue"
									)}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
