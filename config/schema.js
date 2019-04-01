const convict = require('convict');

module.exports = convict({
  logger: {
    level: {
      doc: 'The log level. See log4js',
      format: [
        'ALL',
        'MARK',
        'TRACE',
        'DEBUG',
        'INFO',
        'WARN',
        'ERROR',
        'FATAL',
        'OFF'
      ],
      default: 'ERROR',
      env: 'LOG_LEVEL',
      arg: 'logLevel'
    }
  },
  env: {
    doc: 'The application environment.',
    format: ['prod', 'dev', 'test'],
    default: 'dev',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 9000,
    env: 'PORT',
    arg: 'port'
  },
  timeout: {
    doc: '',
    format: 'duration',
    default: 5000
  },
  key: {
    doc: 'The key to check incoming clients',
    format: String,
    default: 'peerjs',
    env: 'APP_KEY',
    arg: 'key'
  },
  path: {
    doc: '',
    format: String,
    default: '/myapp',
    env: 'APP_PATH',
    arg: 'path'
  },
  concurrent_limit: {
    doc: 'Max connections',
    format: 'duration',
    default: 5000,
    arg: 'concurrentLimit'
  },
  allow_discovery: {
    doc: 'Allow discovery of peers',
    format: Boolean,
    default: false,
    arg: 'allowDiscovery'
  },
  proxied: {
    doc: 'Set true if server running behind proxy',
    format: Boolean,
    default: false,
    env: 'APP_PROXIED',
    arg: 'proxied'
  },
  cleanup_out_msgs: {
    doc: '',
    format: 'duration',
    default: 5000
  },
  ssl: {
    key_path: {
      doc: 'The path to the private key file',
      format: String,
      default: '',
      arg: 'sslKeyPath'
    },
    cert_path: {
      doc: 'The path to the cert file',
      format: String,
      default: '',
      arg: 'sslCertPath'
    }
  }
});
