const MessageQueue = require('./messageQueue');

class Realm {
  constructor () {
    this._clients = new Map();
    this._messageQueues = new Map();
  }

  getClientsIds () {
    return [...this._clients.keys()];
  }

  getClientById (clientId) {
    return this._clients.get(clientId);
  }

  setClient (client, id) {
    this._clients.set(id, client);
  }

  removeClientById (id) {
    const client = this.getClientById(id);

    if (!client) return false;

    this._clients.delete(id);
  }

  getMessageQueueById (id) {
    return this._messageQueues.get(id);
  }

  addMessageToQueue (id, message) {
    if (!this.getMessageQueueById(id)) {
      this._messageQueues.set(id, new MessageQueue(id));
    }

    this.getMessageQueueById(id).addMessage(message);
  }

  clearMessageQueue (id) {
    this._messageQueues.delete(id);
  }

  generateClientId (_genRandomId) {
    const originalGenRandomId = () => {
      return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
    }

    const genRandomId = _genRandomId && typeof _genRandomId === 'function' ?
      () => _genRandomId :
      () => originalGenRandomId;

    let clientId = genRandomId();

    while (this.getClientById(clientId)) {
      clientId = genRandomId();
    }

    return clientId;
  }
}

module.exports = Realm;
