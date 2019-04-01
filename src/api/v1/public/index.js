const express = require('express');
const realm = require('../../../services/realm');
const config = require('../../../../config');

const app = module.exports = express.Router();

const randomId = () => {
  return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
};

const generateClientId = (key) => {
  let clientId = randomId();

  const realm = realmsCache.getRealmByKey(key);
  if (!realm) {
    return clientId;
  }

  while (realm.getClientById(clientId)) {
    clientId = randomId();
  }

  return clientId;
};

// Retrieve guaranteed random ID.
app.get('/id', (req, res, next) => {
  const { key } = req.params;

  res.contentType = 'text/html';
  res.send(generateClientId(key));
});

// Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
app.get('/peers', (req, res, next) => {
  if (config.get('allow_discovery')) {
    const clientsIds = realm.getClientsIds();

    return res.send(clientsIds);
  }

  res.sendStatus(401);
});

// Server sets up HTTP streaming when you get post an ID.
// app.post('/:id/:token/id', (req, res, next) => {
//   var id = req.params.id;
//   var token = req.params.token;
//   var key = req.params.key;
//   var ip = req.connection.remoteAddress;

//   if (!self._clients[key] || !self._clients[key][id]) {
//     self._checkKey(key, ip, function (err) {
//       if (!err && !self._clients[key][id]) {
//         self._clients[key][id] = { token: token, ip: ip };
//         self._ips[ip]++;
//         self._startStreaming(res, key, id, token, true);
//       } else {
//         res.send(JSON.stringify({ type: 'HTTP-ERROR' }));
//       }
//     });
//   } else {
//     self._startStreaming(res, key, id, token);
//   }
// });
