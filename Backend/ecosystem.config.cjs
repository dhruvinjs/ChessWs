module.exports = {
  apps: [{
    name: "backend",
    script: "dist/src/index.js", 
    autorestart: true,
    watch: false,
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "200M",

    min_uptime: "10s",              // Consider app crashed if uptime < 10s
    max_restarts:10,
    restart_delay:4000,
    env: {
      NODE_ENV: "production",
    }
  }]
}