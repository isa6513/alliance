import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import process from "process";
import { chromium } from "@playwright/test";
import { screenshotTargets } from "./screenshot-targets";

type ChildProcessHandle = ReturnType<typeof spawn>;

type SpawnOptions = {
  cwd: string;
  env?: NodeJS.ProcessEnv;
};

const repoRoot = path.resolve(__dirname, "..", "..");
const backendPort = Number(process.env.BACKEND_PORT ?? "3005");
const frontendPort = Number(process.env.FRONTEND_PORT ?? "5173");
const frontendMode = (process.env.FRONTEND_MODE ?? "dev").toLowerCase();
const frontendBuildMode = process.env.FRONTEND_BUILD_MODE ?? "development";
const baseUrl =
  process.env.FRONTEND_URL ?? `http://localhost:${frontendPort}`;
const rawOutputDir =
  process.env.SCREENSHOT_OUTPUT_DIR ??
  path.join(
    repoRoot,
    "citesting",
    "screenshots",
    new Date().toISOString().replace(/[:.]/g, "-")
  );
const outputDir = path.isAbsolute(rawOutputDir)
  ? rawOutputDir
  : path.join(repoRoot, rawOutputDir);

const childProcesses: ChildProcessHandle[] = [];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const logPrefix = "[citesting:screenshots]";

const sanitizeFileName = (value: string) =>
  value
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-_.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "page";

const spawnProcess = (command: string, args: string[], options: SpawnOptions) => {
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    detached: process.platform !== "win32",
    stdio: "inherit",
  });
  childProcesses.push(child);
  return child;
};

const killProcess = async (child: ChildProcessHandle) => {
  if (!child.pid || child.killed) {
    return;
  }

  if (process.platform !== "win32") {
    try {
      process.kill(-child.pid, "SIGTERM");
      return;
    } catch {
      // Fall back to regular kill below.
    }
  }

  try {
    child.kill("SIGTERM");
  } catch {
    return;
  }
};

const shutdown = async (code: number) => {
  await Promise.all(childProcesses.map((child) => killProcess(child)));
  await delay(1000);
  await Promise.all(
    childProcesses.map(async (child) => {
      if (!child.killed) {
        try {
          child.kill("SIGKILL");
        } catch {
          // Ignore.
        }
      }
    })
  );
  process.exit(code);
};

const waitForHttp = async (url: string, timeoutMs: number) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        return;
      }
    } catch {
      // Ignore until timeout.
    }
    await delay(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const runCommand = (command: string, args: string[], options: SpawnOptions) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: "inherit",
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const startBackend = () => {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? "test",
    DB_HOST: process.env.DB_HOST ?? "localhost",
    DB_PORT: process.env.DB_PORT ?? "5432",
    DB_USERNAME: process.env.DB_USERNAME ?? "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD ?? "postgres",
    DB_NAME: process.env.DB_NAME ?? "postgres",
    JWT_SECRET: process.env.JWT_SECRET ?? "dev-jwt-secret",
    JWT_REFRESH_SECRET:
      process.env.JWT_REFRESH_SECRET ?? "dev-jwt-refresh-secret",
    APP_URL: process.env.APP_URL ?? baseUrl,
    SMTP_HOST: process.env.SMTP_HOST ?? "localhost",
    SMTP_USER: process.env.SMTP_USER ?? "ci-user",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? "ci-password",
  };

  return spawnProcess("npm", ["run", "start"], {
    cwd: path.join(repoRoot, "server"),
    env,
  });
};

const ensureFrontendBuild = async () => {
  const buildEntry = path.join(
    repoRoot,
    "apps",
    "frontend",
    "build",
    "server",
    "index.js"
  );

  if (process.env.FRONTEND_BUILD === "false") {
    return;
  }

  if (process.env.FRONTEND_BUILD !== "true" && (await fileExists(buildEntry))) {
    return;
  }

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    VITE_API_URL:
      process.env.VITE_API_URL ?? `http://localhost:${backendPort}`,
    VITE_APP_GIT_SHA: process.env.VITE_APP_GIT_SHA ?? "local",
    VITE_APP_VERSION: process.env.VITE_APP_VERSION ?? "local",
  };

  console.log(
    `${logPrefix} Building frontend (mode: ${frontendBuildMode})...`
  );
  await runCommand(
    "yarn",
    ["workspace", "@alliance/frontend", "build", "--mode", frontendBuildMode],
    { cwd: repoRoot, env }
  );
};

const startFrontend = async () => {
  if (frontendMode === "prod") {
    await ensureFrontendBuild();
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(frontendPort),
    };
    return spawnProcess("node", ["server.js"], {
      cwd: path.join(repoRoot, "apps", "frontend"),
      env,
    });
  }

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "development",
    CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? "1",
    CHOKIDAR_INTERVAL: process.env.CHOKIDAR_INTERVAL ?? "2000",
  };

  return spawnProcess(
    "yarn",
    [
      "workspace",
      "@alliance/frontend",
      "dev",
      "--port",
      String(frontendPort),
    ],
    {
      cwd: repoRoot,
      env,
    }
  );
};

const takeScreenshots = async () => {
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`${logPrefix} Output directory: ${outputDir}`);

  startBackend();
  await startFrontend();

  await waitForHttp(`http://localhost:${backendPort}/`, 60000);
  await waitForHttp(baseUrl, 90000);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const [index, target] of screenshotTargets.entries()) {
    const url = new URL(target.path, baseUrl).toString();
    const label = target.name || target.path;
    const fileName = `${String(index + 1).padStart(2, "0")}-${sanitizeFileName(
      label
    )}.png`;
    const filePath = path.join(outputDir, fileName);

    console.log(`${logPrefix} Capturing ${url} -> ${fileName}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (target.waitForSelector) {
      await page.waitForSelector(target.waitForSelector, {
        timeout: target.waitForTimeoutMs ?? 20000,
      });
    } else {
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {
        // Some pages keep background requests open; ignore.
      });
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: filePath, fullPage: true });
  }

  await page.close();
  await context.close();
  await browser.close();
};

const main = async () => {
  const handleTermination = (signal: NodeJS.Signals) => {
    console.log(`${logPrefix} Received ${signal}. Shutting down...`);
    void shutdown(1);
  };

  process.on("SIGINT", handleTermination);
  process.on("SIGTERM", handleTermination);

  try {
    await takeScreenshots();
    await shutdown(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${logPrefix} Failed: ${message}`);
    await shutdown(1);
  }
};

void main();
