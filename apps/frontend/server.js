import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import io from "@pm2/io";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const reactRouterHandler = createRequestHandler({
  build: await import("./build/server/index.js"),
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

const ssrHttpLatency = io.histogram({
  name: "ssr_http_latency",
  measurement: "duration",
  unit: "ms",
});

io.init({
  http: true, // enable built-in HTTP metrics (latency, req/sec, etc)
  transactions: true, // enable transaction tracing
  metrics: {
    http: true,
  },
});

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    if (!ssrHttpLatency) return;
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    ssrHttpLatency.update(ms);
  });

  next();
});

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

// handle SSR requests
app.all("{*splat}", reactRouterHandler);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
);
