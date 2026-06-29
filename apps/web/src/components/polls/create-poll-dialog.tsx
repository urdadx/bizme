import { GalleryLinear } from "@/assets/icons/gallery-icon";
import { uploadPollOptionImage } from "@/lib/poll-option-images";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { PlusIcon, X } from "lucide-react";
import LoadingDots from "../loading-dots";

const maxChoices = 4;

const createDefaultChoices = () => [
  {
    id: "choice-1",
    value: "",
    image: null as File | null,
    previewUrl: null as string | null,
  },
  {
    id: "choice-2",
    value: "",
    image: null as File | null,
    previewUrl: null as string | null,
  },
];

export const CreatePollDialog = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createPoll = useMutation(trpc.polls.create.mutationOptions());
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [choices, setChoices] = useState(createDefaultChoices);
  const [error, setError] = useState<string | null>(null);

  const addChoice = () => {
    setChoices((current) => {
      if (current.length >= maxChoices) {
        return current;
      }

      return [
        ...current,
        {
          id: `choice-${current.length + 1}`,
          value: "",
          image: null,
          previewUrl: null,
        },
      ];
    });
  };

  const updateChoice = (id: string, value: string) => {
    setChoices((current) =>
      current.map((choice) =>
        choice.id === id ? { ...choice, value } : choice,
      ),
    );
  };

  const updateChoiceImage = (id: string, image: File | null) => {
    setChoices((current) =>
      current.map((choice) => {
        if (choice.id !== id) {
          return choice;
        }

        if (choice.previewUrl) {
          URL.revokeObjectURL(choice.previewUrl);
        }

        return {
          ...choice,
          image,
          previewUrl: image ? URL.createObjectURL(image) : null,
        };
      }),
    );
  };

  const resetForm = () => {
    for (const choice of choices) {
      if (choice.previewUrl) {
        URL.revokeObjectURL(choice.previewUrl);
      }
    }

    setQuestion("");
    setDays("");
    setHours("");
    setMinutes("");
    setChoices(createDefaultChoices());
    setError(null);
  };

  const getClosesAt = () => {
    const totalMinutes =
      Number(days || 0) * 24 * 60 +
      Number(hours || 0) * 60 +
      Number(minutes || 0);

    if (totalMinutes <= 0) {
      return null;
    }

    return new Date(Date.now() + totalMinutes * 60 * 1000).toISOString();
  };

  const handleCreate = async () => {
    const labels = choices.flatMap((choice) => {
      const label = choice.value.trim();
      return label ? [label] : [];
    });

    if (!question.trim()) {
      setError("Add a poll question.");
      return;
    }

    if (labels.length < 2) {
      setError("Add at least two choices.");
      return;
    }

    try {
      setError(null);
      const created = await createPoll.mutateAsync({
        question,
        status: "draft",
        closesAt: getClosesAt(),
        options: labels.map((label) => ({ label })),
      });
      const choicesWithLabels = choices.filter((choice) => choice.value.trim());

      await Promise.all(
        created.options.map((option, index) => {
          const image = choicesWithLabels[index]?.image;

          return image
            ? uploadPollOptionImage(option.id, image)
            : Promise.resolve();
        }),
      );
      await queryClient.invalidateQueries({
        queryKey: trpc.polls.list.queryOptions().queryKey,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create poll.",
      );
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const isPending = createPoll.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button>
              <PlusIcon />
              Create a new poll
            </Button>
          }
        />
        <DialogContent className="gap-5 shadow-none sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Create a new poll
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex items-start gap-3">
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question"
                className="h-auto border-0 px-0 py-1 text-lg font-medium shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choices</h3>
                <span className="text-xs text-muted-foreground">
                  {choices.length}/{maxChoices}
                </span>
              </div>

              {choices.map((choice, index) => (
                <div key={choice.id} className="flex items-center gap-2">
                  <div className="relative group size-10 shrink-0">
                    <label
                      htmlFor={`poll-choice-image-${choice.id}`}
                      className="flex size-full cursor-pointer items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-muted overflow-hidden"
                    >
                      <input
                        id={`poll-choice-image-${choice.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          updateChoiceImage(
                            choice.id,
                            event.target.files?.[0] ?? null,
                          )
                        }
                      />
                      {choice.previewUrl ? (
                        <img
                          src={choice.previewUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <GalleryLinear className="size-5" />
                      )}
                    </label>
                    {choice.previewUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateChoiceImage(choice.id, null);
                        }}
                        className="absolute -top-1.5 -right-1.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  <Input
                    value={choice.value}
                    onChange={(event) =>
                      updateChoice(choice.id, event.target.value)
                    }
                    placeholder={`Choice ${index + 1}`}
                    className="h-10 shadow-none"
                  />
                </div>
              ))}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addChoice}
                  disabled={choices.length >= maxChoices}
                >
                  <PlusIcon className="size-4" />
                  Add choice
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 ">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Poll length</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <PollLengthInput label="Days" value={days} onChange={setDays} />
                <PollLengthInput
                  label="Hours"
                  value={hours}
                  onChange={setHours}
                />
                <PollLengthInput
                  label="Minutes"
                  value={minutes}
                  onChange={setMinutes}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 mt-3">
              <DialogClose>
                <Button
                  variant="outline"
                  className="shadow-none"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="shadow-none"
                onClick={handleCreate}
                disabled={isPending}
              >
                <span className="inline-grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
                  <span className={isPending ? "invisible" : ""}>Create poll</span>
                  {isPending && <LoadingDots />}
                </span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

function PollLengthInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        className="h-10 shadow-none"
      />
    </label>
  );
}
