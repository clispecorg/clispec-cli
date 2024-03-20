#!/usr/bin/env bash
set -eo pipefail
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Таким образом определяем версию deno заданную в .prototools этого проекта
deno_version=$(cd "$SELF_DIR" && deno -V)
deno_version=${deno_version#* }
proto run deno "$deno_version" -- run -A "$SELF_DIR/../../src/cli.ts" "$@"
