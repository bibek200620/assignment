import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
if (!existsSync('.env')) {
  writeFileSync(
    '.env',
    `PORT=5001\nMONGODB_URI=mongodb://127.0.0.1:27017/amazon_clone\nJWT_SECRET=${randomBytes(48).toString('hex')}\nNODE_ENV=development\n`,
  );
  console.log('Created .env with a random JWT secret.');
}
function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error || result.status !== 0) {
    console.error(
      result.error?.message ||
        `${command} failed. Check that Docker Desktop is running, or use the manual setup in README.md.`,
    );
    process.exit(1);
  }
}
run('docker', ['compose', 'up', '-d', '--wait', 'mongo']);
run('npm', ['run', 'seed']);
console.log('\nReady! Run npm run dev, then open http://localhost:5173');
