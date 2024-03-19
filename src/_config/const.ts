import { shell } from "../domain/spec.ts";

export const CliName = "clispec";
export const EnvPrefix = CliName.toUpperCase();
export const CliVersion = "1.0.0";
export const SchemaURL = `https://clispec.org/schemas/clispec.json`;
export const CliDescription =
  "The interpreter of the open CLI specification: https://clispec.org";
export const ExecuteFileMode = 0o700;
export const RunShebangPrefix = "#!/usr/bin/env";
export const DefaultRunShell: shell = "bash";
export const RunShellCommands: { [shell: string]: string } = {
  deno: "deno run -A",
};
export const RunShellHeaders: { [shell: string]: string[] } = {
  bash: ["set -eo pipefail"],
};
export const VersionFlags = "-v, --version";
