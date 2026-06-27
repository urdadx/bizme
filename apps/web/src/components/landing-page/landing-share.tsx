import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as Avatar from "@radix-ui/react-avatar";
import {
	RiFacebookFill,
	RiLinkedinBoxFill,
	RiTwitterXFill,
	RiWhatsappFill,
} from "@remixicon/react";
import { Check, Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";

export function LandingShare() {
	const [copied, setCopied] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleCopy = () => {
		if (inputRef.current) {
			navigator.clipboard.writeText(inputRef.current.value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		}
	};

	const downloadQRCode = () => {
		const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
		if (!canvas) return;
		const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		const downloadLink = document.createElement("a");
		downloadLink.href = pngUrl;
		downloadLink.download = "qr-code.png";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	};

	const socialLinks = [
		{
			id: "facebook",
			icon: RiFacebookFill,
			iconColor: "text-blue-500",
			hoverBg: "hover:bg-blue-50",
			hoverBorder: "hover:border-blue-200",
			primary: true,
			platform: "facebook" as const,
		},
		{
			id: "whatsapp",
			icon: RiWhatsappFill,
			iconColor: "text-green-500",
			hoverBg: "hover:bg-green-50",
			hoverBorder: "hover:border-green-200",
			primary: true,
			platform: "whatsapp" as const,
		},
		{
			id: "twitter",
			icon: RiTwitterXFill,
			iconColor: "text-[#14171a]",
			hoverBg: "hover:bg-gray-100",
			hoverBorder: "hover:border-gray-300",
			primary: true,
			platform: "twitter" as const,
		},

		{
			id: "linkedin",
			icon: RiLinkedinBoxFill,
			iconColor: "text-[#0077b5]",
			hoverBg: "hover:bg-blue-50",
			hoverBorder: "hover:border-blue-200",
			primary: false,
			platform: "linkedin" as const,
		},
	];

	const socialShareContent = {
		facebook: "https://www.facebook.com",
		whatsapp: "https://api.whatsapp.com",
		twitter: "https://twitter.com/",
		linkedin: "https://www.linkedin.com/",
	};
	const handleShare = (platform: keyof typeof socialShareContent) => {
		const baseUrl = "https://padyna.com/@username";
		const text = `Check out my profile on ${platform}!`;
		const urls = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
			whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${baseUrl}`)}`,
			twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`,
		};

		window.open(urls[platform], "_blank");
	};

	return (
		<div className="flex flex-col gap-4 size-full transition-[filter,opacity] duration-300 group-hover:opacity-70 group-hover:blur-[3px]-full w-87.5 mx-auto  mask-[linear-gradient(black_70%,transparent)]">
			<div className="w-full mx-3.5 flex origin-top scale-95 cursor-default flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_20px_0_#00000017]">
				<Tabs defaultValue="tab-1" className="items-center justify-center mx-auto">
					<TabsList className="bg-transparent grid w-full grid-cols-2 ">
						<TabsTrigger
							value="tab-1"
							className="w-full data-[state=active]:bg-muted data-[state=active]:shadow-none">
							Share to socials
						</TabsTrigger>

						<TabsTrigger
							value="tab-2"
							className="w-full data-[state=active]:bg-muted data-[state=active]:shadow-none">
							Scan QR Code
						</TabsTrigger>
					</TabsList>
					<TabsContent value="tab-2">
						<div className="space-y-4 p-3">
							<QRCodeCanvas
								className="mx-auto w-full"
								id="qr-code"
								size={120}
								level="H"
								value={"https://padyna.com/@username"}
							/>
							<div className="text-sm text-center text-neutral-500 font-medium">
								Scan this QR code to visit the profile
							</div>
							<Button
								className="my-3 w-full text-sm"
								onClick={downloadQRCode}>
								Download
							</Button>
						</div>
					</TabsContent>
					<TabsContent value="tab-1">
						<div className="flex justify-center items-center">
							<div className="relative rounded-full border-2 border-primary">
								<Avatar.Root
									className="inline-flex h-12.5 w-12.5 border-2 
                 items-center justify-center overflow-hidden rounded-full align-middle lg:w-19 lg:h-19">
									<Avatar.Image
										className="h-full w-full rounded-[inherit] object-cover"
										src={
											"https://avatars.githubusercontent.com/u/70736338?v=4"
										}
										referrerPolicy="no-referrer"
										alt="avatar"
									/>
									<Avatar.Fallback
										className="leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
										delayMs={100}>
										{"AS"}
									</Avatar.Fallback>
								</Avatar.Root>
							</div>
						</div>
						<div className="flex flex-wrap justify-center gap-4 pt-4">
							{socialLinks.map((social) => (
								<div
									key={social.id}
									className="flex flex-col items-center gap-2">
									<Button
										onClick={() =>
											handleShare(social.platform)
										}
										size="icon"
										variant="outline"
										aria-label={`Share on ${social.id}`}
										className={cn(
											"hover:bg-gray-100 w-12 h-12 rounded-3xl",
											social.hoverBg,
											social.hoverBorder,
										)}>
										<social.icon
											size={24}
											className={social.iconColor}
										/>
									</Button>
									<span className="text-xs capitalize text-muted-foreground">
										{social.id}
									</span>
								</div>
							))}
						</div>
						<div className="flex flex-col gap-3 pt-6 text-start">
							<div className="space-y-2">
								<div className="relative">
									<Input
										ref={inputRef}
										id="input-53"
										className="pe-9"
										type="text"
										defaultValue={
											"https://padyna.com/@username"
										}
										aria-label="Share link"
										readOnly
									/>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<button
													type="button"
													onClick={handleCopy}
													className="absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
													aria-label={
														copied
															? "Copied"
															: "Copy to clipboard"
													}
													disabled={copied}>
													<div
														className={cn(
															"transition-all",
															copied
																? "scale-100 opacity-100"
																: "scale-0 opacity-0",
														)}>
														<Check
															className="stroke-emerald-500"
															size={16}
															strokeWidth={
																2
															}
															aria-hidden="true"
														/>
													</div>
													<div
														className={cn(
															"absolute transition-all",
															copied
																? "scale-0 opacity-0"
																: "scale-100 opacity-100",
														)}>
														<Copy
															size={16}
															strokeWidth={
																2
															}
															aria-hidden="true"
														/>
													</div>
												</button>
											</TooltipTrigger>
											<TooltipContent className="px-2 py-1 text-xs">
												Copy to clipboard
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
