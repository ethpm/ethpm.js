import { proxify, p } from "ethpm/session/packages/proxy";

it("proxies atoms", () => {
  const atom = "hello";
  const proxy = proxify(atom);

  expect(proxy[p.itself]).toEqual(atom);
});

it("proxies objects", () => {
  const object = {
    atom: "hello"
  };
  const proxy = proxify(object);
  expect(proxy.atom[p.itself]).toEqual(object.atom);
  expect(proxy.atom['0'][p.itself]).toEqual(object.atom[0]);
});

interface ContainsAtom {
  atom: string
}

it("proxies interfaces", () => {
  const object: ContainsAtom = {
    atom: "hello"
  };
  const proxy = proxify(object);
  expect(proxy.atom[p.itself]).toEqual(object.atom);
  expect(proxy.atom[0][p.itself]).toEqual(object.atom[0]);
});

interface ContainsMaybeAtom {
  atom: string | undefined
}

it("proxies interfaces with possible undefineds", () => {
  const object: ContainsMaybeAtom = {
    atom: "hello"
  };
  const proxy = proxify(object);
  expect(proxy.atom[p.itself]).toEqual(object.atom);
  if (object.atom !== undefined) {
    expect(proxy.atom[0][p.itself]).toEqual(object.atom[0]);
  }
});

it("proxies interfaces with undefned values", () => {
  const object: ContainsMaybeAtom = {
    atom: undefined
  };
  const proxy = proxify(object);
  expect(proxy.atom[p.itself]).toEqual(object.atom);
});

it("proxies partials", () => {
  const object: Partial<ContainsAtom> = {
  };

  const proxy = proxify(object);
  expect(proxy.atom[p.itself]).toEqual(object.atom);
});

it("sets previously undefined values on partials", () => {
  const atom: string = "hello";
  const object: Partial<ContainsAtom> = {
  };

  const proxy = proxify(object);
  proxy.atom[p.itself] = atom;
  expect(proxy.atom[p.itself]).toEqual(atom);

  expect(proxy.atom[0][p.itself]).toEqual("h");
});

it("sets previously undefined values on partials", () => {
  const atom: string = "hello";
  const object: Partial<ContainsAtom> = {
  };

  const proxy = proxify(object);

  expect(proxy.atom[p.itself]).toBeUndefined();
  expect(proxy.atom[0][p.itself]).toBeUndefined();

  // set
  proxy.atom[p.itself] = atom;

  expect(proxy.atom[p.itself]).toEqual(atom);
  expect(proxy.atom[0][p.itself]).toEqual("h");
});
