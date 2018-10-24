export namespace p {
  export const itself = Symbol("itself");
  export const parent = Symbol("parent");
  export const prop = Symbol("prop");
}

type Wrapper<T> = {
  [p.itself]: T;
}

type StringIndexed<T> = {
  [K in number | string]:
    string extends K
      ? (T extends StringIndex<infer S>
        ? (T extends NumberIndex<infer N>
          ? N | S
          : S)
        : (T extends NumberIndex<infer N>
          ? N
          : never))
      : never
}

type StringIndex<T> = {
  [key: string]: T
}

type NumberIndex<T> = {
  [index: number]: T
}

class Undefined { }

type Objected<T> =
  T extends string ? String :
  T extends number ? Number :
  T extends boolean ? Boolean :
  T extends undefined ? Undefined :
  T;

function objectize<T> (t: T): Objected<T> {
  if (typeof t === "string") {
    return new String(t) as Objected<T>;
  } else if (typeof t === "number") {
    return new Number(t) as Objected<T>;
  } else if (typeof t === "boolean") {
    return new Boolean(t) as Objected<T>
  } else if (typeof t === "undefined") {
    return new Undefined() as Objected<T>;
  } else {
    return t as Objected<T>;
  }
}

export type Wrapped<T> = {
  [K in keyof StringIndexed<Objected<T>>]:
    StringIndexed<Objected<T>>[K] extends never
      ? never
      : Wrapped<StringIndexed<Objected<T>>[K]>
} & Wrapper<T>;

const stringIndex = <T> (t: Objected<T>): StringIndexed<Objected<T>> => {
  return Object.create(Object.getPrototypeOf(t));
}

function wrap<T> (t: T): Wrapped<T> {
  const object = objectize(t);
  return Object.assign(
    stringIndex(object),

    { [p.itself]: t },

    ...Object.entries(object)
      .map( ([k, v]) => ({ [k.toString()]: v }) ),
  );
}

const unwrap = <T> (u: Wrapped<T>): T => u[p.itself];

interface ProxifyOptions<T, P> {
  from?: {
    parent: Wrapped<P>;
    prop: string | number | symbol
  }
}

function proxify_ <T, P> (
  t: T,
  options: ProxifyOptions<T, P>
):
  Wrapped<T>
{
  const descriptors = {
    get: (target: Wrapped<T>, prop: string | number | symbol) => {
      const from = options.from;

      if (prop === p.itself) {
        return unwrap(target);
      }

      if (prop === p.parent) {
        return from && from.parent || undefined;
      }

      if (prop === p.prop) {
        return from && from.prop || undefined;
      }

      const got =
        (Reflect.has(target, prop)) ?
          Reflect.get(target, prop) :

        (Reflect.has(target, prop.toString())) ?
          Reflect.get(target, prop.toString()) :

        undefined;

      return proxify_(got, { from: { parent: target, prop } });
    },
    set: (target: Wrapped<T>, prop: string | symbol, value: any, receiver: any) => {
      if (prop === p.itself) {
        const parent = Reflect.get(receiver, p.parent);
        const step = Reflect.get(receiver, p.prop);
        return Reflect.set(parent, step, value);
      }

      return false;

    }
  };

  return new Proxy(wrap(t), descriptors);
}

export function proxify <T> (t: T): Wrapped<T> {
  return proxify_(t, {});
}
