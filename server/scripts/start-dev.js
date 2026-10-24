const { spawn } = require('node:child_process');

const nestCli = require.resolve('@nestjs/cli/bin/nest.js');

const validProjects = {
  auth: 'auth',
  users: 'users',
  catalog: 'catalog',
  orders: 'orders',
  payments: 'payments',
  'api-gateway': 'api-gateway',
  gateway: 'api-gateway',
  getway: 'api-gateway', // Common user typo
};

// Inspect CLI arguments passed to this script
const cliArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
let projects = ['auth', 'users', 'catalog', 'orders', 'payments', 'api-gateway'];

if (cliArgs.length > 0 && cliArgs[0].toLowerCase() !== 'all') {
  const requested = cliArgs[0].toLowerCase();
  const matched = validProjects[requested];
  if (matched) {
    projects = [matched];
    console.log(`[MercatoX Dev] Starting single service: ${matched}`);
  } else {
    console.warn(`[MercatoX Dev] Unknown project "${cliArgs[0]}". Valid projects: ${Object.keys(validProjects).join(', ')}. Starting all services.`);
  }
} else {
  console.log(`[MercatoX Dev] Starting all microservices: ${projects.join(', ')}`);
}

const children = [];
let shuttingDown = false;

function stopAll(exitCode) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child && child.exitCode === null) {
      try {
        child.kill();
      } catch {
        // ignore
      }
    }
  }
}

for (const project of projects) {
  const child = spawn(
    process.execPath,
    [nestCli, 'start', project, '--watch'],
    { stdio: 'inherit', env: process.env },
  );
  children.push(child);

  child.on('error', (error) => {
    console.error(`[MercatoX Dev] Failed to start ${project}:`, error);
    stopAll(1);
  });

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.warn(
        `[MercatoX Dev] ${project} exited (code: ${code}, signal: ${signal}).`,
      );
      // Only stop all if running a single service or explicitly terminated
      if (projects.length === 1) {
        stopAll(code ?? 1);
      }
    }
  });
}

process.on('SIGINT', () => stopAll(130));
process.on('SIGTERM', () => stopAll(143));

