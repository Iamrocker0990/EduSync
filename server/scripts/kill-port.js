/**
 * Kill process(es) listening on a given TCP port.
 *
 * Supports:
 * - Windows (netstat + taskkill)
 * - macOS/Linux (lsof + kill)
 *
 * Usage:
 *   node scripts/kill-port.js 5000
 */
const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
}

function killOnWindows(port) {
  // netstat output example:
  // TCP    0.0.0.0:5000     0.0.0.0:0      LISTENING       12345
  const out = run(`netstat -ano | findstr :${port}`);
  const pids = new Set();

  out
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      // columns are whitespace-separated; PID is last column
      const parts = line.split(/\s+/);
      const pid = parts[parts.length - 1];
      const state = parts[parts.length - 2];
      // Only kill LISTENING sockets on that port
      if (state === 'LISTENING' && pid && pid !== '0') pids.add(pid);
    });

  if (pids.size === 0) return;

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
       
      console.log(`[kill-port] Killed PID ${pid} on port ${port}`);
    } catch (e) {
       
      console.warn(`[kill-port] Failed to kill PID ${pid}: ${e.message}`);
    }
  }
}

function killOnPosix(port) {
  // lsof output: list of PIDs
  let out = '';
  try {
    out = run(`lsof -ti tcp:${port}`);
  } catch {
    // no process using port
    return;
  }

  const pids = out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (pids.length === 0) return;

  for (const pid of pids) {
    try {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
       
      console.log(`[kill-port] Killed PID ${pid} on port ${port}`);
    } catch (e) {
       
      console.warn(`[kill-port] Failed to kill PID ${pid}: ${e.message}`);
    }
  }
}

function main() {
  const portArg = process.argv[2];
  const port = Number(portArg);
  if (!port || Number.isNaN(port)) {
     
    console.error('Usage: node scripts/kill-port.js <port>');
    process.exit(1);
  }

  try {
    if (process.platform === 'win32') {
      killOnWindows(port);
    } else {
      killOnPosix(port);
    }
  } catch (e) {
    // If netstat/findstr finds nothing it will throw; that's fine.
     
    console.log(`[kill-port] Nothing to kill on port ${port}`);
  }
}

main();

