# PeerServer Changelog

### vNEXT


### 0.6.1

* New: PeerJS Server in Docker capture ^C signal and terminate gracefully. #205
* Fix: SSL options in default config. #230

### 0.6.0

* New: `host` option (`--host`, `-H`). #197 Thanks @millette
* Fix: Allows SNICallback instead of hardcoded key/cert. #225 Thanks @brunobg
* Change: Upgrade TypeScript version to 4.1.2.

### 0.5.3

* PeerServer uses yargs instead of an outdated minimist. #190 Thanks @hobindar

### 0.5.2

* Fix: WebSocket server doesn't work  on Windows #170 Thanks @lqdchrm

### 0.5.1

* Fix: WebSocket server doesn't work  when use non "/" mount path with ExpressPeerServer #132

### 0.5.0

* Fix: http api not working - #163 Thanks riscoss63

* Change: use "/" instead of "/myapp" as a default value for config's `path` option

* New: typescript declaration file

* Update deps:
```diff
-  "cors": "2.8.4",
+  "cors": "^2.8.5",
-  "uuid": "3.3.3",
+  "uuid": "^3.4.0",
-  "ws": "7.1.2",
+  "ws": "^7.2.3"
```

### 0.4.0

* New: Allow passing in custom client ID generation function - #157 Thanks @ajmar

### 0.3.2

* Fixed: fix main field in package.json

### 0.3.1

* Fixed: no expire message in some cases

### 0.3.0

* Convert project to TypeScript 3.7.3.
* Use UUID when generate client id - #152
* Refactoring (add ESLint, split code into small unit) Thanks to @d07RiV @zhou-yg
* Update deps.

### 0.2.6

* Ensure 16 character IDs.

### 0.2.5

* Takes a `path` option, which the peer server will append PeerJS routes to.
* Add support for configurable server IP address.

### 0.2.1

* Added test suite.
* Locked node dependency for restify.
