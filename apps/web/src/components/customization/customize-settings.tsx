import type { Dispatch, FocusEvent, SetStateAction } from "react";
import { HexColorPicker } from "react-colorful";
import { CircleAlertIcon, PlusIcon } from "lucide-react";

import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { COLOR_THEMES, getColorTheme } from "@/lib/customization-themes";

import ColorScheme, { type ColorSchemeValue } from "../colorscheme";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const FONT_FAMILIES = [
  { label: "Inter", value: "inter" },
  { label: "Erode", value: "erode" },
  { label: "System UI", value: "system-ui" },
] as const;

export type CustomizationSettingsValue = {
  fontFamily: string;
  theme: string;
  colorScheme: ColorSchemeValue;
  brandColor: string;
  textColor: string;
  hidePoweredBy: boolean;
  allowedDomains: string[];
};

type CustomizeSettingsProps = {
  form: CustomizationSettingsValue;
  setForm: Dispatch<SetStateAction<CustomizationSettingsValue>>;
  save: (updates: Partial<CustomizationSettingsValue>) => void;
  isLoading?: boolean;
};

function withOccurrenceKeys(values: string[]) {
  const seen = new Map<string, number>();

  return values.map((value, index) => {
    const occurrence = (seen.get(value) ?? 0) + 1;
    seen.set(value, occurrence);

    return {
      index,
      key: `${value}-${occurrence}`,
      value,
    };
  });
}

export const CustomizeSettings = ({ form, setForm, save, isLoading }: CustomizeSettingsProps) => {
  const allowedDomainItems = withOccurrenceKeys(form.allowedDomains);

  const updateTheme = (theme: string) => {
    const colorTheme = getColorTheme(theme);
    const updates = {
      theme: colorTheme.value,
      brandColor: colorTheme.brandColor,
      textColor: colorTheme.textColor,
    };

    setForm((previous) => ({ ...previous, ...updates }));
    save(updates);
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      <ColorScheme
        value={form.colorScheme}
        onValueChange={(colorScheme) => {
          setForm((previous) => ({ ...previous, colorScheme }));
          save({ colorScheme });
        }}
      />

      <div className="flex flex-col gap-3">
        <Label className="text-muted-foreground font-medium flex items-center gap-1.5">
          Font family
        </Label>
        {isLoading ? (
          <Skeleton className="h-9 w-full rounded-md" />
        ) : (
          <Select
            value={form.fontFamily}
            onValueChange={(fontFamily) => {
              const nextFontFamily = String(fontFamily);
              setForm((previous) => ({
                ...previous,
                fontFamily: nextFontFamily,
              }));
              save({ fontFamily: nextFontFamily });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(fontFamily) => FONT_FAMILIES.find((f) => f.value === fontFamily)?.label}
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
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-muted-foreground font-medium flex items-center gap-1.5">Theme</Label>
        {isLoading ? (
          <Skeleton className="h-9 w-full rounded-md" />
        ) : (
          <Select value={form.theme} onValueChange={(theme) => updateTheme(String(theme))}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(theme) => COLOR_THEMES.find((t) => t.value === theme)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COLOR_THEMES.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  <span className="flex items-center gap-2">
                    <span className="flex overflow-hidden rounded-full border">
                      {[theme.textColor, theme.brandColor].map((color) => (
                        <span
                          key={color}
                          className="h-2 w-2"
                          style={{
                            backgroundColor: color,
                          }}
                        />
                      ))}
                    </span>
                    {theme.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <ColorPickerField
        label="Brand color"
        color={form.brandColor}
        onChange={(brandColor) => setForm((previous) => ({ ...previous, brandColor }))}
        onCommit={() => save({ brandColor: form.brandColor })}
        isLoading={isLoading}
      />

      <ColorPickerField
        label="Text color"
        color={form.textColor}
        onChange={(textColor) => setForm((previous) => ({ ...previous, textColor }))}
        onCommit={() => save({ textColor: form.textColor })}
        isLoading={isLoading}
      />

      <div className="flex flex-col gap-3 w-full">
        <Label className="text-muted-foreground font-medium flex items-center gap-1.5">
          Allowed domains
          <Tooltip>
            <TooltipTrigger>
              <CircleAlertIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>If set, the comment widget only loads on these domains.</TooltipContent>
          </Tooltip>
        </Label>
        {isLoading ? (
          <Skeleton className="h-9 w-full rounded-md" />
        ) : (
          <>
            {allowedDomainItems.map(({ index, key, value }) => (
              <div key={key} className="flex items-center gap-1">
                <Input
                  value={value}
                  placeholder="example.com"
                  onChange={(event) => {
                    const allowedDomains = [...form.allowedDomains];
                    allowedDomains[index] = event.target.value;
                    setForm((previous) => ({
                      ...previous,
                      allowedDomains,
                    }));
                  }}
                  onBlur={() =>
                    save({
                      allowedDomains: form.allowedDomains,
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const allowedDomains = form.allowedDomains.filter(
                      (_, domainIndex) => domainIndex !== index,
                    );
                    setForm((previous) => ({
                      ...previous,
                      allowedDomains,
                    }));
                    save({ allowedDomains });
                  }}
                >
                  <TrashBinLinear color="red" className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setForm((previous) => ({
                  ...previous,
                  allowedDomains: [...previous.allowedDomains, ""],
                }))
              }
            >
              <PlusIcon className="size-4" /> Add allowed domain
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-9 w-full rounded-md" />
      ) : (
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground font-medium">Hide "Powered by Bizme" text</Label>
          <Switch
            checked={form.hidePoweredBy}
            onCheckedChange={(hidePoweredBy) => {
              setForm((previous) => ({ ...previous, hidePoweredBy }));
              save({ hidePoweredBy });
            }}
          />
        </div>
      )}
    </div>
  );
};

function ColorPickerField({
  label,
  color,
  onChange,
  onCommit,
  isLoading,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
  onCommit: () => void;
  isLoading?: boolean;
}) {
  const commitOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onCommit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-muted-foreground font-medium">{label}</Label>
      {isLoading ? (
        <Skeleton className="h-9 w-full rounded-md" />
      ) : (
        <Popover onOpenChange={(open) => !open && onCommit()}>
          <PopoverTrigger className="flex items-center gap-2 rounded-md border p-1 text-left">
            <div
              style={{ backgroundColor: color }}
              className="h-7 w-7 rounded-md border-2 border-gray-200"
            />
            <span className="text-sm text-gray-600">{color}</span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3" onBlur={commitOnBlur}>
            <HexColorPicker color={color} onChange={onChange} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
