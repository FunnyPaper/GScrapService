require('./create-exe');

const fs = require('fs');
const { execSync } = require('child_process');

const run = (cmd) => {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
};

console.log('Creating installer...');
run('npm run build:windows:nsis');

fs.mkdirSync('bin', { recursive: true });
const installer = 'installer/gscrap-service-installer.exe';
if (fs.existsSync(installer)) {
    fs.cpSync(installer, 'bin/gscrap-service-installer.exe');
    fs.rmSync(installer);
}

console.log('Installer created.');