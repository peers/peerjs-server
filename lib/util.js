
var util = {
  debug: false,
  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
  extend: function(dest, source) {
    source = source || {};
    for(var key in source) {
      if(source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
    return dest;
  },
  randomId: function () {
    return Math.random().toString(36).substr(2);
  },
  prettyError: function (msg) {
    if (util.debug) {
      console.log('ERROR PeerServer: ', msg);
    }
  },
  log: function() {
    if (util.debug) {
      var copy = [];
      for (var i = 0; i < arguments.length; i += 1) {
        copy[i] = arguments[i];
      }
      console.log.apply(console, copy);
    }
  },
  allowCrossDomain: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
  }
};

// if node
module.exports = util;
// end node
