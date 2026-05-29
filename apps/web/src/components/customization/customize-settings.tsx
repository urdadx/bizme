import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import ColorScheme from "../colorscheme";

export const THEMES = [
	{ label: "One Dark", value: "one-dark" },
	{ label: "Gruvbox", value: "gruvbox" },
	{ label: "Dracula", value: "dracula" },
] as const;

const FONT_FAMILIES = [
	{ label: "Inter", value: "inter" },
	{ label: "Erode", value: "erode" },
	{ label: "System UI", value: "system-ui" },
] as const;

export const CustomizeSettings = () => {
	return (
		<div className="flex flex-col gap-5 pb-6">
			<ColorScheme />
			<div className="flex flex-col gap-3">
				<Label className="text-muted-foreground font-medium flex items-center gap-1.5">
					Font family
				</Label>
				<Select defaultValue="inter">
					<SelectTrigger className="w-full">
						<SelectValue>
							{(value) =>
								FONT_FAMILIES.find((f) => f.value === value)?.label
							}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{FONT_FAMILIES.map((font) => (
							<SelectItem key={font.value} value={font.value}>
								{font.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex flex-col gap-3">
				<Label className="text-muted-foreground font-medium flex items-center gap-1.5">
					Theme
				</Label>
				<Select defaultValue="one-dark">
					<SelectTrigger className="w-full">
						<SelectValue>
							{(value) => THEMES.find((t) => t.value === value)?.label}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{THEMES.map((theme) => (
							<SelectItem key={theme.value} value={theme.value}>
								{theme.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-3">
				<Label className="text-muted-foreground font-medium">Brand color</Label>
				<div className="flex items-center gap-2 border p-2 rounded-md">
					<div
						style={{ backgroundColor: "#6366f1" }}
						className="w-7 h-7 rounded-md border-2 border-gray-200"
					/>
					<span className="text-sm text-gray-600">{"#6366f1"}</span>{" "}
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<Label className="text-muted-foreground font-medium">Text color</Label>
				<div className="flex items-center gap-2 border p-2 rounded-md">
					<div
						style={{ backgroundColor: "#FFFFF" }}
						className="w-7 h-7 rounded-md border-2 border-gray-200"
					/>
					<span className="text-sm text-gray-600">{"#FFFFF"}</span>{" "}
				</div>
			</div>

			<div className="flex items-center justify-between">
				<Label className="text-muted-foreground font-medium">
					Hide "Powered by Bizme" text
				</Label>
				<Switch checked={true} onCheckedChange={() => {}} />
			</div>
		</div>
	);
};
