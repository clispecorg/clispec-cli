import { CliName, EnvPrefix } from "./const.ts";
import { homeDir } from "../deps/dir.ts";
import { join } from "../deps/std.ts";

const EnvName = `${EnvPrefix}_DIR`;

export const DIR = () => Deno.env.get(EnvName) || getDefaultDir();
DIR.EnvName = EnvName;

function getDefaultDir() {
  const home = homeDir();
  if (!home)
    throw new Error(
      "Не удалось определить путь домашней папки." +
        `Папку для размещения файлов приложения, можно задать через переменную окружения: ${EnvName}.`,
    );

  return join(home, `.${CliName}`);
}
