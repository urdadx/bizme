import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarImage } from "../ui/avatar";
import { UploadLinear } from "@/assets/icons/upload-icon";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import LoadingDots from "../loading-dots";
import { Skeleton } from "../ui/skeleton";

export function WorkspaceOverview() {
  return <AccountForm />;
}

function AccountForm() {
  const { data: organization, isPending } = authClient.useActiveOrganization();
  const [name, setName] = useState("");
  const [siteURL, setSiteURL] = useState("");
  const [updatedImage, setUpdatedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setSiteURL(organization.websiteUrl ?? "");
      setUpdatedImage(organization.logo ?? null);
    }
  }, [organization]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUpdatedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!organization) {
      return;
    }

    setIsSaving(true);

    try {
      await authClient.organization.update({
        organizationId: organization.id,
        data: {
          name,
          logo: updatedImage ?? undefined,
          websiteUrl: normalizeWebsiteUrl(siteURL),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="rounded-2xl border bg-card text-card-foreground">
      <div className="p-3 px-4 sm:px-6">
        {/* <div className="flex items-center justify-between">
					<h3 className="text-xl font-semibold text-foreground">Overview</h3>
				</div> */}
        <div className="space-y-0 relative">
          <div className="flex flex-col gap-2 py-2">
            <Label className="text-sm text-muted-foreground">Favicon</Label>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border">
                <AvatarImage
                  className="rounded-2xl object-cover"
                  src={
                    updatedImage ||
                    `https://api.dicebear.com/9.x/glass/svg?seed=${organization.name}`
                  }
                />
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button
                className="font-normal text-gray-800"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadLinear className="mr-1 h-4 w-4" />
                Change avatar
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col w-full gap-2 py-2">
              <Label className="text-sm text-muted-foreground">Site name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-full bg-white outline-2"
              />
            </div>
            <div className="flex flex-col w-full gap-2 py-2">
              <Label className="text-sm text-muted-foreground">Site URL</Label>
              <Input
                type="text"
                value={siteURL}
                onChange={(e) => setSiteURL(e.target.value)}
                className="h-8 w-full bg-white outline-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-gray-50 p-3 px-4 sm:px-6 rounded-b-2xl">
        <Button size="sm" className="min-w-24" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <LoadingDots color="currentColor" /> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function normalizeWebsiteUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl || /^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}
