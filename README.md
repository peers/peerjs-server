# PeerJS Server: Server component for PeerJS #

PeerServer helps broker connections between PeerJS clients. Data is not proxied through the server.

##[http://peerjs.com](http://peerjs.com)



**If you prefer to use a cloud hosted PeerServer instead of running your own, [sign up for a free API key here](http://peerjs.com/peerserver)**


##Run peer server

     npm install peer     


     var PeerServer = require('peer-cloud').PeerServer;
     var server = new PeerServer({ port: 9000 });