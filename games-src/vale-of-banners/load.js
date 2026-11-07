// node loader: data + engine + ai in one sandbox, returns VB
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function () {
  const ctx = { console, module: undefined }; vm.createContext(ctx);
  for (const f of ['data.js', 'engine.js', 'ai.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'), ctx, { filename: f });
  return vm.runInContext('VB', ctx);
};
