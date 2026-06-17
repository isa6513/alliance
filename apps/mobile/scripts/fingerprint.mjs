// EAS Update fingerprint (runtimeVersion) tooling.
//
//   node scripts/fingerprint.mjs                 # print current per-platform hashes
//   node scripts/fingerprint.mjs check           # exit EXIT_DRIFT if drifted from baselines (CI)
//   node scripts/fingerprint.mjs update <build>  # set a baseline from a built artifact
//
// Exit codes: 0 = OK/no drift, EXIT_DRIFT = drift detected, anything else = the
// tool failed to run. Drift uses a DEDICATED code (not 1) so CI can tell real
// drift apart from a generic Node failure — an uncaught error (e.g. a missing
// module at import-time) also exits 1, and must not be reported as drift.
//
// The baselines in fingerprint.{ios,android}.txt represent the builds currently
// live in the stores. A drift (check) means the native layer changed, so the
// change CANNOT ship to existing installs over OTA — a new App Store / Play
// Store build is required.
//
// `update` reads the fingerprint baked INTO the artifact you submit (rather than
// recomputing from the working tree), so the baseline reflects exactly what
// shipped — no "trust me, I built it from this commit". The hash lives at:
//   iOS:     <.ipa|.app|.xcarchive>  ->  EXUpdates.bundle/fingerprint
//   Android: <.aab|.apk>             ->  assets/fingerprint
// (Both .ipa and .aab/.apk are plain zips; .app/.xcarchive are directories.)
//
// `check`/print recompute the fingerprint, so run those with APP_VARIANT=production
// (the package.json scripts set it); `update` reads a file and needs no variant.

import { createFingerprintAsync } from "@expo/fingerprint";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.join(import.meta.dirname, "..");
const PLATFORMS = ["ios", "android"];
const FINGERPRINT_RE = /^[0-9a-f]{40}$/;
// Dedicated drift exit code, deliberately not 1 (Node's generic uncaught-error
// code) nor 2 (used by die() and the top-level catch below for tool failures).
const EXIT_DRIFT = 3;

const baselineFile = (platform) =>
  path.join(PROJECT_ROOT, `fingerprint.${platform}.txt`);

async function currentHash(platform) {
  const { hash } = await createFingerprintAsync(PROJECT_ROOT, {
    platforms: [platform],
  });
  return hash;
}

function baselineHash(platform) {
  const file = baselineFile(platform);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : null;
}

function die(message) {
  console.error(`Error: ${message}`);
  // Exit 2 ("tool failed to run"), matching the top-level catch — kept distinct
  // from EXIT_DRIFT (3) and Node's generic uncaught-error code (1).
  process.exit(2);
}

// --- artifact extraction (the `update` command) ---

function readZipEntry(zipPath, endsWith, label) {
  const entries = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const entry = entries.find((e) => e.endsWith(endsWith));
  if (!entry) {
    die(
      `no embedded ${label} fingerprint (${endsWith}) inside ${path.basename(zipPath)}`,
    );
  }
  return execFileSync("unzip", ["-p", zipPath, entry], {
    encoding: "utf8",
  }).trim();
}

function readDirEntry(dir, suffix, label) {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const e of fs.readdirSync(current, { withFileTypes: true })) {
      const p = path.join(current, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (p.endsWith(suffix)) return fs.readFileSync(p, "utf8").trim();
    }
  }
  die(`no ${label} fingerprint (${suffix}) found under ${dir}`);
}

function extractFromArtifact(artifact) {
  if (!artifact) {
    die(
      "usage: node scripts/fingerprint.mjs update <path-to-.ipa|.app|.xcarchive|.aab|.apk>",
    );
  }
  if (!fs.existsSync(artifact)) die(`no such artifact: ${artifact}`);

  const ext = path.extname(artifact).toLowerCase();
  const IOS_SUFFIX = path.join("EXUpdates.bundle", "fingerprint");

  switch (ext) {
    case ".ipa":
      return {
        platform: "ios",
        hash: readZipEntry(artifact, "EXUpdates.bundle/fingerprint", "iOS"),
      };
    case ".app":
    case ".xcarchive":
      return {
        platform: "ios",
        hash: readDirEntry(artifact, IOS_SUFFIX, "iOS"),
      };
    case ".aab":
    case ".apk":
      return {
        platform: "android",
        hash: readZipEntry(artifact, "assets/fingerprint", "Android"),
      };
    default:
      die(
        `unsupported artifact type "${ext}" — expected .ipa/.app/.xcarchive/.aab/.apk`,
      );
  }
}

// --- commands ---

async function run() {
  const command = process.argv[2] ?? "print";

  if (command === "update") {
    const { platform, hash } = extractFromArtifact(process.argv[3]);
    if (!FINGERPRINT_RE.test(hash)) {
      die(`extracted value is not a fingerprint: "${hash}"`);
    }
    fs.writeFileSync(baselineFile(platform), `${hash}\n`);
    console.log(`${platform}: ${hash}`);
    console.log(`wrote fingerprint.${platform}.txt`);
    return;
  }

  if (command === "check") {
    const drifted = [];
    for (const platform of PLATFORMS) {
      const current = await currentHash(platform);
      const baseline = baselineHash(platform);
      if (current !== baseline) drifted.push({ platform, baseline, current });
    }

    if (drifted.length === 0) {
      console.log("Mobile fingerprint unchanged — changes are OTA-shippable.");
      return;
    }

    console.log("FINGERPRINT_DRIFT");
    for (const { platform, baseline, current } of drifted) {
      console.log(`${platform}: ${baseline ?? "(no baseline)"} -> ${current}`);
    }
    process.exitCode = EXIT_DRIFT;
    return;
  }

  for (const platform of PLATFORMS) {
    console.log(`${platform}: ${await currentHash(platform)}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
