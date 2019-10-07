const express = require('express');

module.exports = ({ config, realm, randomId }) => {
  const app = express.Router();

  // Retrieve guaranteed random ID.
  app.get('/id', (req, res) => {
    res.contentType = 'text/html';
    console.error('src/api/v1/public/index.js', randomId);
    res.send(realm.generateClientId(randomId));
  });

  // Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
  app.get('/peers', (req, res) => {
    if (config.allow_discovery) {
      const clientsIds = realm.getClientsIds();

      return res.send(clientsIds);
    }

    res.sendStatus(401);
  });

  return app;
};
