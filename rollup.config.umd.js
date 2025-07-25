// rollup.config.umd.js

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import polyfills from 'rollup-plugin-node-polyfills';
import pkg from './package.json' assert { type: 'json' };

export default
{
  input: 'src/index.js',
  output: {
    file: 'dist/leaflet_path_drag.umd.js',
    format: 'umd',
    name: 'leaflet_path_drag', // global name for UMD consumers
    banner: `/*! LeafletPathDrag v${pkg.version} */`,
    sourcemap: true,
    inlineDynamicImports: true,
    globals:
    {
      leaflet: 'L'
    }
  },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(
    {
      include: /node_modules/,
      transformMixedEsModules: true
    }),
    json(),
    polyfills()
  ],
  external: ['leaflet']
};