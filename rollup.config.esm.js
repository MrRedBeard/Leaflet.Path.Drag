import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/leaflet_path_drag.esm.js',
    format: 'esm',
    banner: `/*! LeafletPathDrag v${pkg.version} */`,
    sourcemap: true,
    inlineDynamicImports: true,
    globals:
    {
      leaflet: 'L'
    },
  },
  plugins: [
     alias({
      entries: [
        { find: 'events', replacement: 'rollup-plugin-node-polyfills/polyfills/events.js' }
      ]
    }),
    resolve(
      { 
        browser: true, 
        preferBuiltins: false 
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true
      }),
      json(),
      nodePolyfills()
  ],
  external: []
};