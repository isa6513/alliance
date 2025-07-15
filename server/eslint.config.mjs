// import eslintPluginExample from './eslint/eslint-local-rules.mjs';
import tseslint from 'typescript-eslint';
import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import parser from '@typescript-eslint/parser';

export default tseslint.config([
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintNestJs.configs.flatRecommended,
  {
    // plugins: { 'local-rules': eslintPluginExample },
    files: ['**/*.ts'],
    rules: {
      'prefer-const': 'warn',
      'no-constant-binary-expression': 'error',
      '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'off',
      //   'local-rules/enforce-foo-bar': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: ['@nestjs/mapped-types'],
        },
      ],
    },
  },
]);
