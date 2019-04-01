class Realm {
  constructor () {
    this.clients = new Map();
    this.messageQueue = new Map();
  }

  getClientsIds () {
    return [...this.clients.keys()];
  }

  getClientById (clientId) {
    return this.clients.get(clientId);
  }

  setClient (client, id) {
    this.clients.set(id, client);
  }

  removeClientById (id) {
    const client = this.getClientById(id);

    if (!client) return false;

    this.clients.delete(id);
  }

  getMessageQueueById (id) {
    return this.messageQueue.get(id);
  }

  addMessageToQueue (id, message) {
    if (!this.getMessageQueueById(id)) {
      this.messageQueue.set(id, []);
    }

    this.getMessageQueueById(id).push(message);
  }

  clearMessageQueue (id) {
    this.messageQueue.delete(id);
  }

  generateClientId () {
    const randomId = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);

    let clientId = randomId();

    while (this.getClientById(clientId)) {
      clientId = randomId();
    }

    return clientId;
  }
}

module.exports = Realm;
