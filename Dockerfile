FROM node:alpine
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json .
COPY bin ./bin
COPY lib ./lib
COPY app.json .
RUN npm install
EXPOSE 9000
ENTRYPOINT ["node", "bin/peerjs"]
CMD [ "--port", "9000" ]
