
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";
import stylistic from '@stylistic/eslint-plugin';

const compat = new FlatCompat();

export default defineConfig({
  extends: compat.extends("next/core-web-vitals", "next/typescript"),
  plugins: {
    "@stylistic": stylistic,
  },
  rules: {
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    '@stylistic/indent': ['error', 2],
  },
  files: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx'
  ],
});
