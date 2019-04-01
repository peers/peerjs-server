const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/auth');
const publicContent = require('../../app.json');

const app = module.exports = express.Router();

const jsonParser = bodyParser.json();

app.use(cors());

app.get('/', (req, res, next) => {
  res.send(publicContent);
});

app.use('/:key', require('./v1/public'));
app.use('/:key/:id/:token', authMiddleware, jsonParser, require('./v1/calls'));
