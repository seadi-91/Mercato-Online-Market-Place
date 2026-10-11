const { spawn } = require('node:child_process');

const nestCli = require.resolve('@nestjs/cli/bin/nest.js');
const projects = ['auth', 'users', 'catalog', 'orders', 'payments', 'api-gateway'];
const children = [];
let shuttingDown = false;

function stopAll(exitCode) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null) {
      child.kill();
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
    console.error(`Failed to start ${project}:`, error);
    stopAll(1);
  });

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(
        `${project} stopped unexpectedly (code: ${code}, signal: ${signal}).`,
      );
      stopAll(code ?? 1);
    }
  });
}

process.on('SIGINT', () => stopAll(130));
process.on('SIGTERM', () => stopAll(143));
