const globals = require( 'rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');

const commonjs = require( 'rollup-plugin-commonjs');
const resolve = require( 'rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha'],
    // load necessary plugins
    plugins: [
      'karma-mocha',
      require('karma-rollup-plugin'),
      require('karma-chrome-launcher')
    ],
    files: [
      // Watch src files for changes but
      // don't load them into the browser.
      { pattern: 'src/**/*.js', included: false },
      'test/**/*.spec.js',
    ],

    preprocessors: {
      'src/**/*.js': ['rollup'],
      'test/**/*.spec.js': ['rollup'],
    },

    rollupPreprocessor: {
      plugins: [
        resolve(),
        commonjs({
          namedExports: {
            // left-hand side can be an absolute path, a path
            // relative to the current directory, or the name
            // of a module in node_modules
            'node_modules/ts-csp/lib/index.js': [ 'go', 'Channel' ],
            'node_modules/chai/index.js': ['assert']
          }
        }),
        globals(),
        builtins(),
        babel({
          "presets": [
            "es2015-rollup"
          ]
        }),
      ],
      format: 'iife',               // Helps prevent naming collisions.
      moduleName: 'dawaAutocomplete', // Required for 'iife' format.
      sourceMap: 'inline',          // Sensible for testing.
    },
    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    }
  });
};
