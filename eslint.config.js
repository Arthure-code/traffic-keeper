import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', '.vercel', 'data'] },
  js.configs.recommended,
  tseslint.configs.recommended,
);
