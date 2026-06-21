import { useId } from "react";
import uiDark from "@/assets/images/ui-dark.png";
import uiLight from "@/assets/images/ui-light.png";
import uiSystem from "@/assets/images/ui-system.png";
import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

const COLOR_SCHEMES = [
  { image: uiSystem, label: "System", value: "system" },
  { image: uiLight, label: "Light", value: "light" },
  { image: uiDark, label: "Dark", value: "dark" },
] as const;

export type ColorSchemeValue = (typeof COLOR_SCHEMES)[number]["value"];

export default function ColorScheme({
  value,
  onValueChange,
}: {
  value: ColorSchemeValue;
  onValueChange: (value: ColorSchemeValue) => void;
}) {
  const id = useId();
  return (
    <fieldset className="space-y-1 w-full">
      <Label className="text-muted-foreground font-medium flex items-center">Color scheme</Label>
      <RadioGroup
        className="flex gap-3 w-full"
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue as ColorSchemeValue)}
      >
        {COLOR_SCHEMES.map((item) => (
          <label key={`${id}-${item.value}`}>
            <RadioGroupItem
              className="peer w-full sr-only after:absolute after:inset-0"
              id={`${id}-${item.value}`}
              value={item.value}
            />
            <img
              alt={item.label}
              className="relative w-full h-14 cursor-pointer overflow-hidden rounded-md border border-input shadow-xs outline-none transition-[color,box-shadow] peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-data-disabled:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-disabled:opacity-50"
              height={70}
              src={item.image}
              width={88}
            />
            <span className="mt-2 flex items-center gap-1.5 peer-data-[state=unchecked]:text-muted-foreground/70">
              <span className="font-medium text-center text-xs">{item.label}</span>
              <CheckMarkIcon
                className={cn(
                  "size-4 transition-opacity",
                  value === item.value ? "opacity-100" : "opacity-0",
                )}
                color="currentColor"
              />
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
