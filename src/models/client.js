class Client {
  constructor ({ id, token }) {
    this.id = id;
    this.token = token;
    this.socket = null;
  }

  getId () {
    return this.id;
  }

  getToken () {
    return this.token;
  }

  setSocket (socket) {
    this.socket = socket;
  }

  send (data) {
    this.socket.send(JSON.stringify(data));
  }
}

module.exports = Client;
