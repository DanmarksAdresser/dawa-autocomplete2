// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import globals from 'rollup-plugin-node-globals';
export default {
  input: 'src/dawa-autocomplete2.js',
  plugins: [
    resolve(),
    commonjs(),
    globals(),
    babel({
      "presets": ["@babel/preset-env"]
    }),
    compiler()
  ],
  output: {
    file: 'dist/dawa-autocomplete2.min.js',
    format: 'umd',
    name: 'dawaAutocomplete'
  }
};
