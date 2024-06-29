FROM --platform=$BUILDPLATFORM docker.io/library/node:18.20.3 as build
ARG TARGETPLATFORM
ARG BUILDPLATFORM
WORKDIR /peer-server
COPY package.json package-lock.json ./
RUN npm clean-install
COPY . ./
RUN npm run build
RUN npm run test

FROM docker.io/library/node:18.20.3-alpine as production
WORKDIR /peer-server
COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev
COPY --from=build /peer-server/dist/bin/peerjs.js ./
ENV PORT 9000
EXPOSE ${PORT}
ENTRYPOINT ["node", "peerjs.js"]
