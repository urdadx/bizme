import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type DeleteConfirmationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting?: boolean;
	disabled?: boolean;
	title?: string;
	description?: string;
	cancelLabel?: string;
	confirmLabel?: string;
	deletingLabel?: string;
};

export function DeleteConfirmationDialog({
	open,
	onOpenChange,
	onConfirm,
	isDeleting = false,
	disabled = false,
	title = "Are you absolutely sure?",
	description = "This action cannot be undone. This will permanently delete your comment.",
	cancelLabel = "Cancel",
	confirmLabel = "Yes, delete",
	deletingLabel = "Deleting...",
}: DeleteConfirmationDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold">
						{title}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}>
						{cancelLabel}
					</Button>
					<Button
						className="bg-red-600 text-white hover:bg-red-700"
						disabled={isDeleting || disabled}
						onClick={onConfirm}>
						{isDeleting ? deletingLabel : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
