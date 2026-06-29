import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useOrganizationsQuery } from "@/hooks/use-auth-queries";
import LoadingDots from "../loading-dots";

export function DeleteWorkspace() {
  const queryClient = useQueryClient();
  const { data: organization } = authClient.useActiveOrganization();
  const { data: organizations = [], isPending: isOrganizationsPending } =
    useOrganizationsQuery();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organizationIndex = organizations.findIndex(
    (item) => item.id === organization?.id,
  );
  const nextOrganization =
    organizationIndex >= 0
      ? (organizations[organizationIndex + 1] ??
        organizations[organizationIndex - 1])
      : organizations.find((item) => item.id !== organization?.id);
  const canDelete = Boolean(
    organization && nextOrganization && organizations.length > 1,
  );

  const handleDeleteWorkspace = async () => {
    if (!organization || !nextOrganization) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await authClient.organization.delete({
        organizationId: organization.id,
      });

      if (deleteError) {
        throw new Error(deleteError.message ?? "Unable to delete site.");
      }

      const { error: switchError } = await authClient.organization.setActive({
        organizationId: nextOrganization.id,
      });

      if (switchError) {
        throw new Error(switchError.message ?? "Unable to switch sites.");
      }

      await queryClient.invalidateQueries();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete site.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-red-300 bg-card text-card-foreground">
        <div className="p-3 px-4 sm:px-6">
          <h3 className="text-xl font-semibold text-foreground">Delete site</h3>
          <div className="space-y-0 relative">
            <div className="flex flex-col gap-4 py-4">
              <div className="text-sm flex items-center gap-2 text-muted-foreground">
                <span>
                  Deleting your site is irreversible. This will permanently
                  delete all your data, including your agents, conversations,
                  and settings.
                </span>
              </div>
              {!isOrganizationsPending && !canDelete ? (
                <p className="text-sm text-muted-foreground">
                  You need at least one site, so this site cannot be deleted.
                </p>
              ) : null}
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="bg-red-50 border-t border-red-300 p-3 px-4 sm:px-6 rounded-b-2xl">
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-500 text-white hover:bg-red-600"
            size="sm"
            disabled={!canDelete || isOrganizationsPending || isDeleting}
          >
            Yes, delete
          </Button>
        </div>
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              site and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!canDelete || isDeleting}
              onClick={handleDeleteWorkspace}
            >
              <span className="inline-grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
                <span className={isDeleting ? "invisible" : ""}>Yes, delete</span>
                {isDeleting && <LoadingDots color="white" />}
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
