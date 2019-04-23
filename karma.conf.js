const replace = require( "rollup-plugin-replace");

const isDocker = require('is-docker')();

const builtins = require( 'rollup-plugin-node-builtins');
const globals = require( 'rollup-plugin-node-globals');

const commonjs = require( 'rollup-plugin-commonjs');
const resolve = require( 'rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
process.env.CHROME_BIN = require('puppeteer').executablePath();
// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['ChromeCustom'],
    customLaunchers: {
      ChromeCustom: {
        base: 'ChromeHeadless',
        // We must disable the Chrome sandbox when running Chrome inside Docker (Chrome's sandbox needs
        // more permissions than Docker allows by default)
        flags: isDocker ? ['--no-sandbox'] : []
      }
    },
    frameworks: ['mocha'],
    // load necessary plugins
    plugins: [
      'karma-mocha',
      require('karma-rollup-preprocessor'),
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
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        commonjs({
          namedExports: {
            // left-hand side can be an absolute path, a path
            // relative to the current directory, or the name
            // of a module in node_modules
            'ts-csp': [ 'go', 'Channel' ],
            'chai': ['assert']
          }
        }),
        builtins(),
        globals(),
        babel({
          "presets": ["@babel/preset-env"]
        }),
      ],
      output: {
        format: 'iife',               // Helps prevent naming collisions.
        name: 'dawaAutocomplete', // Required for 'iife' format.
        sourcemap: 'inline'          // Sensible for testing.
      }
    },
    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    }
  });
};
