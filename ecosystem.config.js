module.exports = {
  apps: [
    {
      name: 'labubu-api',
      cwd: './api',
      script: 'node',
      args: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'labubu-admin',
      cwd: './admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 5003',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'labubu-user',
      cwd: './user',
      script: 'node_modules/.bin/next',
      args: 'start -p 5002',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
