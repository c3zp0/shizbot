import tslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    ...tslint.configs.recommended,
    eslintConfigPrettier,
    {
        name: 'custom-rules',
        files: ['**/*.ts'],
        rules: {
            semi: 'error',
            '@typescript-eslint/no-unused-vars': ['warn'],
        },
    },
];
