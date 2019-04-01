class Client {
  constructor ({ id, token, ip }) {
    this.id = id;
    this.token = token;
    this.ip = ip;
    this.socket = null;
  }

  getId () {
    return this.id;
  }

  getToken () {
    return this.token;
  }

  getIp () {
    return this.ip;
  }

  setSocket (socket) {
    this.socket = socket;
  }

  send (data) {
    this.socket.send(JSON.stringify(data));
  }
}

module.exports = Client;
