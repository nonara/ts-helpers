import deepCopy from 'rfdc';
import deepMerge from 'deepmerge'
import { JsonValue } from '../types';


/* ****************************************************************************************************************** */
// region: JSON
/* ****************************************************************************************************************** */

/**
 * Validate a possible JSON object represented as string
 */
export function isJSONObjectString(s: string): boolean {
  return swallowError(() => {
    const o = JSON.parse(s);
    return !!o && (typeof o === 'object') && !Array.isArray(o)
  }, false);
}

/**
 * Validate a possible JSON object represented as string
 */
export function isJSONObject(o: any): boolean {
  return swallowError(() =>
    !!o && (typeof o === 'object') && !Array.isArray(o) && Boolean(JSON.stringify(o))
  , false);
}

export function isValidJSON(v: any): v is JsonValue {
  return swallowError(() => !!JSON.stringify(v));
}

// endregion


/* ****************************************************************************************************************** */
// region: General
/* ****************************************************************************************************************** */

/**
 * Cast a value to a type (bypasses similarity check)
 * @param value - Pass value to cast or leave empty to create an empty type-only placeholder
 */
export const cast = <T>(value?: any): T => value;

/**
 * Swap key & value in a map
 */
export const reverseMap = <TKeyType, TValType>(map: Map<TKeyType, TValType>): Map<TValType, TKeyType> =>
  new Map([ ...map.entries() ].map(([ k, v ]) => [ v, k ]));

// @formatter:off
/**
 * forEach with accumulator. This is meant to replace difficult to read Array.reduce methods.
 */
export function accForEach<T, Acc>(
  arr: T[],
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, arr: T[]) => void
): Acc
/**
 * forEach with accumulator. This is meant to replace difficult to read Array.reduce methods.
 */
export function accForEach<T, Acc>(
  iterable: Iterable<T>,
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, iterable: Iterable<T>) => void
): Acc
export function accForEach<T, Acc>(
  iterable: Iterable<T> | T[],
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, iterable: any) => void
): Acc {
  if (Array.isArray(iterable)) iterable.forEach((item, i) => cb(item, acc, i, iterable));
  else {
    let i = 0;
    for (const item of iterable) {
      cb(item, acc, i, iterable);
      i++;
    }
  }
  return acc;
}
// @formatter:on

/**
 * Executes fn, swallowing error (saves performance by not generating a stack)
 */
export function swallowError<Fn extends (...args: any[]) => any, ErrRetVal = undefined>(fn: Fn, errorReturnValue?: ErrRetVal):
  ReturnType<Fn> | ErrRetVal
{
  const originalStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;
  try {
    return fn();
  }
  catch (e) {
    return errorReturnValue as ErrRetVal;
  }
  finally {
    Error.stackTraceLimit = originalStackTraceLimit;
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: String
/* ****************************************************************************************************************** */

/**
 * If value is truthy, returns `value` (or `v` if no `value` provided), otherwise, returns an empty string
 * @param v - Var to check for truthiness
 * @param value - Value to return if true
 */
export function truthyStr(v: any, value?: string): string {
  return v ? ((value !== undefined) ? value : String(v)) : '';
}

/**
 * Join paths with forward separator (ignores falsy) & normalizes (all backslashes to forward slash, no running slashes)
 */
export function normalizeAndJoinPaths(...paths: (string | undefined)[]): string {
  return truthyStr(
    paths.reduce((prev, path, index) =>
        path ? prev!.concat(path, truthyStr(index !== paths.length - 1, '/')) : prev
      , ''))
    .replace(/[\\\/]+/g, '/')   // Replace backslashes to forward slash & remove running-slashes
    .replace(/\/\.\//g, '/')    // Remove /./
    .replace(/\/$/g, '');       // No trailing slash
}

// endregion


/* ****************************************************************************************************************** */
// region: Deep copy / merge
/* ****************************************************************************************************************** */


export { deepMerge, deepCopy }

// endregion
