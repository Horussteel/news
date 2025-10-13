module.exports = {
  apps: [{
    name: 'news',
    script: '.next/standalone/server.js',
    cwd: '/var/www/news', // Schimbați cu calea reală pe server
    instances: '1',
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3008,
      HOSTNAME: '127.0.0.1'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008,
      HOSTNAME: '127.0.0.1'
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
