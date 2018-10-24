import { unpartial } from "ethpm/session/packages/unpartial";

interface ContainsAtom {
  atom: string
}

it("removes wrapping Partial for complete objects", () => {
  const partial: Partial<ContainsAtom> = {};

  partial.atom = "hello";

  const complete: ContainsAtom = unpartial(partial, {atom: ""});

  if (complete !== undefined) {
    expect(complete.atom).toEqual(partial.atom);
  }
});

it("raises exception for incomplete objects", () => {
  const partial: Partial<ContainsAtom> = {};

  expect(() => {
    const complete: ContainsAtom =
      unpartial(partial, {atom: ""});
  }).toThrowError(/atom/);
});
