import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { BellLinear } from "@/assets/icons/notification-icon";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/utils/trpc";
import { SidebarTrigger } from "./ui/sidebar";
import { DeployAgentDialog } from "./deploy/deploy-agent-dialog";

function formatNotificationDate(value: Date | string | number | null | undefined) {
	if (!value) return "Just now";

	const date = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(date.getTime())) return "Just now";

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

function getNotificationCommentId(href: string) {
	return href.split("/").filter(Boolean).at(-1) ?? "";
}

export const Navbar = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const notificationsQuery = useQuery(trpc.notifications.list.queryOptions());
	const unreadCountQuery = useQuery(trpc.notifications.unreadCount.queryOptions());
	const unreadCount = unreadCountQuery.data ?? 0;

	const invalidateNotifications = () => {
		void queryClient.invalidateQueries({
			queryKey: trpc.notifications.list.queryOptions().queryKey,
		});
		void queryClient.invalidateQueries({
			queryKey: trpc.notifications.unreadCount.queryOptions().queryKey,
		});
	};

	const markRead = useMutation({
		...trpc.notifications.markRead.mutationOptions(),
		onSuccess: invalidateNotifications,
	});
	const markAllRead = useMutation({
		...trpc.notifications.markAllRead.mutationOptions(),
		onSuccess: invalidateNotifications,
	});

	return (
		<header className="px-5 sticky top-0 flex justify-between h-14 shrink-0 items-center bg-background/50 backdrop-blur-lg border-b transition-[width,height] ease-linear z-10 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center">
				<SidebarTrigger className="w-7 h-7 text-muted-foreground" />
			</div>
			<div className="flex gap-1 sm:gap-2 items-center ml-auto">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button className="relative" variant="outline" aria-label="Notifications" />
						}>
						<BellLinear className="size-4" color="currentColor" />
						{unreadCount > 0 ? (
							<span className="absolute -right-2 -top-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						) : null}
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-80 min-w-80 p-0">
						<div className="flex items-center justify-between border-b px-3 py-2">
							<span className="text-sm font-medium text-foreground">
								Notifications
							</span>
							{unreadCount > 0 ? (
								<button
									type="button"
									className="text-xs font-medium text-primary hover:underline"
									onClick={() => markAllRead.mutate()}>
									Mark all read
								</button>
							) : null}
						</div>
						<div className="max-h-96 overflow-y-auto p-1">
							{notificationsQuery.isPending ? (
								<p className="px-3 py-6 text-center text-sm text-muted-foreground">
									Loading notifications...
								</p>
							) : notificationsQuery.data?.length ? (
								notificationsQuery.data.map((notification) => (
									<DropdownMenuItem
										key={notification.id}
										className="items-start gap-3 p-3"
										onClick={() => markRead.mutate({ id: notification.id })}
										render={
											<Link
												to="/comments/$commentId"
												params={{
													commentId: getNotificationCommentId(notification.href),
												}}
											/>
										}>
										<span className="mt-1 flex size-2 shrink-0 rounded-full bg-primary opacity-0 data-[unread=true]:opacity-100" data-unread={!notification.readAt} />
										<span className="min-w-0 flex-1">
											<span className="block text-sm font-medium">
												{notification.title}
											</span>
											<span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
												{notification.actorName ? `${notification.actorName}: ` : ""}
												{notification.message}
											</span>
											<span className="mt-1 block text-[11px] text-muted-foreground">
												{formatNotificationDate(notification.createdAt)}
											</span>
										</span>
									</DropdownMenuItem>
								))
							) : (
								<p className="px-3 py-6 text-center text-sm text-muted-foreground">
									No notifications yet.
								</p>
							)}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
				<DeployAgentDialog />
			</div>
		</header>
	);
};
