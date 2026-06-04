import { Button } from "@/components/ui/button";
import { CuteIconWrapper } from "../cute-icon-wrapper";
import { WalletLinear } from "@/assets/icons/wallet";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { planNameMap } from "@/lib/plan-slugs";

const PAGE_SIZE = 5;
const SUBSCRIPTION_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
	year: "numeric",
});
const USD_FORMATTER = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export function UserSubscriptions() {
	const isMobile = useIsMobile();
	const [page, setPage] = useState(0);
	const subscriptions: Array<{
		id: string;
		productId?: string | null;
		metadata?: Record<string, unknown> | null;
		status: string;
		currentPeriodEnd?: Date | string | null;
		1;
		amount: number;
	}> = [];

	const totalPages = Math.ceil(subscriptions.length / PAGE_SIZE);
	const paginatedSubscriptions = subscriptions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

	const formatDate = (date: Date | string | null | undefined) => {
		if (!date) return "N/A";
		return SUBSCRIPTION_DATE_FORMATTER.format(new Date(date));
	};

	const formatCurrency = (amount: number) => {
		return USD_FORMATTER.format(amount);
	};

	return (
		<div className="rounded-2xl border bg-card text-card-foreground">
			<div className="p-3 px-4 sm:px-6">
				<h3 className="text-xl font-semibold text-foreground">Subscriptions</h3>
				{subscriptions.length === 0 ? (
					<p className="text-sm text-muted-foreground mt-2">
						No subscriptions yet.
					</p>
				) : (
					<div className="space-y-0 relative">
						{paginatedSubscriptions.map((sub, index) => (
							<div
								key={sub.id}
								className={cn(
									"flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-3 sm:py-3",
									index !== paginatedSubscriptions.length - 1 &&
										"border-b border-border/50",
								)}>
								<div className="flex items-center justify-between w-full sm:contents text-sm text-muted-foreground">
									<div className="flex items-center gap-2 max-w-50 truncate">
										<CuteIconWrapper
											color="green"
											icon={WalletLinear}
										/>
										<span className="font-medium text-foreground sm:text-muted-foreground sm:font-normal">
											{planNameMap[
												sub.productId ?? ""
											] ??
												((
													sub.metadata as Record<
														string,
														unknown
													>
												)?.planName as string) ??
												"Plan"}
										</span>
									</div>

									{isMobile && (
										<div className="flex justify-center items-center gap-2 capitalize">
											<div
												className={cn(
													"rounded-full w-2 h-2 shrink-0",
													sub.status ===
														"active"
														? "bg-green-500"
														: sub.status ===
															  "trialing"
															? "bg-blue-800"
															: sub.status ===
																  "canceled"
																? "bg-red-800"
																: "bg-green-800",
												)}
											/>
											<span className="text-xs text-center">
												{sub.status}
											</span>
										</div>
									)}
								</div>

								{!isMobile && (
									<>
										<div className="flex-1" />
										<div className="flex items-center gap-2 text-sm capitalize text-muted-foreground w-28 justify-center">
											<div
												className={cn(
													"rounded-full w-2 h-2 shrink-0",
													sub.status ===
														"active"
														? "bg-green-500"
														: sub.status ===
															  "trialing"
															? "bg-blue-800"
															: sub.status ===
																  "canceled"
																? "bg-red-800"
																: "bg-green-800",
												)}
											/>
											<span className="w-16">
												{sub.status}
											</span>
										</div>
										<div className="flex-1" />
									</>
								)}

								<div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-10 w-full sm:w-auto">
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-10">
										<div className="text-xs sm:text-sm text-muted-foreground sm:text-foreground sm:w-32">
											{isMobile ? "Renews " : "Ends "}
											{formatDate(sub.currentPeriodEnd)}
										</div>
										<div className="text-sm font-semibold sm:font-normal text-foreground sm:w-16">
											{formatCurrency(sub.amount / 100)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			<div className="border-t border-border bg-gray-50 p-3 px-4 sm:px-6 rounded-b-2xl flex items-center justify-between">
				<Link to="/onboarding/pricing">
					<Button size="sm">View other plans</Button>
				</Link>
				{totalPages > 1 && (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setPage((p) => p - 1)}
							disabled={page === 0}>
							Previous
						</Button>
						<span className="text-sm text-muted-foreground">
							{page + 1} / {totalPages}
						</span>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= totalPages - 1}>
							Next
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
