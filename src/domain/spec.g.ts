/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type CLISpec = CommandSpec & {
  $schema?: string;
  $id?: string;
};
/**
 * Run script text
 */
export type RunScript = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[a-zA-Z][a-zA-Z0-9_-]+$".
 */
export type Argument = ArgumentSpec | null;
export type Type = TypeName | TypeSpec;
export type TypeName = "string" | "boolean" | "number" | "integer";
export type TypeSpec = StringType | BooleanType | NumberType | IntegerType;
export type StringValidate = StringValidateRegex | StringValidateLength;
export type NumberValidate = NumberValidateRange;
export type ParameterEnv = string | ParameterEnvSpec;
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[a-zA-Z][a-zA-Z0-9_-]+$".
 */
export type Option = OptionSpec | null;
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[a-zA-Z_][a-zA-Z0-9_-]+$".
 */
export type Command = CommandSpec | RunScript | null;

/**
 * Command specification
 */
export interface CommandSpec {
  /**
   * Command identifier
   */
  id?: string;
  /**
   * Command name
   */
  name?: string;
  /**
   * Command version
   */
  version?: string;
  /**
   * Command description
   */
  description?: string | null;
  /**
   * Command author
   */
  author?: string;
  /**
   * Not show command in help
   */
  hidden?: boolean;
  /**
   * Prefix for parameter associated environment variables names
   */
  env?: string | CommandEnvSpec;
  /**
   * Run script text
   */
  run?: RunScript | RunSpec | null;
  /**
   * Positional arguments
   */
  arguments?: {
    [k: string]: Argument;
  };
  /**
   * Named options (flags)
   */
  options?: {
    [k: string]: Option;
  };
  /**
   * Subcommands
   */
  commands?: {
    [k: string]: Command;
  };
}
export interface CommandEnvSpec {
  prefix?: string;
  /**
   * Add the prefix of the parent command to the beginning
   */
  inherit?: boolean;
}
/**
 * Run script spec
 */
export interface RunSpec {
  /**
   * Run script text
   */
  script: string;
  /**
   * Script execution type
   */
  shell?: string | ("bash" | "sh" | "node" | "deno" | "python" | "perl");
  /**
   * Execution timeout in milliseconds
   */
  timeout?: number;
}
/**
 * Positional argument
 */
export interface ArgumentSpec {
  /**
   * Command description
   */
  description?: string;
  type?: Type;
  required?: boolean;
  /**
   * Value by default
   */
  default?: string | boolean | number;
  /**
   * The last argument of an option can be variadic
   */
  collect?: boolean;
  env?: ParameterEnv;
}
/**
 * String type
 */
export interface StringType {
  name: "string";
  default?: string;
  optional?: boolean;
  validate?: StringValidate[];
}
export interface StringValidateRegex {
  name: "regex";
  regex: string;
  message?: string;
}
export interface StringValidateLength {
  name: "length";
  min?: number;
  max?: number;
  message?: string;
}
/**
 * Boolean type
 */
export interface BooleanType {
  name: "boolean";
  default?: boolean;
  optional?: boolean;
  /**
   * Value when flag is specified
   */
  true?: string;
  /**
   * Value when flag is not specified
   */
  false?: string;
}
/**
 * Number type
 */
export interface NumberType {
  name: "number";
  default?: number;
  optional?: boolean;
  validate?: NumberValidate[];
}
export interface NumberValidateRange {
  name: "range";
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  message?: string;
}
/**
 * Integer type
 */
export interface IntegerType {
  name: "integer";
  default?: number;
  optional?: boolean;
}
export interface ParameterEnvSpec {
  name?: string;
  /**
   * Add the prefix of the parent command to the beginning
   */
  inherit?: boolean;
}
/**
 * Named option (flag)
 */
export interface OptionSpec {
  long?: string;
  short?: string;
  env?: ParameterEnv;
  /**
   * Option description
   */
  description?: string;
  type?: Type;
  required?: boolean;
  /**
   * Value by default
   */
  default?: string | boolean | number;
  /**
   * An option can occur multiple times in the command line to collect multiple values
   */
  collect?: boolean;
}