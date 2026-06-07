import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

export function NewDomain() {
	const [domain, setDomain] = useState("");

	return (
		<div className="rounded-2xl border bg-card text-card-foreground">
			<div className="p-3 px-4 sm:px-6">
				<h3 className="text-xl font-semibold text-foreground">Custom domain</h3>
				<div className="space-y-0 relative">
					<div className="flex flex-col gap-4 pt-1">
						<div className="text-sm flex items-center gap-2 text-muted-foreground">
							<span>
								Configure your custom domain and DNS settings.
							</span>
						</div>
						<Input
							type="text"
							className="h-8 w-full bg-gray-200 outline-2"
							value={domain}
							onChange={(e) => setDomain(e.target.value)}
							placeholder="bizme.example.com"
						/>
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-gray-50 p-3 px-4 sm:px-6 rounded-b-2xl">
				<Button size="sm">Add domain</Button>
			</div>
		</div>
	);
}
