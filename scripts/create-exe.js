const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const run = (cmd) => {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
};

console.log('Cleaning...');
['dist', 'build', 'bin', 'gscrap-service.exe'].forEach(p => 
    fs.rmSync(p, { recursive: true, force: true })
);

run('npm run build:ncc');
run('npm run build:windows:x64');

console.log('Organizing build directory...');
fs.mkdirSync('build', { recursive: true });

const simpleFiles = ['gscrap-service.exe'];
simpleFiles.forEach(f => {
    if (fs.existsSync(f)) fs.cpSync(f, path.join('build', f));
});

const copyWithFilter = (src, dest, ext) => {
    if (!fs.existsSync(src)) return;
    fs.cpSync(src, path.join(dest, src), {
        recursive: true,
        filter: (file) => {
            if (fs.statSync(file).isDirectory()) return true;
            return file.endsWith(ext);
        }
    });
};

copyWithFilter('dist', 'build', '.node');
copyWithFilter('proto', 'build', '.proto');

if (fs.existsSync('gscrap-service.exe')) fs.rmSync('gscrap-service.exe');
console.log('Build completed successfully!');