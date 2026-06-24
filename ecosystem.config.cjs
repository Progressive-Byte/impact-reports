module.exports = {
  apps: [
    {
      name: 'impact-reports',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};