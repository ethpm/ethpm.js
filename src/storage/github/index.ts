/**
 * @module "ethpm/storage/github"
 */

import * as config from "ethpm/config";
import * as storage from "ethpm/storage";

export class GithubService implements storage.Service {
  async read(uri: URL): Promise<Maybe<string>> {
    
	// validate uri
    // fetch contents 
    // validate fetched contents
  }
}

export default class GithubConnector extends config.Connector<storage.Service> {
  /**
   * Construct GithubService and load with specified contents
   */
	async init(): Promise<GithubService> {
	  const service = new GithubService();
	  return service;
	}
}
