#!/usr/bin/env bash
set -euo pipefail

_echoerr() {
  >&2 echo "$@"
}

_err() {
  _echoerr "$@"
  exit 1
}

[ "${WHITESOURCE_API_KEY:-}" = "" ] && _err "WHITESOURCE_API_KEY missing"
[ "${WHITESOURCE_USER_KEY:-}" = "" ] && _err "WHITESOURCE_USER_KEY missing"

envsubst < /whitesource/whitesource.config.template > /tmp/whitesource.config

#echo "-- /tmp/whitesource.config"
#cat /tmp/whitesource.config

#echo "-- /app"
#ls -l /app

echo "-- starting /wss-unified-agent.jar ..."
exec java -jar /wss-unified-agent.jar -c /tmp/whitesource.config -d /usr/src/app
