import { URL } from "url";
import * as t from "io-ts";
import * as storage from "ethpm/storage";
import StubConnector from "./service";
import examples from "test/examples/manifests";

export class ExamplesConnector extends StubConnector {
  static connect(options: t.mixed): Promise<storage.Service> {
    return super.connect({
      contents: Object.values(examples)
    });
  }
}

const singletonPromise: Promise<storage.Service> = ExamplesConnector.connect({});

const exampleStorage = {
  read: async (uri: URL) => {
    const service = await singletonPromise;
    return await service.read(uri);
  },
}

export default exampleStorage;
