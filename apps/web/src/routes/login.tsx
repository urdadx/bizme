import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginBackgroundImage from "@/assets/images/login-image.png";
import LoginForm from "@/components/sign-in-form";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

function getSafeRedirect(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/overview";
}

export const Route = createFileRoute("/login")({
  ssr: false,
  component: RouteComponent,
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient
      .fetchQuery(context.trpc.getSession.queryOptions())
      .catch(() => null);

    if (session) {
      throw redirect({ to: getSafeRedirect(search.redirect) });
    }
  },
});

function RouteComponent() {
  const { email, redirect } = Route.useSearch();

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <LoginForm initialEmail={email} redirectTo={getSafeRedirect(redirect)} />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src={LoginBackgroundImage}
            alt="Image"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </>
  );
}
