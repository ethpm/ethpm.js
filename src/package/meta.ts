export type Author = string;
export type License = string;
export type Description = string;
export type Keyword = string;
export interface Link {
  resource: string,
  uri: string
}

export interface PackageMeta {
  authors?: Array<Author>,
  license?: License,
  description?: Description,
  keywords?: Array<Keyword>,
  links?: Array<Link>
}
