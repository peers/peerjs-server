const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const publicContent = require('../../app.json');

module.exports = ({ config, realm, messageHandler }) => {
  const authMiddleware = require('./middleware/auth')({ config, realm });

  const app = express.Router();

  const jsonParser = bodyParser.json();

  app.use(cors());

  app.get('/', (req, res) => {
    res.send(publicContent);
  });

  app.use('/:key', require('./v1/public')({ config, realm }));
  app.use('/:key/:id/:token', authMiddleware, jsonParser, require('./v1/calls')({ realm, messageHandler }));

  return app;
};
