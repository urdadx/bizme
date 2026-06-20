import { createContext } from "@better-comments/api/context";
import { appRouter } from "@better-comments/api/routers/index";
import { auth } from "@better-comments/auth";
import { env } from "@better-comments/env/server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { embedRoutes } from "./embed";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin, c) => {
      if (c.req.path.startsWith("/embed/")) {
        return origin;
      }

      return env.CORS_ORIGIN;
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Bizme-Visitor-Id"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/embed", embedRoutes);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
