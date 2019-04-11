FROM node:alpine
RUN mkdir /peer-server
WORKDIR /peer-server
COPY bin ./bin
COPY package.json .
COPY src ./src
COPY config ./config
COPY app.json .
RUN npm install
EXPOSE 9000
ENTRYPOINT ["node", "bin/peerjs"]
CMD [ "--port", "9000", "--path", "/myapp" ]
