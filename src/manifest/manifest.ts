import { Package } from "ethpm/package";

export type ManifestReader = (json: string) => Package;

// export type Transform<T, U> = (T) => U;

// export type TransformMap<T, U> = {
//   [u in keyof U]: Transform<T[Transform<keyof T, u>], U[u]>
// }
