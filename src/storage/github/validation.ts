/**
 * @module "ethpm/storage/github/validation"
 */

import { URL } from "url";

/**
 * Returns a bool indicating whether the given uri conforms to this scheme.
 * https://api.github.com/repos/:owner/:repo/git/blobs/:file_sha
 */
export function isValidGithubUri(uri: URL): boolean {
  if (uri.hostname != "api.github.com") {
    return false;
  }
  if (uri.protocol != "https:") {
    return false;
  }
  if (
    !uri.pathname.includes("/repos/") ||
    !uri.pathname.includes("/git/") ||
    !uri.pathname.includes("/blobs/")
  ) {
    return false;
  }
  return true;
}
