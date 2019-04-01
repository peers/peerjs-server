const config = require('./schema');

config.validate({ allowed: 'strict' });

module.exports = config;
