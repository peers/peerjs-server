FROM mhart/alpine-node
RUN apk add nodejs nodejs-npm
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json .
COPY bin ./bin
COPY lib ./lib
COPY app.json .
RUN npm install
EXPOSE 9000
CMD node bin/peerjs --port 9000
