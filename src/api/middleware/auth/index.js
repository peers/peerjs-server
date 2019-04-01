const config = require('../../../../config');
const realm = require('../../../services/realm');

module.exports = (req, res, next) => {
  const { id, token, key } = req.params;

  const sendAuthError = () => res.sendStatus(401);

  if (key !== config.get('key')) {
    return sendAuthError();
  }

  if (!id) {
    return next();
  }

  const client = realm.getClientById(id);

  if (!client) {
    return sendAuthError();
  }

  if (client.getToken() && token !== client.getToken()) {
    return sendAuthError();
  }

  next();
};
