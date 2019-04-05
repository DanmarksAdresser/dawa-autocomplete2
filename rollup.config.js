// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
export default {
  input: 'src/dawa-autocomplete2.js',
  plugins: [
    resolve(),
    commonjs(),
    globals(),
    babel({
      "presets": ["@babel/preset-env"]
    })
  ],
  output: [
    { file: 'dist/dawa-autocomplete2.js', format: 'umd', name: 'dawaAutocomplete' },
    { file: 'dist/dawa-autocomplete2.es.js', format: 'es' }
  ]
};
