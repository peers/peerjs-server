FROM node:alpine
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json .
COPY src ./src
COPY app.json .
RUN npm install
EXPOSE 9000
ENTRYPOINT ["node", "index.js"]
CMD [ "--port", "9000" ]
