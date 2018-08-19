export type Maybe<T> = T | undefined;
export function maybe<T> (t: T | undefined): Maybe<T> {
  return (t !== undefined)
    ? t
    : undefined;
}

export function lift<T, U> (func: (t: T) => U) {
  return (t: Maybe<T>) =>
    (t === undefined)
      ? undefined
      : func(t);
}

