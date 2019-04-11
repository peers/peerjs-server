module.exports = {
  host: '0.0.0.0',
  port: 9000,
  expire_timeout: 5000,
  key: 'peerjs',
  path: '/myapp',
  concurrent_limit: 5000,
  allow_discovery: false,
  proxied: false,
  cleanup_out_msgs: 1000,
  ssl: {
    key: '',
    cert: ''
  }
};
