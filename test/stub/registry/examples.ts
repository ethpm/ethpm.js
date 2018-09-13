/**
 * @module "test/stub/registry"
 */

import { URL } from "url";
import * as t from "io-ts";
import * as registry from "ethpm/registry";
import { StubService as StorageService } from "test/stub/storage";

import StubConnector from "./service";
import manifests from "test/examples/manifests";
import packages from "test/examples/packages";

export default class ExamplesConnector extends StubConnector {
  async connect(options: t.mixed): Promise<registry.Service> {
    const storage = new StorageService();

    return super.connect({
      releases: await Promise.all(
        Object.entries(manifests).map(
          async ([packageName, manifest]) => ({
            package: packages[packageName],
            manifest: await storage.predictUri(manifest)
          })
        )
      )
    });
  }
}
