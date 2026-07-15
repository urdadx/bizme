import { createFileRoute } from "@tanstack/react-router";
import RegisterBackgroundImage from "@/assets/images/register-image.png";
import { SignupForm } from "@/components/sign-up-form";
import { z } from "zod";

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

function getSafeRedirect(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/onboarding";
}

export const Route = createFileRoute("/register")({
  component: RouteComponent,
  validateSearch: registerSearchSchema,
});

function RouteComponent() {
  const { email, redirect } = Route.useSearch();

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <SignupForm initialEmail={email} redirectTo={getSafeRedirect(redirect)} />
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
