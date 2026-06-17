const { SourceSkips } = require("@expo/fingerprint");

/**
 * Controls how the OTA `runtimeVersion` (policy: "fingerprint") is computed.
 * The fingerprint hashes the *native* layer so an OTA update only ever lands on
 * a binary it's actually compatible with. CI compares this hash against the
 * committed `fingerprint.{ios,android}.txt` baselines (the last-shipped builds)
 * and alerts on Slack when it drifts — i.e. when a new store build is required.
 * See `scripts/fingerprint.js` + `.github/workflows/mobile-fingerprint-check.yaml`.
 *
 * We skip inputs that do NOT change native/OTA compatibility, so they don't
 * needlessly churn the runtimeVersion and orphan shipped binaries from OTA:
 *   - PackageJsonScriptsAll: package.json scripts are build tooling.
 *   - ExpoConfigVersions: app `version` / `buildNumber` / `versionCode` are
 *     bumped every release but don't affect JS compatibility — an OTA must
 *     still be able to patch an already-shipped build after the repo version
 *     moves on.
 *
 * We intentionally do NOT skip dependencies or other native config: adding /
 * upgrading a native dep or changing plugins genuinely changes the binary, so
 * the fingerprint must move (a new store build is required) rather than letting
 * an OTA reference a native module the installed binary lacks.
 */
module.exports = {
  sourceSkips:
    SourceSkips.PackageJsonScriptsAll | SourceSkips.ExpoConfigVersions,
};
