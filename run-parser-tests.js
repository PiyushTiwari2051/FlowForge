// run-parser-tests.js
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true
  }
});
require('./src/lib/config/parser.test.ts');
