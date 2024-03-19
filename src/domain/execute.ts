import { EOL, exists } from "../deps/std.ts";
import { sha256 } from "../_lib/sha256.ts";
import { ensureCacheExecuteFilePath } from "./dirs.ts";
import {
  DefaultRunShell,
  ExecuteFileMode,
  RunShebangPrefix,
  RunShellCommands,
  RunShellHeaders,
} from "../_config/const.ts";
import { RunSpec } from "./spec.g.ts";
import CommandOptions = Deno.CommandOptions;

export async function executeCommand(run: RunSpec, options?: CommandOptions) {
  // console.log("executeCommand", options);
  const script = formatScript(run);
  // console.error(script);
  const executePath = await commandExecutePath(script);
  try {
    const command = new Deno.Command(executePath, { ...options });
    // Все потоки будут перенаправлены в дочерний процесс, что нам и нужно
    const process = command.spawn();
    return await process.status;
  } finally {
    // TODO: Подумать нужно ли удаление исполняемого файла после выполнения (так безопаснее)
    // А если будет запущена одна и та же команда параллельно множество раз? Нужно рандомно выбирать имя.
    if (await exists(executePath)) {
      // console.log("remove ", executePath);
      // TODO: По SIGINT файл не удаляется, нужно это исправить
      await Deno.remove(executePath);
    }
  }
}

export async function commandExecutePath(run: string) {
  const hash = await sha256(run);
  const fileName = `${hash}.run`;
  const executePath = await ensureCacheExecuteFilePath(fileName);
  // console.log("executePath", executePath);
  if (!(await exists(executePath))) {
    await Deno.writeTextFile(executePath, run, { mode: ExecuteFileMode });
    // console.log("run saved to: ", executePath);
  }
  return executePath;
}

function formatScript(run: RunSpec) {
  let script = run.script;
  if (!script.startsWith("#!")) {
    const shell = run.shell || DefaultRunShell;
    const header = RunShellHeaders[shell!] ?? [];
    const command = RunShellCommands[shell!] ?? shell!;
    const shebang = `${RunShebangPrefix} ${command}`;
    script = [shebang, ...header, script].join(EOL);
  }

  // console.log('script', script)
  return script;
}
