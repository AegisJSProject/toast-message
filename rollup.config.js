import terser from '@rollup/plugin-terser';

export default [{
	input: 'toast-message.js',
	output: [{
		file: 'toast-message.cjs',
		format: 'cjs',
	}, {
		file: 'toast-message.min.js',
		format: 'module',
		plugins: [terser()],
		sourcemap: true,
	}],
},];
