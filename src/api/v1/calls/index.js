const express = require('express');
// const realm = require('../../../realm');

const app = module.exports = express.Router();

// const handle = (req, res, next) => {
//   var id = req.params.id;

//   let client;
//   if (!(client = realm.getClientById(id))) {
//     if (req.params.retry) {
//       res.sendStatus(401);
//       return;
//     } else {
//       // Retry this request
//       req.params.retry = true;
//       setTimeout(handle, 25, req, res);
//       return;
//     }
//   }

//   // Auth the req
//   if (client.token && req.params.token !== client.token) {
//     res.sendStatus(401);
//   } else {
//     self._handleTransmission(key, {
//       type: req.body.type,
//       src: id,
//       dst: req.body.dst,
//       payload: req.body.payload
//     });
//     res.sendStatus(200);
//   }
// };

// app.post('/:key/:id/:token/offer', jsonParser, handle);

// app.post('/:key/:id/:token/candidate', jsonParser, handle);

// app.post('/:key/:id/:token/answer', jsonParser, handle);

// app.post('/:key/:id/:token/leave', jsonParser, handle);
