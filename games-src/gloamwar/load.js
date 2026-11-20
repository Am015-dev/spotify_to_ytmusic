// Loads the Gloamwar engine (no page) into one context for node tests: const W = require('./load.js')();
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function () {
  const ctx = { console, Math, JSON, Object, Array, String, Number, Date };
  vm.createContext(ctx);
  ['map.js', 'data.js', 'cards.js', 'engine.js', 'combat.js', 'effects.js', 'ai.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'), ctx, { filename: f }));
  return ctx;
};
