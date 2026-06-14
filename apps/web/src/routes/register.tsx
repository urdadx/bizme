import { createFileRoute } from "@tanstack/react-router";
import RegisterBackgroundImage from "@/assets/images/register-image.png";
import { SignupForm } from "@/components/sign-up-form";

export const Route = createFileRoute("/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div className="grid min-h-svh lg:grid-cols-2">
				<div className="flex flex-col gap-4 p-6 md:p-10">
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full max-w-sm">
							<SignupForm />
						</div>
					</div>
				</div>
				<div className="relative hidden bg-muted lg:block">
					<img
						src={RegisterBackgroundImage}
						alt="Image"
						loading="lazy"
						className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
					/>
				</div>
			</div>
		</>
	);
}
