#!/usr/bin/env -S deno run -q -A
import { Command, CompletionsCommand, ValidationError } from "./deps/cliffy.ts";
import {
  CliDescription,
  CliName,
  CliVersion,
  SchemaURL,
  VersionFlags,
} from "./_config/const.ts";
import { basename, dirname, existsSync, extname, yaml } from "./deps/std.ts";
import { createCommand } from "./domain/command.ts";
import { CommandSpecNormal, commandSpecNormal } from "./domain/spec.ts";

const cmd = new Command()
  .name(CliName)
  .version(CliVersion)
  .versionOption(VersionFlags)
  .description(CliDescription)
  .error((error, cmd1) => {
    if (error instanceof ValidationError) {
      cmd1.showHelp();
    }
    console.error(error.message);
    Deno.exit(error instanceof ValidationError ? error.exitCode : 1);
  })
  .arguments("<your-cli-spec.yaml>")
  .example(
    "your-cli-spec.yaml",
    `#!/usr/bin/env clispec
$schema: "${SchemaURL}"
run: "echo Hello, world!"`,
  );

if (import.meta.main) {
  const maybeSpecPath = Deno.args[0];
  if (maybeSpecPath && existsSync(maybeSpecPath)) {
    const fileName = await Deno.realPath(maybeSpecPath);
    const specSource: CommandSpecNormal =
      yaml.parse(await Deno.readTextFile(maybeSpecPath)) || {};
    const spec = commandSpecNormal(specSource, {
      __filename: fileName,
      __dirname: dirname(fileName),
    });
    const name = spec.name || basename(maybeSpecPath, extname(maybeSpecPath));
    const command = createCommand(spec, name, spec);
    command.command("completions", new CompletionsCommand().hidden());
    await command.parse(Deno.args.slice(1));
  } else {
    await cmd.parse();
  }
}
