import type { SignInConfigError } from './types';

type Schema = Readonly<Record<string, unknown>>;
type Sink = SignInConfigError[];
type JsonObject = Readonly<Record<string, unknown>>;

/** The JSON Schema 2020-12 keywords this validator implements; the shipped schema uses no others. */
export const SUPPORTED_KEYWORDS: ReadonlySet<string> = new Set([
  '$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'properties', 'additionalProperties',
  'required', 'dependentRequired', 'enum', 'const', 'pattern', 'minLength', 'maxLength', 'minimum', 'maximum',
  'exclusiveMinimum', 'allOf', 'if', 'then',
]);

const DEFS_PREFIX = '#/$defs/';

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);
const has = (value: JsonObject, key: string): boolean => Object.prototype.hasOwnProperty.call(value, key);
const child = (path: string, key: string): string => `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
const numberOf = (schema: Schema, key: string): number | undefined => (typeof schema[key] === 'number' ? (schema[key] as number) : undefined);

/** Validates a value against a schema written in the supported subset; every error carries a JSON Pointer path. */
export function validateAgainstSchema(root: Schema, value: unknown): SignInConfigError[] {
  const sink: Sink = [];
  visit(root, root, value, '', sink);
  return sink;
}

function visit(root: Schema, node: Schema, value: unknown, path: string, sink: Sink): void {
  const schema = resolve(root, node);
  if (!checkType(schema, value, path, sink)) {
    return;
  }
  checkValue(schema, value, path, sink);
  if (isObject(value)) {
    checkObject(root, schema, value, path, sink);
  }
  const parts = Array.isArray(schema.allOf) ? (schema.allOf as Schema[]) : [];
  parts.forEach((part) => visit(root, part, value, path, sink));
  if (isObject(schema.if) && isObject(schema.then)) {
    const probe: Sink = [];
    visit(root, schema.if, value, path, probe);
    if (probe.length === 0) {
      visit(root, schema.then, value, path, sink);
    }
  }
}

function resolve(root: Schema, node: Schema): Schema {
  if (typeof node.$ref !== 'string') {
    return node;
  }
  const defs = root.$defs as Record<string, Schema>;
  return defs[node.$ref.slice(DEFS_PREFIX.length)] as Schema;
}

function checkType(schema: Schema, value: unknown, path: string, sink: Sink): boolean {
  const type = schema.type;
  if (typeof type !== 'string' || matchesType(type, value)) {
    return true;
  }
  sink.push({ path, keyword: 'type', message: `must be ${type}` });
  return false;
}

function matchesType(type: string, value: unknown): boolean {
  switch (type) {
    case 'object':
      return isObject(value);
    case 'integer':
      return Number.isInteger(value);
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    default:
      return typeof value === type;
  }
}

function checkValue(schema: Schema, value: unknown, path: string, sink: Sink): void {
  if (has(schema, 'const') && value !== schema.const) {
    sink.push({ path, keyword: 'const', message: `must equal ${JSON.stringify(schema.const)}` });
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    sink.push({ path, keyword: 'enum', message: `must be one of ${schema.enum.join(', ')}` });
  }
  if (typeof value === 'string') {
    checkString(schema, value, path, sink);
  }
  if (typeof value === 'number') {
    checkNumber(schema, value, path, sink);
  }
}

function checkString(schema: Schema, value: string, path: string, sink: Sink): void {
  const length = [...value].length;
  const min = numberOf(schema, 'minLength');
  const max = numberOf(schema, 'maxLength');
  if (min !== undefined && length < min) {
    sink.push({ path, keyword: 'minLength', message: `must have at least ${min} characters` });
  }
  if (max !== undefined && length > max) {
    sink.push({ path, keyword: 'maxLength', message: `must have at most ${max} characters` });
  }
  if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern, 'u').test(value)) {
    sink.push({ path, keyword: 'pattern', message: `must match ${schema.pattern}` });
  }
}

function checkNumber(schema: Schema, value: number, path: string, sink: Sink): void {
  const min = numberOf(schema, 'minimum');
  const max = numberOf(schema, 'maximum');
  const above = numberOf(schema, 'exclusiveMinimum');
  if (min !== undefined && value < min) {
    sink.push({ path, keyword: 'minimum', message: `must be at least ${min}` });
  }
  if (max !== undefined && value > max) {
    sink.push({ path, keyword: 'maximum', message: `must be at most ${max}` });
  }
  if (above !== undefined && value <= above) {
    sink.push({ path, keyword: 'exclusiveMinimum', message: `must be more than ${above}` });
  }
}

function checkObject(root: Schema, schema: Schema, value: JsonObject, path: string, sink: Sink): void {
  const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];
  required.filter((key) => !has(value, key)).forEach((key) => sink.push({ path: child(path, key), keyword: 'required', message: 'is required' }));
  const dependent = isObject(schema.dependentRequired) ? (schema.dependentRequired as Record<string, string[]>) : {};
  for (const [trigger, needs] of Object.entries(dependent)) {
    if (has(value, trigger)) {
      needs.filter((key) => !has(value, key)).forEach((key) => sink.push({ path: child(path, key), keyword: 'dependentRequired', message: `is required when ${trigger} is set` }));
    }
  }
  const properties = isObject(schema.properties) ? (schema.properties as Record<string, Schema>) : {};
  for (const [key, sub] of Object.entries(properties)) {
    if (has(value, key)) {
      visit(root, sub, value[key], child(path, key), sink);
    }
  }
  if (schema.additionalProperties === false) {
    Object.keys(value)
      .filter((key) => !has(properties, key))
      .forEach((key) => sink.push({ path: child(path, key), keyword: 'additionalProperties', message: 'is not an allowed key' }));
  }
}
