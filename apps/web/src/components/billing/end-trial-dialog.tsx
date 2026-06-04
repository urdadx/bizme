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

interface EndTrialProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnded?: () => void;
}

export const EndTrial = ({ open, onOpenChange, onEnded }: EndTrialProps) => {
  const handleEndTrial = () => {
    onOpenChange(false);
    onEnded?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-5">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            End your trial early?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your trial will end immediately and your plan will become active. Billing will start
            from today.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleEndTrial();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Yes, end trial
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
