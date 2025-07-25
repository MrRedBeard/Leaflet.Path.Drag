import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import polyfills from 'rollup-plugin-node-polyfills';

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/leaflet_path_drag.iife.js',
    format: 'iife',
    name: 'leaflet_path_drag',
    sourcemap: true,
    inlineDynamicImports: true,
    globals:
    {
      leaflet: 'L'
    },
  },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true
    }),
    json(),
    polyfills()
  ]
};