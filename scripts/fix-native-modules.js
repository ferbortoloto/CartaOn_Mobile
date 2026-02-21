/**
 * Patches react-native-webview/index.js to use CommonJS instead of ESM.
 * Needed because Node.js v22+ require(esm) fails on bare specifiers without
 * explicit file extensions (e.g. './lib/WebView' instead of './lib/WebView.js').
 */
const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../node_modules/react-native-webview/index.js');
const fixed = `// CommonJS wrapper — original uses ESM bare specifiers that break Node.js v22+ require(esm)
var lib = require('./lib/WebView.js');
var WebView = lib.default || lib.WebView;
exports.WebView = WebView;
exports.default = WebView;
module.exports = exports;
`;

try {
  fs.writeFileSync(target, fixed, 'utf8');
  console.log('✔ Patched react-native-webview/index.js');
} catch (e) {
  console.warn('Could not patch react-native-webview/index.js:', e.message);
}
