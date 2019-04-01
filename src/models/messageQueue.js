class MessageQueue {
  constructor (id) {
    this._id = id;
    this._lastReadAt = new Date().getTime();
    this._messages = [];
  }

  getLastReadAt () {
    return this._lastReadAt;
  }

  addMessage (message) {
    this._messages.push(message);
  }

  readMessage () {
    if (this._messages.length > 0) {
      this._lastReadAt = new Date().getTime();
      return this._messages.shift();
    }

    return null;
  }

  getMessages () {
    return this._messages;
  }
}

module.exports = MessageQueue;
