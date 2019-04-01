const express = require('express');
const realm = require('../../../services/realm');
const config = require('../../../../config');

const app = module.exports = express.Router();

// Retrieve guaranteed random ID.
app.get('/id', (req, res, next) => {
  res.contentType = 'text/html';
  res.send(realm.generateClientId());
});

// Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
app.get('/peers', (req, res, next) => {
  if (config.get('allow_discovery')) {
    const clientsIds = realm.getClientsIds();

    return res.send(clientsIds);
  }

  res.sendStatus(401);
});
