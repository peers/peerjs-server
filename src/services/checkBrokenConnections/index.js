const DEFAULT_CHECK_INTERVAL = 300;

module.exports = ({ realm, config, checkInterval = DEFAULT_CHECK_INTERVAL, onClose = () => { } }) => {
  const checkConnections = () => {
    const clientsIds = realm.getClientsIds();

    const now = new Date().getTime();
    const aliveTimeout = config.alive_timeout;

    for (const clientId of clientsIds) {
      const client = realm.getClientById(clientId);
      const timeSinceLastPing = now - client.getLastPing();

      if (timeSinceLastPing < aliveTimeout) continue;

      try {
        client.getSocket().close();
        // eslint-disable-next-line no-empty
      } catch (e) { } finally {
        realm.clearMessageQueue(clientId);
        realm.removeClientById(clientId);
        client.setSocket(null);

        if (onClose) onClose(client);
      }
    }
  };

  let timeoutId;

  const start = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      checkConnections();

      timeoutId = null;

      start();
    }, checkInterval);
  };

  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    start,
    stop,
    CHECK_INTERVAL: checkInterval
  };
};
