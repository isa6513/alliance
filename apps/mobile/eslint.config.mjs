// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import sharedRules from "../../eslint/shared-rules.mjs";

export default defineConfig([
  expoConfig,
  {
    files: ["**/*.{ts,tsx}", "**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["dist/*", "index.js", ".expo/"],
  },
  sharedRules,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native-keyboard-controller",
              importNames: ["KeyboardAwareScrollView"],
              message: "Use @/components/KeyboardAwareScrollView instead.",
            },
          ],
        },
      ],
    },
  },
]);
