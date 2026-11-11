import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🏦 INICIANDO PLATAFORMA DE FINANZAS (PERSONA & EMPRESA)');
console.log('====================================================');

// Start backend
const backend = spawn('node', ['--watch', 'backend/src/server.js'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', data => {
  process.stdout.write(`\x1b[36m[BACKEND]\x1b[0m ${data}`);
});

backend.stderr.on('data', data => {
  process.stderr.write(`\x1b[31m[BACKEND ERROR]\x1b[0m ${data}`);
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', data => {
  process.stdout.write(`\x1b[32m[FRONTEND]\x1b[0m ${data}`);
});

frontend.stderr.on('data', data => {
  process.stderr.write(`\x1b[33m[FRONTEND INFO]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\n🛑 Deteniendo servicios...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

