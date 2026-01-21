module.exports = {
  apps: [{
    name: "backend",
    script: "dist/src/index.js", 
    autorestart: true,
    watch: false,
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "200M",
    env: {
      NODE_ENV: "production",
    }
  }]
}