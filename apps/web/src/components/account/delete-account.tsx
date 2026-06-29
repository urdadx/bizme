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
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

export function DeleteAccount() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const { error } = await authClient.deleteUser({});

      if (!error) {
        await navigate({ to: "/login" });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-red-300 bg-card text-card-foreground">
        <div className="p-3 px-4 sm:px-6">
          <h3 className="text-xl font-semibold text-foreground">Delete Account</h3>
          <div className="space-y-0 relative">
            <div className="flex flex-col gap-4 py-4">
              <div className="text-sm flex items-center gap-2 text-muted-foreground">
                <span>
                  Deleting your account is irreversible. This will permanently delete all your data,
                  including your agents, conversations, and settings.
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border-t border-red-300 p-3 px-4 sm:px-6 rounded-b-2xl">
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-500 text-white hover:bg-red-600"
            size="sm"
          >
            Yes, delete
          </Button>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all
              associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
            >
              <span className="inline-grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
                <span className={isDeleting ? "invisible" : ""}>Yes, delete</span>
                {isDeleting && "Deleting..."}
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
