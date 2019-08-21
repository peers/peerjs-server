const express = require('express');

module.exports = ({ config, realm }) => {
  const app = express.Router();

  // Retrieve guaranteed random ID.
  app.get('/id', (req, res) => {
    res.contentType = 'text/html';
    res.send(realm.generateClientId());
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
