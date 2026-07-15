import type { ReactElement } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import LoadingDots from "../loading-dots";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type InviteRole = "member" | "admin";

type InviteTeamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactElement;
};

export function InviteTeamDialog({ open, onOpenChange, trigger }: InviteTeamDialogProps) {
  const { data: organization } = authClient.useActiveOrganization();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organization || !email.trim()) {
      return;
    }

    setIsInviting(true);

    try {
      const { error } = await authClient.organization.inviteMember({
        email: email.trim(),
        organizationId: organization.id,
        resend: true,
        role,
      });

      if (error) {
        toast.error(error.message ?? "Unable to send invitation");
        return;
      }

      toast.success("Invitation sent");
      setEmail("");
      setRole("member");
      onOpenChange(false);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent>
        <form className="space-y-5" onSubmit={handleInviteMember}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Invite a team member</DialogTitle>
            <DialogDescription>
              {organization
                ? `Send an email invitation to join ${organization.name}.`
                : "Send an email invitation to join your workspace."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as InviteRole)}
                className="grid gap-4 pt-1 sm:grid-row-2"
              >
                <Label className="flex cursor-pointer items-start gap-3">
                  <RadioGroupItem value="member" />
                  <span>
                    <span className="block font-medium">Member</span>
                    <span className="text-xs text-muted-foreground">
                      Can view and manage comments.
                    </span>
                  </span>
                </Label>
                <Label className="flex cursor-pointer items-start gap-3">
                  <RadioGroupItem value="admin" />
                  <span>
                    <span className="block font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Can manage workspace settings.
                    </span>
                  </span>
                </Label>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isInviting || !organization} className="min-w-32">
              {isInviting ? <LoadingDots /> : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
