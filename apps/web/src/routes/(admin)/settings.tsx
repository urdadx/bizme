import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { AccountOverview } from "@/components/account/account-overview";
import { DeleteAccount } from "@/components/account/delete-account";
import { UserBillingEmail } from "@/components/billing/user-billing-email";
import { UserInvoices } from "@/components/billing/user-invoices";
import { UserSubscriptions } from "@/components/billing/user-subscription";

const settingsSchema = z.object({
	tab: z
		.enum(["account", "moderation", "billing", "team", "agent"])
		.optional()
		.default("account"),
});

export const Route = createFileRoute("/(admin)/settings")({
	component: RouteComponent,
	validateSearch: settingsSchema,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { tab } = Route.useSearch();

	const handleTabChange = (value: string) => {
		navigate({
			search: {
				tab: value as "account" | "billing" | "team" | "agent",
			},
		});
	};

	return (
		<div className="relative p-4 w-full space-y-6 overflow-x-hidden">
			<div className="min-h-0 flex-1 overflow-visible bg-background px-3 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<h1 className="text-2xl font-semibold">Settings</h1>

					<Tabs
						value={tab}
						onValueChange={handleTabChange}
						className="pt-3"
						defaultValue="account">
						<div className=" pb-1">
							<TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none  bg-transparent px-0 ">
								<TabsTrigger
									className="shrink-0 data-[state=active]:bg-muted data-[state=active]:shadow-none"
									value="account">
									Account
								</TabsTrigger>
								<TabsTrigger
									className="shrink-0 data-[state=active]:bg-muted data-[state=active]:shadow-none"
									value="moderation">
									Moderation
								</TabsTrigger>
								<TabsTrigger
									className="shrink-0 data-[state=active]:bg-muted data-[state=active]:shadow-none"
									value="billing">
									Billing
								</TabsTrigger>

								<TabsTrigger
									className="shrink-0 data-[state=active]:bg-muted data-[state=active]:shadow-none"
									value="team">
									Team
								</TabsTrigger>
							</TabsList>
						</div>
						<TabsContent className="py-4 space-y-8" value="account">
							<AccountOverview />
							<DeleteAccount />
						</TabsContent>
						<TabsContent
							className="py-4 space-y-8"
							value="moderation"></TabsContent>
						<TabsContent className="py-4 space-y-6" value="billing">
							<UserSubscriptions />
							<UserBillingEmail />
							<UserInvoices />
						</TabsContent>
						<TabsContent
							className="py-4 space-y-6"
							value="team"></TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
