import { OptionSpec, TypeName, TypeSpec } from "./spec.g.ts";
import { Command } from "../deps/cliffy.ts";
import { executeCommand } from "./execute.ts";
import { camelCase, paramCase } from "../deps/case.ts";
import {
  CommandSpecNormal,
  getParameterEnvName,
  getParameterValue,
  OptionSpecNormal,
} from "./spec.ts";
import { VersionFlags } from "../_config/const.ts";

export function createCommand(
  spec: CommandSpecNormal,
  name: string,
  root: CommandSpecNormal,
): Command {
  // console.log(`createCommand name: ${name} id: ${spec.id}`)
  // console.log("spec", spec);
  let cmd = new Command()
    .name(name)
    .version(spec.version ?? "")
    .versionOption(VersionFlags)
    // .arguments()
    .description(spec.description ?? "");

  const hidden =
    spec.hidden === true || (spec.hidden !== false && name.startsWith("_"));
  if (hidden) cmd = cmd.hidden();

  const optionFieldToSpecMap = new Map<string, OptionSpec>();
  const optionSpecFields = new Map<OptionSpecNormal, string>();
  const shorts = new Set<string>();
  const getShort = (field: string) => {
    const s = `-${field[0]}`;
    if (shorts.has(s)) return undefined;
    shorts.add(s);
    return s;
  };

  // Опции
  // console.log("spec.options", spec.options);
  if (spec.options) {
    // Перебираем все спеки опций
    for (const [name, _optSpec] of Object.entries(spec.options)) {
      const optSpec = _optSpec || {};
      // Определяем длинный флаг
      const long = optSpec.long || `--${paramCase(name)}`;
      // Вычисляем поле опции в параметрах action, скользкое место, так как cliffy может определить это значение по-другому
      const field = camelCase(long);
      optionFieldToSpecMap.set(field, optSpec);
      optionSpecFields.set(optSpec, field);
      // Определяем короткий флаг
      const short = optSpec.short || getShort(field);
      // console.log({ name, field, long, short });
      // Склеиваем флаги первого параметра: flags
      let flags = [short, long].filter((c) => c).join(", ");
      // Указываем тип значения, если он отличен от boolean
      const type: TypeName = optSpec?.type?.name || "string";
      if (type !== "boolean") {
        flags = `${flags} ${formatName(`${name}:${type}`, !optSpec.type?.optional)}`;
      }
      const envName = getParameterEnvName(spec, name, optSpec?.env);
      // Добавляем опцию в команду
      cmd = cmd.option(flags, optionDescription(optSpec, envName), {
        required: optSpec.required,
        collect: optSpec.collect,
        default: typeDefault(optSpec.type, envName),
      }) as any;
    }

    // Аргументы
    if (spec.arguments) {
      const args = Object.entries(spec.arguments)
        .map(([name, argSpec]) => {
          return formatName(name, argSpec?.required);
        })
        .join(" ");
      cmd = cmd.arguments(args) as any;
    }
  }

  // Если указан скрипт выполнения команды, добавляем обработчик вызова команды
  if (spec.run?.script) {
    cmd = cmd.action(async (_opts: unknown, ...args: string[]) => {
      // console.log("action", { _opts, args });
      const options = _opts as Record<string, unknown>;
      const env: Record<string, string> = {};
      // Опции в переменные окружения
      for (const [name, optSpec] of Object.entries(spec.options || {})) {
        const field = optionSpecFields.get(optSpec)!;
        const value = getParameterValue(optSpec, options[field]);
        if (value !== undefined && value !== "" && value !== null) {
          const envName = getParameterEnvName(spec, name, optSpec?.env);
          env[envName] = `${value}`;
        }
      }
      // Аргументы в переменные окружения
      Object.entries(spec.arguments || {}).forEach(([name, argSpec], index) => {
        const value = getParameterValue(argSpec, args[index]);
        if (value !== undefined && value !== "" && value !== null) {
          const envName = getParameterEnvName(spec, name, argSpec?.env);
          env[envName] = `${value}`;
        }
      });
      // Служебные поля в переменные окружения
      env["__filename"] = spec.__meta?.__filename || "";
      env["__dirname"] = spec.__meta?.__dirname || "";
      // console.log("action", { options, args, env });
      if (spec.run?.script) {
        const { code } = await executeCommand(spec.run, { env });
        if (code) Deno.exit(code);
      }
    });
  }

  if (spec.commands) {
    for (const [subName, subSpec] of Object.entries(spec.commands)) {
      subSpec.__meta = spec.__meta;
      const subCmd = createCommand(subSpec, subName, root);
      cmd.command(subCmd.getName(), subCmd);
    }
  }

  return cmd;
}

function formatName(name: string, required?: boolean) {
  const [op, cl] = required ? ["<", ">"] : ["[", "]"];
  return `${op}${name}${cl}`;
}

function typeDefault(type: TypeSpec | undefined, envName: string | undefined) {
  let value = type?.default;
  if (envName) {
    const maybeEnvValue = Deno.env.get(envName);
    if (maybeEnvValue && type) {
      value = parseValue(type, maybeEnvValue);
    }
  }
  return value;
}

function parseValue(type: TypeSpec, str: string) {
  if (type.name === "boolean") {
    return Boolean(str);
  } else if (type.name === "number") {
    return parseFloat(str);
  } else if (type.name === "integer") {
    return parseInt(str);
  }

  return str;
}

function optionDescription(option: OptionSpecNormal, envName?: string) {
  const description: string[] = [];
  if (option.description) description.push(option.description);
  if (envName) description.push("$" + envName);

  return description.join(": ");
}
