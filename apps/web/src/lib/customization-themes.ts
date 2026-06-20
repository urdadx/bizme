export const themes = [
  {
    name: "Light",
    palette: ["#FFFFFF", "#F2F2F2", "#333333", "#6170F8"],
  },
  {
    name: "Winter",
    palette: ["#0A78FA", "#4747A1", "#FFFFFF", "#021431"],
  },

  {
    name: "Dracula",
    palette: ["#282A36", "#242631", "#F8F8F2", "#F477C5"],
  },
  {
    name: "Valentine",
    palette: ["#E96D7B", "#AA92F7", "#88DCDD", "#AF4670"],
  },
  {
    name: "Synthwave",
    palette: ["#2F2C69", "#2B275F", "#F9F7FD", "#E779C1"],
  },

  {
    name: "Bumblebee",
    palette: ["#F2F2F2", "#E6E5E6", "#333333", "#E0A834"],
  },
  {
    name: "Cyberpunk",
    palette: ["#F2E237", "#E5D733", "#333005", "#F57397"],
  },
  {
    name: "Black",
    palette: ["#000000", "#0D0D0D", "#CCCCCC", "#343232"],
  },

  {
    name: "Coffee",
    palette: ["#20161F", "#1D141C", "#756E63", "#DB924B"],
  },
  {
    name: "Forest",
    palette: ["#171212", "#151010", "#D6CBCB", "#4AB855"],
  },
] as const;

function toThemeValue(name: string) {
  return name.toLowerCase().replaceAll(" ", "-");
}

export const COLOR_THEMES = themes.map((theme) => ({
  label: theme.name,
  value: toThemeValue(theme.name),
  palette: theme.palette,
  brandColor: theme.palette[3],
  textColor: theme.palette[2],
}));

export type ColorThemeValue = (typeof COLOR_THEMES)[number]["value"];

export function getColorTheme(value: string) {
  return COLOR_THEMES.find((theme) => theme.value === value) ?? COLOR_THEMES[0];
}
