// Build/test checks only. This script never signs or sends blockchain transactions.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const steps = [
  ['.', 'npx.cmd hardhat compile --build-profile default'],
  ['.', 'npx.cmd tsc --noEmit'],
  ['.', 'npx.cmd hardhat test mocha test/SupplyChain.test.ts --build-profile default'],
  ['frontend', 'npm.cmd test'],
  ['frontend', 'npm.cmd run build'],
  ['.', 'npm.cmd run export:frontend'],
  ['.', 'git diff --exit-code -- contracts test hardhat.config.ts tsconfig.json package-lock.json ignition/modules docs/test_results.txt'],
];
const records = [];
for (const [cwd, command] of steps) {
  const startedAt = new Date().toISOString();
  const result = spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd: path.join(root, cwd), encoding: 'utf8', timeout: 180000, maxBuffer: 8e6 });
  records.push({ command, cwd, startedAt, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message });
  console.log(`${result.status === 0 ? 'PASS' : 'FAIL'} ${command}`);
}
fs.writeFileSync(path.join(root, 'docs/verification/integration-checks.json'), JSON.stringify({ checkedAt: new Date().toISOString(), node: process.version, profile: 'default; Solidity 0.8.34; EVM Paris; optimizer disabled', records }, null, 2) + '\n');
if (records.some(r => r.exitCode !== 0)) process.exitCode = 1;
