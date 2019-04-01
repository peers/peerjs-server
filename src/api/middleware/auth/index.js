const realm = require('../../../services/realm');

module.exports = (req, res, next) => {
  const { id, token } = req.params;

  const sendAuthError = () => res.sendStatus(401);

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
