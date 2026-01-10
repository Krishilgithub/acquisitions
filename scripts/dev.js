import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Helper to run commands
const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });
    child.on('close', code => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `Command ${command} ${args.join(' ')} failed with code ${code}`
          )
        );
    });
  });
};

const main = async () => {
  console.log('🚀 Starting Acquisition App in Development Mode');
  console.log('================================================');

  // Check .env.development
  if (!fs.existsSync('.env.development')) {
    console.error('❌ Error: .env.development file not found!');
    console.error(
      '   Please copy .env.development.example from the template and update with your Neon credentials.'
    );
    process.exit(1);
  }

  // Check Docker
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Docker is not running!', error);
    console.error('   Please start Docker Desktop and try again.');
    process.exit(1);
  }

  // Create .neon_local directory
  const neonLocalDir = path.resolve(process.cwd(), '.neon_local');
  if (!fs.existsSync(neonLocalDir)) {
    fs.mkdirSync(neonLocalDir, { recursive: true });
  }

  // Add to gitignore
  const gitignorePath = path.resolve(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes('.neon_local/')) {
      fs.writeFileSync(gitignorePath, content + '\n.neon_local/\n');
      console.log('✅ Added .neon_local/ to .gitignore');
    }
  }

  console.log('📦 Building and starting development containers...');
  console.log('   - Neon Local proxy will create an ephemeral database branch');
  console.log('   - Application will run with hot reload enabled');
  console.log('');

  // Run migrations
  // Start dev environment
  console.log('⏳ Starting services...');
  // Run in detached mode first to ensure they are up
  await runCommand('docker', [
    'compose',
    '-f',
    'docker-compose.dev.yml',
    'up',
    '--build',
    '-d',
  ]);

  console.log('⏳ Waiting for app to be ready for migrations...');
  await new Promise(r => setTimeout(r, 10000)); // Wait for services

  // Run migrations INSIDE the container or against the exposed port
  console.log('📜 Applying latest schema with Drizzle (inside container)...');
  try {
    // Use docker exec to run migration inside the app container
    await runCommand('docker', [
      'exec',
      'acquisitions-app-dev',
      'npm',
      'run',
      'db:migrate',
    ]);
  } catch (error) {
    console.error('⚠️ Migration failed. Check logs.', error);
  }

  // Attach to logs
  console.log('🎉 Development environment started! Attaching logs...');
  await runCommand('docker', [
    'compose',
    '-f',
    'docker-compose.dev.yml',
    'logs',
    '-f',
  ]);

  console.log('');
  console.log('🎉 Development environment stopped.');
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
