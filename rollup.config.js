// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from "rollup-plugin-terser";
import replace from 'rollup-plugin-replace';

const configs = [];
for(let polyfilled of [true, false]) {
  for (let minified of [true, false]) {
    for (let output of [{
      file: `dist/js${polyfilled ? '' : '/unfilled'}/dawa-autocomplete2.${minified ? 'min.' : ''}js`,
      format: 'umd',
      name: 'dawaAutocomplete'
    }, {
      file: `dist/js${polyfilled ? '' : '/unfilled'}/dawa-autocomplete2.es.${minified ? 'min.' : ''}js`,
      format: 'es'
    }]) {
      const babelConfig = {
        ignore: ['node_modules'],
        presets: [
          [
            "@babel/preset-env",
            {
              "useBuiltIns": (polyfilled ? "usage" : false),
              "targets": {
                "ie": "11"
              },
              corejs: '2'
            }
          ]
        ]
      };
      const config = {
        input: 'src/dawa-autocomplete2.js',
        plugins: [
          resolve(),
          replace({
            'process.env.NODE_ENV': JSON.stringify('production')
          }),
          commonjs({}),
          babel(babelConfig),
          ...(minified ? [terser({})] : [])
        ],
        output,

      };
      configs.push(config);
    }
  }
}

export default configs;