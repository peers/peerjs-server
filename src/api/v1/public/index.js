const express = require('express');
const realm = require('../../../services/realm');
const config = require('../../../../config');

const app = module.exports = express.Router();

const randomId = () => {
  return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
};

const generateClientId = () => {
  let clientId = randomId();

  while (realm.getClientById(clientId)) {
    clientId = randomId();
  }

  return clientId;
};

// Retrieve guaranteed random ID.
app.get('/id', (req, res, next) => {
  res.contentType = 'text/html';
  res.send(generateClientId());
});

// Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
app.get('/peers', (req, res, next) => {
  if (config.get('allow_discovery')) {
    const clientsIds = realm.getClientsIds();

    return res.send(clientsIds);
  }

  res.sendStatus(401);
});
