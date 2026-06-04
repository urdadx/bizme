import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

export function UserBillingEmail() {
  const [email, setEmail] = useState("");

  return (
    <div className="rounded-2xl border bg-card text-card-foreground">
      <div className="p-3 px-4 sm:px-6">
        <h3 className="text-xl font-semibold text-foreground">Billing email</h3>
        <div className="space-y-0 relative">
          <div className="flex flex-col gap-4 pt-1">
            <div className="text-sm flex items-center gap-2 text-muted-foreground">
              <span>Email address where you receive billing notifications.</span>
            </div>
            <Input
              type="email"
              className="h-8 w-full bg-gray-200 outline-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="billing@example.com"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-gray-50 p-3 px-4 sm:px-6 rounded-b-2xl">
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}
