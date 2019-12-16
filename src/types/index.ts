/**
 * @module "ethpm/types"
 */

export type Maybe<T> = T | undefined;
export function maybe<T>(t: T | undefined): Maybe<T> {
  return (t !== undefined)
    ? t
    : undefined;
}

export function lift<T, U>(func: (t: T) => U) {
  return (t: Maybe<T>) => ((t === undefined)
    ? undefined
    : func(t));
}

export function lift2<T, U, V>(func: (t: T, u: U) => V) {
  return (t: Maybe<T>, u: Maybe<U>) => ((t === undefined || u === undefined)
    ? undefined
    : func(t, u));
}
