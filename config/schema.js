const convict = require('convict');

module.exports = convict({
  debug: {
    doc: 'Enable debug mode',
    format: Boolean,
    default: false
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
    default: 'peerjs'
  },
  path: {
    doc: '',
    format: String,
    default: '/myapp'
  },
  concurrent_limit: {
    doc: 'Max connections',
    format: 'duration',
    default: 5000
  },
  allow_discovery: {
    doc: 'Allow discovery of peers',
    format: Boolean,
    default: false
  },
  proxied: {
    doc: 'Set true if server running behind proxy',
    format: Boolean,
    default: false
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
      default: ''
    },
    cert_path: {
      doc: 'The path to the cert file',
      format: String,
      default: ''
    }
  }
});
