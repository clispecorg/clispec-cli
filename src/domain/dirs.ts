import { DIR } from "../_config/DIR.ts";
import { dirname, ensureDir, isAbsolute, join } from "../deps/std.ts";
import { __ } from "../deps/dirname.ts";

const { __dirname } = __(import.meta);

export enum AppHomeDirName {
  Cache = "cache",
}

const projectRootDir = () => Deno.realPathSync(join(__dirname, "..", ".."));

export function getHomeSubDir(
  subDir: string | AppHomeDirName,
  ...dirs: string[]
) {
  if (isAbsolute(subDir)) {
    return join(subDir, ...dirs);
  }

  let dir = DIR();
  if (!isAbsolute(dir)) {
    const execPath = Deno.execPath();
    const isDeno = execPath.endsWith("/deno");
    const baseDir = isDeno ? projectRootDir() : dirname(execPath);
    dir = join(baseDir, dir);
  }
  dir = join(dir, subDir, ...dirs);

  return dir;
}

export async function ensureHomeSubDir(
  subDir: string | AppHomeDirName,
  ...dirs: string[]
) {
  const dir = getHomeSubDir(subDir, ...dirs);
  // console.log("create dir", dir);
  await ensureDir(dir);
  return dir;
}

export async function ensureCacheExecuteFilePath(fileName: string) {
  const dir = await ensureHomeSubDir(AppHomeDirName.Cache, "run");
  return join(dir, fileName);
}
