module.exports = {
  apps: [{
    name: 'news',
    script: 'server.js',
    cwd: '/cale/catre/news', // Schimbați cu calea reală pe server
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3008,
      HOSTNAME: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/news-error.log',
    out_file: '/var/log/news-out.log',
    log_file: '/var/log/news-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    
    // Health check
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Performance
    min_uptime: '10s',
    max_restarts: 10,
    
    // Process management
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Custom variables for API keys
    env_file: '.env.production'
  }]
};
