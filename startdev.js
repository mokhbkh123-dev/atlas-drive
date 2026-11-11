const { spawn } = require('child_process');
const proc = spawn('npm', ['run', 'dev'], {
  cwd: 'C:\\Users\\pc\\Desktop\\location-voiture',
  shell: true,
  detached: true,
  stdio: 'ignore'
});
proc.unref();
console.log('started');
