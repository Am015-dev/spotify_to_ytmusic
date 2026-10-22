// Lists the part files for tools: parts/<module>/<file> (relative paths, sorted by name) plus the root files (head.html, sw.js, build.py).
const fs = require('fs'), path = require('path'), DIR = path.join(__dirname, 'parts');
const list = () => fs.readdirSync(DIR, { withFileTypes: true }).flatMap(d => d.isDirectory() ? fs.readdirSync(path.join(DIR, d.name)).map(f => d.name + '/' + f) : [d.name]).filter(f => true).sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
const find = name => list().find(f => path.basename(f) === name);
module.exports = { dir: DIR, list, find };
