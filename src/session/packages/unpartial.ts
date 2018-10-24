export type Unpartial<T> = T extends Partial<infer S> ? S : never;

export function unpartial <S> (partial: Partial<S>, template: S): S {
  const properties = new Set(Object.keys(partial));

  const diff = Object.keys(template).filter(
    expected => !properties.has(expected)
  );

  if (diff.length > 0) {
    throw new Error(
      `Cannot convert to underlying type, ` +
        `missing properties ${[...diff].join(", ")}`
    );
  }

  return Object.assign({}, ...Object.entries(partial).map( ([k, v]) => ({
    [k]: v
  })));
}
