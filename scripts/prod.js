import { execSync, spawn } from 'child_process';
import fs from 'fs';

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
  console.log('🚀 Starting Acquisition App in Production Mode');
  console.log('===============================================');

  // Check .env.production
  if (!fs.existsSync('.env.production')) {
    console.error('❌ Error: .env.production file not found!');
    console.error(
      '   Please create .env.production with your production environment variables.'
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

  console.log('📦 Building and starting production container...');
  console.log('   - Using Neon Cloud Database (no local proxy)');
  console.log('   - Running in optimized production mode');
  console.log('');

  // Start production environment
  await runCommand('docker', [
    'compose',
    '-f',
    'docker-compose.prod.yml',
    'up',
    '--build',
    '-d',
  ]);

  // Wait for a secure moment
  console.log('⏳ Waiting for services to initialize...');
  await new Promise(r => setTimeout(r, 5000));

  // Run migrations
  console.log('📜 Applying latest schema with Drizzle...');
  try {
    await runCommand('npm', ['run', 'db:migrate']);
  } catch (error) {
    console.error('⚠️ Migration failed or skipped.', error);
  }

  console.log('');
  console.log('🎉 Production environment started!');
  console.log('   Application: http://localhost:3000');
  console.log('   Logs: docker logs acquisitions-app-prod');
  console.log('');
  console.log('Useful commands:');
  console.log('   View logs: docker logs -f acquisitions-app-prod');
  console.log('   Stop app: docker compose -f docker-compose.prod.yml down');
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
