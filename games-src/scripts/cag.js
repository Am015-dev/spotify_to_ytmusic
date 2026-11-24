#!/usr/bin/env node
// cag.js: call the cheapag MCP server from the shell when its tools are not loaded in the session.
// Usage: node games-src/scripts/cag.js <tool> '<json args>'   e.g. delegate '{"task":"...","files":"a.js","done_when":"`node --test`","difficulty":"easy"}'
// Tools: delegate, land, jobs, reply, research, ping. Prints the tool's text result; exit 1 on error.
const { spawn } = require("node:child_process");
const [tool, json = "{}"] = process.argv.slice(2);
if (!tool) { console.error("usage: cag.js <tool> '<json args>'"); process.exit(2); }
const args = JSON.parse(json);
const srv = spawn("cheapag", [], { stdio: ["pipe", "pipe", "inherit"] });
let buf = "", id = 0;
const pending = new Map();
const send = (method, params, notify) => {
  const msg = { jsonrpc: "2.0", method, params };
  if (!notify) msg.id = ++id;
  srv.stdin.write(JSON.stringify(msg) + "\n");
  return notify ? null : new Promise((res) => pending.set(msg.id, res));
};
srv.stdout.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    let m; try { m = JSON.parse(line); } catch { continue; }
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  }
});
(async () => {
  await send("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "cag-cli", version: "1" } });
  send("notifications/initialized", {}, true);
  const r = await send("tools/call", { name: tool, arguments: args });
  srv.kill();
  if (r.error) { console.error(JSON.stringify(r.error)); process.exit(1); }
  for (const c of r.result?.content || []) if (c.type === "text") console.log(c.text);
  process.exit(r.result?.isError ? 1 : 0);
})();
