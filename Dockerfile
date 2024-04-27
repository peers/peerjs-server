FROM docker.io/library/node:18.20.0 as build
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack install && corepack enable
RUN yarn install --immutable
COPY . .
RUN yarn run build
RUN yarn run test

FROM docker.io/library/node:18.20.0-alpine as production
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack install && corepack enable
RUN yarn workspaces focus --all --production
COPY --from=build /peer-server/dist/bin/peerjs.js ./
ENV PORT 9000
EXPOSE ${PORT}
ENTRYPOINT ["node", "peerjs.js"]
