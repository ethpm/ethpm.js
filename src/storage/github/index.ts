/**
 * @module "ethpm/storage/github"
 */

import * as config from "ethpm/config";
import * as storage from "ethpm/storage";
import * as t from "io-ts";
import { Maybe } from "ethpm/types";
import { URL } from "url";
import { isValidGithubUri } from "./validation";

import request = require("request-promise");
export { isValidGithubUri } from "./validation";

async function makeGithubRequest(blobUri: URL): Promise<string> {
  let response: any = {};
  const options = {
    uri: blobUri,
    json: true,
    headers: { "user-agent": "node.js" }
  };

  await request
    .get(options)
    .then(body => {
      const decoded = new Buffer(body.content, "base64");
      response = decoded.toString("ascii");
    })
    .catch(err => {
      response = err.toString();
    });
  return response;
}

export class GithubService implements storage.Service {
  async read(uri: URL): Promise<Maybe<string>> {
    if (!isValidGithubUri(uri)) {
      throw new TypeError(uri + "is not a valid content addressed Github uri.");
    }
    let base64Contents = await makeGithubRequest(uri);
    return base64Contents;
  }
}
