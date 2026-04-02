// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
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
    ignores: ["dist/*"],
  },
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
