#!/usr/bin/env deno run --allow-net --allow-read --allow-write=. --allow-sys --allow-env
import { compile } from "npm:json-schema-to-typescript@13.1.2";
import { __ } from "../src/deps/dirname.ts";
import { join } from "../src/deps/std.ts";
const { __dirname } = __(import.meta);

const inputPath = join(
  __dirname,
  "..",
  "..",
  "clispec-schema",
  "schemas",
  "clispec.schema.json",
);
const outputPath = join(__dirname, "..", "src", "domain", "spec.g.ts");
const schema = await Deno.readTextFile(inputPath);
let ts = await compile(JSON.parse(schema), "CLISpec", {
  format: true,
});

["StringType", "BooleanType", "NumberType", "IntegerType"].forEach((type) => {
  ts = ts
    .replace(`export type ${type}1 = TypeBase;`, "")
    .replace(`${type}1`, "TypeBase");
});

await Deno.writeTextFile(outputPath, ts);
