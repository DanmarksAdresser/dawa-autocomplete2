// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from "rollup-plugin-terser";
import replace from 'rollup-plugin-replace';

const configs = [];
for (let minified of [true, false]) {
  for (let output of [{
    file: `dist/dawa-autocomplete2.${minified ? 'min.' : ''}js`,
    format: 'umd',
    name: 'dawaAutocomplete'
  }, {
    file: `dist/dawa-autocomplete2.es.${minified ? 'min.' : ''}js`,
    format: 'es'
  }]) {
    const config = {
      input: 'src/dawa-autocomplete2.js',
      plugins: [
        resolve(),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        commonjs({}),
        babel({
          "presets": [
            [
              "@babel/preset-env",
              {
                "useBuiltIns": "usage",
                "targets": {
                  "ie": "11"
                },
                corejs: '2'
              }
            ]
          ],
          ignore: ['node_modules']
        }),
        ...(minified ? [terser({})] : [])
      ],
      output,

    };
    configs.push(config);
  }
}
export default configs;