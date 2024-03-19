import {
  ArgumentSpec,
  CLISpec,
  CommandEnvSpec,
  CommandSpec,
  OptionSpec,
  ParameterEnvSpec,
  RunSpec,
  TypeSpec,
} from "./spec.g.ts";
import { constantCase } from "../deps/case.ts";

const CommandParentKey = Symbol.for("CommandParentKey");

export interface SpecMeta {
  __filename?: string;
  __dirname?: string;
}

export type shell = RunSpec["shell"];

export type OptionSpecNormal = Omit<OptionSpec, "type" | "env"> & {
  type?: TypeSpec;
  env?: ParameterEnvSpec;
};

export type ArgumentSpecNormal = Omit<ArgumentSpec, "type" | "env"> & {
  type?: TypeSpec;
  env?: ParameterEnvSpec;
};

type NormalizeSpec<TSpec extends CommandSpec> = Omit<
  TSpec,
  "run" | "env" | "options" | "arguments" | "commands"
> & {
  run?: RunSpec;
  env?: CommandEnvSpec;
  arguments?: Record<string, ArgumentSpecNormal>;
  options?: Record<string, OptionSpecNormal>;
  commands?: Record<string, NormalizeSpec<CommandSpec>>;
  __meta?: SpecMeta;
  [CommandParentKey]?: NormalizeSpec<CommandSpec>;
};

export type CommandSpecNormal = NormalizeSpec<CommandSpec>;
export type CLISpecNormal = NormalizeSpec<CLISpec>;

export function* iterCommands(
  spec: CommandSpecNormal,
): Generator<CommandSpecNormal> {
  yield spec;
  if (spec.commands) {
    for (const sub of Object.values(spec.commands)) {
      yield* iterCommands(sub);
    }
  }
}

export function commandSpecNormal<TSpec extends CommandSpec>(
  source: TSpec,
  meta: SpecMeta,
): NormalizeSpec<TSpec> {
  const { run, env, options, arguments: args, commands, ...rest } = source;

  // Если run задан как строка, превращаем его в объект RunSpec
  const _run: CommandSpecNormal["run"] =
    typeof run === "string" ? { script: run } : run ?? undefined;

  // Если env задан как строка, превращаем его в объект CommandEnvSpec
  const _env: CommandSpecNormal["env"] =
    typeof env === "string" ? { prefix: env } : env ?? undefined;

  // Аргументы
  const _arguments: CommandSpecNormal["arguments"] = {};
  for (const key in args) {
    const { type, env: paramEnv, ...argRest } = args[key] ?? {};
    const _type: TypeSpec | undefined =
      typeof type === "string" ? { name: type } : type;
    const _paramEnv: ParameterEnvSpec | undefined =
      typeof paramEnv === "string" ? { name: paramEnv } : paramEnv;
    _arguments[key] = {
      type: _type,
      env: _paramEnv,
      ...argRest,
    };
  }

  // Опции
  const _options: CommandSpecNormal["options"] = {};
  for (const key in options) {
    const { type, env: paramEnv, ...optRest } = options[key] ?? {};
    const _type: TypeSpec | undefined =
      typeof type === "string" ? { name: type } : type;
    const _paramEnv: ParameterEnvSpec | undefined =
      typeof paramEnv === "string" ? { name: paramEnv } : paramEnv;
    _options[key] = {
      type: _type,
      env: _paramEnv,
      ...optRest,
    };
  }

  // Команды
  const _commands: CommandSpecNormal["commands"] = {};
  for (const key in commands) {
    const command = commands[key];
    // Если значение в commands задано как строка, превращаем его в объект CommandSpec
    if (typeof command === "string") {
      _commands[key] = <CommandSpecNormal>{
        run: {
          script: command,
        },
      };
    } else if (command) {
      _commands[key] = commandSpecNormal(command, meta);
    }
  }

  return setCommandsParent({
    run: _run,
    env: _env,
    arguments: _arguments,
    options: _options,
    commands: _commands,
    __meta: meta,
    ...rest,
  });
}

function setCommandsParent<T extends CommandSpecNormal>(parent: T): T {
  if (parent.commands) {
    for (const name in parent.commands) {
      const command = parent.commands[name];
      command[CommandParentKey] = parent;
      setCommandsParent(command);
    }
  }
  return parent;
}

// Перебрать команды от корневого родителя вниз до указанной команды.
function getCommandParents(command: CommandSpecNormal): CommandSpecNormal[] {
  const parent = command[CommandParentKey];
  if (parent) {
    return [...getCommandParents(parent), parent];
  }
  return [];
}

function getCommandWithParents(
  command: CommandSpecNormal,
): CommandSpecNormal[] {
  return [...getCommandParents(command), command];
}

export function getCommandEnvPrefix<T extends CommandSpecNormal>(
  command: T,
): string {
  let result = "";
  // По-умолчанию берём первый не пустой префикс,
  // а если у него выставлен inherit=true, то двигаемся дальше вверх до непустого и тд.
  for (const cmd of getCommandWithParents(command).reverse()) {
    result = (cmd?.env?.prefix || "") + result;
    if (cmd.env?.inherit === false) break;
    if (!!result && cmd.env?.inherit !== true) break;
  }
  return result;
}

export function getParameterEnvName(
  command: CommandSpecNormal,
  paramName: string,
  env: ParameterEnvSpec | undefined,
): string {
  const envPrefix = env?.inherit === false ? "" : getCommandEnvPrefix(command);
  return envPrefix + (env?.name || constantCase(paramName));
}

export function getParameterValue(
  paramSpec: OptionSpecNormal | ArgumentSpecNormal,
  actionValue?: unknown,
) {
  let value = actionValue ?? paramSpec.type?.default;
  if (paramSpec.type?.name === "boolean") {
    if (value === true) value = paramSpec.type?.true ?? value;
    else value = paramSpec.type?.false ?? value;
  }
  // if(Array.isArray(actionValue) && )
  return value;
}
