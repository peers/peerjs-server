const log4js = require('log4js');
const config = require('../../../config');

const logger = log4js.getLogger();

logger.level = config.get('logger.level');

module.exports = logger;
