const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

module.exports = [
	...compat.config({
		extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
		parser: '@typescript-eslint/parser',
		plugins: ['@typescript-eslint', 'prettier'],
		env: {
			node: true,
			es2021: true,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-useless-escape': 'off',
			'no-useless-catch': 'off',
			'prefer-const': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'no-var': 'off',
			'no-unsafe-finally': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
		},
	}),
	{
		ignores: ['node_modules/**', 'dist/**'],
	},
];
