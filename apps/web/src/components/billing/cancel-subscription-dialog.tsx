import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelSubscriptionProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCanceled?: () => void;
}

export const CancelSubscription = ({ open, onOpenChange, onCanceled }: CancelSubscriptionProps) => {
  const handleContinue = () => {
    onOpenChange(false);
    onCanceled?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-5">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Cancel subscription?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will remain active until the end of the current billing period, then
            it will not renew. You can resubscribe at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Yes, continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
