import { XIcon } from "lucide-react";
import { WidgetIcon } from "@/assets/icons/widget-icon";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
	BundledLanguage,
	CodeBlock,
	CodeBlockBody,
	CodeBlockContent,
	CodeBlockFilename,
	CodeBlockFiles,
	CodeBlockHeader,
	CodeBlockItem,
} from "../code-block";
import { env } from "@better-comments/env/web";

interface WidgetInstructionsProps {
	installKey: string | null;
	onClose?: () => void;
}

export const WidgetInstructions = ({ installKey, onClose }: WidgetInstructionsProps) => {
	const sdkUrl = `${env.VITE_FRONTEND_ORIGIN}/sdk.js`;
	const apiUrl = env.VITE_SERVER_URL;
	const [isHtmlCopied, setIsHtmlCopied] = useState(false);

	const embedCode = installKey
		? `<script>
(function(w,d){if(w.self!==w.top) return;
if(w.location.pathname==="/widget") return;
if(typeof w.Bizme!=="function"){
  var q=[];
  var stub = function(){
    q.push(arguments)
  };
  stub.q=q;
  w.Bizme=stub
}
var s=d.createElement("script");
s.src="${sdkUrl}";
s.async=true;
d.head.appendChild(s)
})(window,document);
</script>
<script>
  if(window.self===window.top&&window.location.pathname!=="/widget"){
  window.Bizme("init",{
    installKey:"${installKey}",
    apiUrl:"${apiUrl}"
  });
}
  </script>`
		: "";

	const handleCopyHtml = () => {
		if (embedCode) {
			navigator.clipboard.writeText(embedCode);
			toast.success("Copied to clipboard");
			setIsHtmlCopied(true);
			setTimeout(() => setIsHtmlCopied(false), 2000);
		}
	};

	return (
		<>
			<div className="min-w-0 flex-1 p-2 onboarding-height overflow-hidden">
				<div className="relative h-full min-w-0 rounded-xl bg-white dark:bg-gray-950 overflow-hidden  shadow-xs border dark:border-gray-800">
					<div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto p-8 scrollbar-hide">
						<div className=" min-w-0 shrink-0">
							<div className=" flex items-start justify-between">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
									Install the widget
								</h3>
								<Button
									size="icon"
									variant="outline"
									className="text-gray-400 hidden sm:flex hover:text-gray-500 rounded-full"
									onClick={onClose}>
									<XIcon />
								</Button>
							</div>
							<p className="max-w-md text-pretty text-sm text-gray-600 dark:text-gray-400">
								Get the Bizme comments widget running on your website in
								under a minute
							</p>
						</div>
						<div className="pt-5 pb-2">
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<WidgetIcon color="purple" />
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										Standard HTML website
									</p>
								</div>
								<Button
									className="text-sm font-medium text-gray-600 dark:text-gray-100"
									variant="outline"
									size="sm"
									onClick={handleCopyHtml}>
									{isHtmlCopied ? "Copied" : "Copy"}
								</Button>
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
								Add this code to your HTML, just before the closing{" "}
								<code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
									&lt;/body&gt;
								</code>{" "}
								tag
							</p>
						</div>
						<div className="grid w-full min-w-0 overflow-hidden">
							<CodeBlock
								data={[
									{
										code: embedCode,
										language: "html",
										filename: "widget.html",
									},
								]}
								defaultValue="html">
								<CodeBlockHeader>
									<CodeBlockFiles>
										{(item) => (
											<CodeBlockFilename
												key={item.language}
												value={item.language}>
												{item.filename}
											</CodeBlockFilename>
										)}
									</CodeBlockFiles>
								</CodeBlockHeader>
								<CodeBlockBody className="h-32 overflow-y-auto hide-scrollbar">
									{(item) => (
										<CodeBlockItem
											key={item.language}
											value={item.language}>
											<CodeBlockContent
												language={
													item.language as BundledLanguage
												}>
												{item.code}
											</CodeBlockContent>
										</CodeBlockItem>
									)}
								</CodeBlockBody>
							</CodeBlock>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
