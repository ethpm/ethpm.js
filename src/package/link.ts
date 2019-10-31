/**
 * @module "ethpm/package"
 */


export namespace Link {
  export type Offset = number;
  export type Length = number;

  export type Name = string;

  export interface Literal {
    type: 'literal',
    value: string
  }

  export interface InstanceReference {
    type: 'reference',
    value: string
  }

  export interface Reference {
    offsets: Array<Offset>,
    length: Length,
    name: Name,
  }

  export interface Value {
    offsets: Array<Offset>,
    value: Literal | InstanceReference
  }
}
