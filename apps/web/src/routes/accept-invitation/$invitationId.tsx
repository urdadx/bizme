import LoadingDots from "@/components/loading-dots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { invitationId } = Route.useParams();
  const { data: session, isPending } = authClient.useSession();
  const {
    data: invitation,
    error: invitationError,
    isPending: isInvitationPending,
  } = useQuery(trpc.invitations.getContext.queryOptions({ invitationId }));
  const [isAccepting, setIsAccepting] = useState(false);
  const redirect = `/accept-invitation/${invitationId}`;
  const authSearch = {
    redirect,
    email: invitation?.email,
  };
  const isWrongAccount = Boolean(
    session && invitation && session.user.email.toLowerCase() !== invitation.email.toLowerCase(),
  );

  const handleAcceptInvitation = async () => {
    setIsAccepting(true);

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        toast.error(error.message ?? "Unable to accept invitation");
        return;
      }

      toast.success("Invitation accepted");
      window.location.assign("/overview");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSignInWithInvitedEmail = async () => {
    await authClient.signOut();
    await navigate({
      to: "/login",
      search: {
        redirect,
        email: invitation?.email,
      },
    });
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace invitation</CardTitle>
          <CardDescription>
            {invitation
              ? `Accept this invitation to join ${invitation.organizationName} on Bizme.`
              : "Accept this invitation to join the workspace on Bizme."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending || isInvitationPending ? (
            <p className="text-sm text-muted-foreground">Checking your invitation...</p>
          ) : invitationError ? (
            <p className="text-sm text-destructive">{invitationError.message}</p>
          ) : !invitation ? (
            <p className="text-sm text-destructive">Invitation not found.</p>
          ) : invitation.status !== "pending" ? (
            <p className="text-sm text-muted-foreground">This invitation is {invitation.status}.</p>
          ) : isWrongAccount ? (
            <>
              <p className="text-sm text-muted-foreground">
                This invitation was sent to {invitation.email}. You are signed in as{" "}
                {session?.user.email}.
              </p>
              <Button className="w-full" onClick={handleSignInWithInvitedEmail}>
                Sign in with invited email
              </Button>
            </>
          ) : session ? (
            <>
              <p className="text-sm text-muted-foreground">
                You are signed in as {session.user.email}. Continue to accept the invitation.
              </p>
              <Button
                className="w-full min-w-36"
                onClick={handleAcceptInvitation}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <LoadingDots color="#fffff" />
                  </>
                ) : (
                  "Accept invitation"
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {invitation.hasAccount
                  ? `Sign in as ${invitation.email} to accept this invitation.`
                  : `Create an account with ${invitation.email} to accept this invitation.`}
              </p>
              {invitation.hasAccount ? (
                <Button className="w-full" render={<Link to="/login" search={authSearch} />}>
                  Sign in
                </Button>
              ) : (
                <Button className="w-full" render={<Link to="/register" search={authSearch} />}>
                  Create account
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
