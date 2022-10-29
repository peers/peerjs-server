# [1.0.0-rc.1](https://github.com/peers/peerjs-server/compare/v0.6.1...v1.0.0-rc.1) (2022-10-29)


### Bug Fixes

* **npm audit:** Updates all dependencies that cause `npm audit` to issue a warning ([1aaafbc](https://github.com/peers/peerjs-server/commit/1aaafbc4504224f36287fd721f6edbc27a5b9eaa)), closes [#287](https://github.com/peers/peerjs-server/issues/287)


### Features

* drop Node {10,11,12,13} support ([b70ed79](https://github.com/peers/peerjs-server/commit/b70ed79d9a239593d128ea2914eea0c2107b03b2))


### Performance Improvements

* use the builtin UUID generator for Peer ids instead of the `uuid` module ([5d882dd](https://github.com/peers/peerjs-server/commit/5d882dd0c6af9bed8602e0507fdf5c1d284be075))


### BREAKING CHANGES

* Node >= 14 required

14 is the oldest currently supported version. See https://github.com/nodejs/release#release-schedule
