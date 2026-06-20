import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleSVG } from "@/assets/icons/google-svg";
import { authClient } from "@/lib/auth-client";
import LoadingDots from "./loading-dots";
import { env } from "@better-comments/env/web";

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

export function SignupForm({ className, onSubmit, ...props }: React.ComponentProps<"form">) {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const [isGooglePending, setIsGooglePending] = useState(false);

	async function handleSubmit(event: FormSubmitEvent) {
		onSubmit?.(event);

		if (event.defaultPrevented) {
			return;
		}

		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name") ?? "");
		const email = String(formData.get("email") ?? "");
		const password = String(formData.get("password") ?? "");

		setError(null);
		setIsPending(true);

		try {
			const { error } = await authClient.signUp.email({
				name,
				email,
				password,
			});

			if (error) {
				setError(
					error.message ?? "Unable to create your account. Please try again.",
				);
				return;
			}

			await navigate({ to: "/onboarding" });
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Unable to create your account. Please try again.",
			);
		} finally {
			setIsPending(false);
		}
	}

	async function handleGoogleSignUp() {
		setError(null);
		setIsGooglePending(true);

		try {
			const { error } = await authClient.signIn.social({
				provider: "google",
				callbackURL: `${env.VITE_FRONTEND_ORIGIN}/overview`,
			});

			if (error) {
				setError(
					error.message ?? "Unable to continue with Google. Please try again.",
				);
			}
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Unable to continue with Google. Please try again.",
			);
		} finally {
			setIsGooglePending(false);
		}
	}

	return (
		<form
			className={cn("flex flex-col gap-4", className)}
			onSubmit={handleSubmit}
			{...props}>
			<FieldGroup className="gap-4">
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-3xl font-semibold">Create your account</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Fill in the form below to create your account
					</p>
				</div>
				<Field>
					<FieldLabel htmlFor="name">Username</FieldLabel>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Jack Maaye"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="malika@bizme.com"
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
					<Button type="submit" disabled={isPending || isGooglePending}>
						{isPending ? (
							<LoadingDots color="currentColor" />
						) : (
							"Create my account"
						)}
					</Button>
				</Field>
				<FieldSeparator>Or continue with</FieldSeparator>
				<Field>
					<Button
						variant="outline"
						type="button"
						disabled={isPending || isGooglePending}
						onClick={handleGoogleSignUp}>
						{isGooglePending ? (
							<LoadingDots color="currentColor" />
						) : (
							<GoogleSVG />
						)}
						Sign up with Google
					</Button>
					<FieldDescription className="px-6 text-center">
						Already have an account? <Link to="/login">Sign in</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
