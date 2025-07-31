import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import projectStructure from "eslint-plugin-project-structure";
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ),
  {

    plugins: {
      "project-structure": projectStructure,
    },
    settings: {
      "project-structure/independent-modules-config-path": "independentModules.jsonc"
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      "project-structure/independent-modules": "off"
    }
  }
];

export default eslintConfig;
