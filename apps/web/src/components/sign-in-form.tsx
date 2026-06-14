import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "./ui/field";
import { GoogleSVG } from "@/assets/icons/google-svg";

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

export default function LoginForm({ className, onSubmit, ...props }: React.ComponentProps<"form">) {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: FormSubmitEvent) {
		onSubmit?.(event);

		if (event.defaultPrevented) {
			return;
		}

		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "");
		const password = String(formData.get("password") ?? "");

		setError(null);
		setIsPending(true);

		try {
			const { error } = await authClient.signIn.email({
				email,
				password,
			});

			if (error) {
				setError(error.message ?? "Unable to sign in. Please try again.");
				return;
			}

			await navigate({ to: "/overview" });
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Unable to sign in. Please try again.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<form
			className={cn("flex flex-col gap-4", className)}
			onSubmit={handleSubmit}
			{...props}>
			<FieldGroup className="gap-4">
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-3xl font-semibold">Sign in to your account</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Fill in the form below to sign in to your account
					</p>
				</div>

				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="yaak@bizme.com"
						aria-invalid={Boolean(error)}
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<Input
						placeholder="********"
						id="password"
						name="password"
						type="password"
						aria-invalid={Boolean(error)}
						required
					/>
				</Field>
				<FieldError>{error}</FieldError>

				<Field>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Signing in..." : "Sign in"}
					</Button>
				</Field>
				<FieldSeparator>Or continue with</FieldSeparator>
				<Field>
					<Button variant="outline" type="button" disabled>
						<GoogleSVG />
						Sign in with Google
					</Button>
					<FieldDescription className="px-6 text-center">
						Don't have an account?{" "}
						<Link to="/register">Create an account</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
