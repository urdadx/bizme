import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import BarList from "./bar-list";

interface ViewAllStatsProps {
	dialogOpen: boolean;
	setDialogOpen: (open: boolean) => void;
	allLinks: any[];
	maxTotalCount: number;
	name: string;
	bgColor?: string;
}

export function ViewAllStats({
	dialogOpen,
	name,
	setDialogOpen,
	allLinks,
	maxTotalCount,
	bgColor = "bg-blue",
}: ViewAllStatsProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredLinks = useMemo(() => {
		if (!searchQuery.trim()) return allLinks;

		return allLinks.filter((link) =>
			link.title.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery, allLinks]);

	const handleDialogChange = (open: boolean) => {
		if (open) {
			setSearchQuery("");
		}
		setDialogOpen(open);
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
			<DialogContent className="w-[95%] max-w-lg! smooth-div max-h-[80vh] ">
				<DialogHeader className="">
					<DialogTitle className="text-xl font-semibold capitalize">
						All {name}
					</DialogTitle>

					<div className="space-y-2">
						<div className="relative">
							<Input
								className="peer pe-9 ps-9 bg-background w-full "
								placeholder={`Search ${name}...`}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
								<Search size={16} strokeWidth={2} />
							</div>
						</div>
					</div>
				</DialogHeader>

				{filteredLinks.length > 0 ? (
					<BarList
						tab="Websites"
						unit="visits"
						data={filteredLinks}
						barBackground={`${bgColor}-200`}
						hoverBackground={`hover:${bgColor}-50`}
						maxValue={maxTotalCount}
						minBarWidth={5}
					/>
				) : (
					<div className="flex h-40 items-center justify-center text-base text-gray-500">
						No {name} match your search
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
