import { GithubService } from "ethpm/storage/github";
import { URL } from "url";
import examples from "test/examples/manifests";

describe("Github service returns URI contents", () => {
  it("with valid blob URI", async () => {
    const ownedBlobUri = new URL(
      "https://api.github.com/repos/ethpm/ethpm-spec/git/blobs/8f9dc767d4c8b31fec4a08d9c0858d4f37b83180"
    );
    const service = new GithubService();
    const actualContents = await service.read(ownedBlobUri);
    expect(actualContents).toBe(examples.owned);
  });
});
