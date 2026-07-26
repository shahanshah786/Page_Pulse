// Polyfill the global `File` class for environments (like Node 18) where it
// is not available by default. `undici` (used internally by `cheerio`)
// references the global `File` class, which causes:
//   ReferenceError: File is not defined
// on Node 18.x test runs. Node 20+ has this global built-in already, so this
// is a no-op there.
const { File } = require('node:buffer');

if (typeof global.File === 'undefined') {
  global.File = File;
}
