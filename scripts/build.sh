#!/usr/bin/env bash
set -eo pipefail
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SELF_DIR/.."

declare -a targets=(
  x86_64-unknown-linux-gnu
  aarch64-unknown-linux-gnu
  x86_64-pc-windows-msvc
  x86_64-apple-darwin
  aarch64-apple-darwin
)

for target in "${targets[@]}"; do
  output_bin="$ROOT_DIR/dist/clispec-$target"
  output_zip="$output_bin.zip"
  rm -f "$output_bin" "$output_zip"
  deno compile --output "$output_bin" "$ROOT_DIR/src/cli.ts" -A --target "$target"
  zip "$output_zip" "$output_bin"
  rm -f "$output_bin"
done
