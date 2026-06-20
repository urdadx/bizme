import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { LoaderIcon } from "./spinner";
import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";
import { RiAlertFill, RiCloseCircleFill, RiErrorWarningFill } from "@remixicon/react";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group flex items-center"
			icons={{
				success: <CheckMarkIcon color="green" className="size-4" />,
				info: <RiErrorWarningFill className="size-4 text-blue-500" />,
				warning: <RiAlertFill className="size-4 text-amber-500" />,
				error: <RiCloseCircleFill className="size-4 text-red-500" />,
				loading: (
					<div className=" animate-spin">
						<LoaderIcon />
					</div>
				),
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
