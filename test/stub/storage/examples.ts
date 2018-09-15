/**
 * @module "test/stub/storage"
 */

import { URL } from "url";
import * as t from "io-ts";
import * as storage from "ethpm/storage";
import StubConnector from "./service";
import examples from "test/examples/manifests";

export default class ExamplesConnector extends StubConnector {
  async connect(options: t.mixed): Promise<storage.Service> {
    return super.connect({
      contents: Object.values(examples)
    });
  }
}

const singletonPromise: Promise<storage.Service> =
  new ExamplesConnector().connect({});

export const exampleStorage = {
  write: async (content: string) => {
    const service = await singletonPromise;
    return await service.write(content);
  },

  read: async (uri: URL) => {
    const service = await singletonPromise;
    return await service.read(uri);
  },

  hash: async (content: string) => {
    const service = await singletonPromise;
    return await service.hash(content);
  },

  predictUri: async (content: string) => {
    const service = await singletonPromise;
    return await service.predictUri(content);
  }
}
