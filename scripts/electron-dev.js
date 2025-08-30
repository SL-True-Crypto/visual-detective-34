const { spawn } = require('child_process');
const { createServer } = require('vite');

async function startElectronDev() {
  // Start Vite dev server
  const server = await createServer({
    server: {
      port: 8080
    }
  });
  
  await server.listen();
  console.log('Vite dev server started on http://localhost:8080');

  // Wait a bit for the server to be ready
  setTimeout(() => {
    // Start Electron
    const electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    electronProcess.on('close', () => {
      server.close();
    });
  }, 2000);
}

startElectronDev().catch(console.error);