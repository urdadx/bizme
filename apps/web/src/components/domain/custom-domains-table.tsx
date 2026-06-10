import { Button } from "../ui/button";
import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "../ui/popover";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table";

export const CustomDomainsTable = () => {
	return (
		<div className="max-w-xs p-3 px-4 sm:px-6 md:max-w-full rounded-3xl border">
			<div className="flex items-center justify-between mb-4">
				<div className="flex flex-col gap-1">
					<h3 className="text-xl font-semibold text-foreground">
						Custom domains
					</h3>
					<p className="text-muted-foreground text-sm">
						Manage your custom domains and DNS settings.
					</p>
				</div>
				<Button size="sm">
					<PlusIcon className="size-4" />
					Add domain
				</Button>
			</div>
			<Table className=" ">
				<TableHeader className="w-full text-muted-foreground ">
					<TableRow className="hover:bg-transparent text-muted-foreground text-xs">
						<TableHead>Domain</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow className="w-full">
						<TableCell>
							<div className="flex items-center gap-3">
								<div>
									<div className="font-medium">example.com</div>
									<span className="mt-0.5 text-muted-foreground text-xs">
										Created on 12 Mar 2023
									</span>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<div className="flex h-2 w-2 items-center justify-center rounded-full bg-green-500" />
								Active
							</div>
						</TableCell>
						<TableCell>
							<Popover>
								<PopoverTrigger>
									<Button variant="outline" size="sm">
										<MoreHorizontal className="size-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-40 p-1">
									<div className="flex flex-col gap-1">
										<Button
											variant="ghost"
											size="sm"
											className="justify-start h-8 px-2 text-red-600 hover:text-red-600 hover:bg-red-50">
											<TrashBinLinear
												className="mr-2 h-3.5 w-3.5"
												color="currentColor"
											/>
											Remove
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
};
