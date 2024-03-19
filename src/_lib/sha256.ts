import { crypto } from "../deps/std.ts";

export async function sha256(text: string) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  // TODO: Выбрать алгоритм формирования более короткой строки с большим числом символов
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
}

if (import.meta.main) {
  console.log(await sha256(Deno.args[0]));
}
