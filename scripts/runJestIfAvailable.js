import { existsSync } from 'fs';
import { spawn } from 'child_process';

const jestPath = './node_modules/jest/bin/jest.js';

if (existsSync(jestPath)) {
  const child = spawn(process.execPath, ['--experimental-vm-modules', jestPath], { stdio: 'inherit' });
  child.on('exit', code => process.exit(code));
} else {
  console.warn('Jest not installed - skipping tests.');
}
