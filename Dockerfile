FROM --platform=$BUILDPLATFORM docker.io/library/node:18.20.8 as build
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json package-lock.json ./
RUN npm clean-install
COPY . ./
RUN npm run build
RUN npm run test

FROM docker.io/library/node:18.20.8-alpine as production
RUN mkdir /peer-server
WORKDIR /peer-server
COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev
COPY --from=build /peer-server/dist/bin/peerjs.js ./
ENV PORT 9000
EXPOSE ${PORT}
ENTRYPOINT ["node", "peerjs.js"]
