#!/usr/bin/env bash
set -eo pipefail
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#proto run deno 1.41.0 -- run -A "$SELF_DIR/../../src/cli.ts" "$@"
"$SELF_DIR/../../src/cli.ts" "$@"
