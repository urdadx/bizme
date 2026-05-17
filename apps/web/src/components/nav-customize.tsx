import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";

export function NavCustomize({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: any;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});
	const { isMobile, setOpenMobile } = useSidebar();

	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const activeItemClassName = "bg-primary/10 text-primary text-sm";
	const iconClassName = "size-4! text-current";

	return (
		<SidebarGroup className="py-0 my-0 ">
			<SidebarGroupLabel className="text-muted-foreground group-data-[collapsible=icon]:hidden">
				APPEARANCE
			</SidebarGroupLabel>
			<SidebarMenu className="gap-2">
				{items.map((item) => {
					const isMainItemActive = pathname === item.url;

					return (
						<div key={item.title}>
							<SidebarMenuItem>
								<Link
									to={item.url}
									className="w-full"
									onClick={handleLinkClick}>
									<SidebarMenuButton
										tooltip={item.title}
										className={
											isMainItemActive
												? activeItemClassName
												: ""
										}>
										{item.icon && (
											<item.icon
												color="currentColor"
												className={iconClassName}
											/>
										)}
										<span
											className={
												isMainItemActive
													? "text-primary text-sm font-medium"
													: "text-sm"
											}>
											{item.title}
										</span>
									</SidebarMenuButton>
								</Link>
								<div className="">
									{item.items?.map((subItem) => {
										const isSubItemActive =
											pathname === subItem.url;

										return (
											<SidebarMenuButton
												key={subItem.title}
												className={
													isSubItemActive
														? activeItemClassName
														: ""
												}>
												<Link
													to={subItem.url}
													className="w-full"
													onClick={
														handleLinkClick
													}>
													<span
														className={
															isSubItemActive
																? "text-primary font-medium"
																: ""
														}>
														{subItem.title}
													</span>
												</Link>
											</SidebarMenuButton>
										);
									})}
								</div>
							</SidebarMenuItem>
						</div>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
