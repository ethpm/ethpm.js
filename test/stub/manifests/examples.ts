/**
 * @module "test/stub/manifests"
 */

import * as t from "io-ts";
import * as manifests from "ethpm/manifests";
import StubConnector from "./service";
import packages from "test/examples/packages";

export default class ExamplesConnector extends StubConnector {
  async connect(options: t.mixed): Promise<manifests.Service> {
    return super.connect({
      packages: Object.values(packages)
    });
  }
}
