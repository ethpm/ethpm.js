/**
 * @module "test/stub/manifest/examples"
 */

import * as t from "io-ts";
import * as manifest from "ethpm/manifest";
import StubConnector from "./service";
import packages from "test/examples/packages";

export default class ExamplesConnector extends StubConnector {
  async connect(options: t.mixed): Promise<manifest.Service> {
    return super.connect({
      packages: Object.values(packages)
    });
  }
}
