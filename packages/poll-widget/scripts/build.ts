import config from "../rolldown.config";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { rolldown } from "rolldown";

const configs = Array.isArray(config) ? config : [config];
const publicSdkPath = "../../apps/web/public/poll-sdk.js";

for (const options of configs) {
  const bundle = await rolldown(options);

  if (!options.output) {
    throw new Error("Missing Rolldown output config");
  }

  await bundle.write(options.output);
  await bundle.close();
}

await mkdir(dirname(publicSdkPath), { recursive: true });
await copyFile("dist/sdk.js", publicSdkPath);
