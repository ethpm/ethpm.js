import { isValidGithubUri } from "ethpm/storage/github";
import { URL } from "url";

const invalidUris = [
  // http is not valid protocol
  "http://api.github.com/repos/ethpm/ethpm-spec/git/blobs/123",
  // www.github.com is not valid hostname
  "https://www.github.com/repos/ethpm/ethpm-spec/git/blobs/123",
  // path doesn't contain 'repos' & 'git' & 'blobs'
  "https://api.github.com/ethpm/ethpm-spec/git/blobs/123",
  "https://api.github.com/repos/ethpm/ethpm-spec/blobs/123",
  "https://api.github.com/repos/ethpm/ethpm-spec/git/123"
];

const validUris = [
  "https://api.github.com/repos/ethpm/ethpm-spec/git/blobs/123",
  "https://api.github.com/repos/other/repository/git/blobs/123"
];

invalidUris.forEach(uri => {
  describe("Github uri validator invalidates", () => {
    it(uri, () => {
      const result = isValidGithubUri(new URL(uri));
      expect(result).toBe(false);
    });
  });
});

validUris.forEach(uri => {
  describe("Github uri validator validates", () => {
    it(uri, () => {
      const result = isValidGithubUri(new URL(uri));
      expect(result).toBe(true);
    });
  });
});
