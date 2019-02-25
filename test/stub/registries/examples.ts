/**
 * @module "test/stub/registries"
 */

import { URL } from "url";
import * as t from "io-ts";
import * as registries from "ethpm/registries";
import { StubService as StorageService } from "test/stub/storage";

import StubConnector from "./service";
import manifests from "test/examples/manifests";
import packages from "test/examples/packages";

export default class ExamplesConnector extends StubConnector {
  async connect(options: t.mixed): Promise<registries.Service> {
    const storage = new StorageService();

    return super.connect({
      releases: await Promise.all(
        Object.entries(manifests).map(
          async ([packageName, manifest]) => ({
            package: packages[packageName],
            manifestUri: (await storage.predictUri(manifest)).href
          })
        )
      )
    });
  }
}
