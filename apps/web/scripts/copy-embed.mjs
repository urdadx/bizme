import { copyFile } from "node:fs/promises";

await copyFile("dist/embed/widget-embed.js", "public/widget-embed.js");
await copyFile("dist/embed/widget-embed.css", "public/widget-embed.css");
await copyFile("dist/embed/widget-embed.js.map", "public/widget-embed.js.map");