// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import closure from 'rollup-plugin-closure-compiler-js';
import globals from 'rollup-plugin-node-globals';
export default {
  entry: 'src/dawa-autocomplete-ng.js',
  format: 'iife',
  moduleName: 'dawaAutocomplete',
  plugins: [
    resolve(),
    commonjs(),
    globals(),
    babel({
      "presets": [
        "es2015-rollup"
      ]
    }),
    closure()
  ],
  dest: 'dist/dawa-autocomplete-ng.min.js'
};
