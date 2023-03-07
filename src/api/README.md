## HTTP API

In progress...

The API methods available on `YOUR_ROOT_PATH` + `path` option from config.

So, the base path should be like `http://127.0.0.1:9000/` or `http://127.0.0.1:9000/myapp/` if `path` option was set to `/myapp`.

Endpoints:

- GET `/` - return a JSON to test the server.

This group of methods uses `:key` option from config:

- GET `/:key/id` - return a new user id. required `:key` from config.
- GET `/:key/peers` - return an array of all connected users. required `:key` from config. **IMPORTANT:** You should set `allow_discovery` to `true` in config to enable this method. It disabled by default.
