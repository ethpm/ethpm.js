/**
 * @module "ethpm/utils/uri"
 */

import { URL } from 'url';

// scheme://address:chainId/packageName@version
// i.e.
// erc1319://snakecharmers.eth:1/dai@1.0.0
export class EthpmURI {
  raw: string;
  scheme: string;
  address: string;
  chainId: number;
  packageName: string;
  version: string;
  namespacedAsset: string;

  constructor(uri: string) {
    const parsedURI = new URL(uri);
    this.raw = uri;
    this.scheme = EthpmURI.parseScheme(parsedURI);
    this.chainId = EthpmURI.parseChainId(parsedURI);
    this.address = parsedURI.hostname; // address or ensName
    [this.packageName, this.version, this.namespacedAsset] = EthpmURI.parsePackageId(parsedURI);
  }

  static parsePackageId(url: URL) {
    if (url.pathname.replace('/', '') !== '') {
      const pathElements = url.pathname.split('/').filter((el) => el !== '');
      const packageId = pathElements[0].split('@').filter((el) => el !== '');

      if (packageId.length !== 2) {
        throw new Error(
          `Invalid package ID: ${packageId}. URI must include both a package name and version.`,
        );
      } else {
        let [packageName, version] = packageId
        let namespacedAsset = pathElements.splice(1).join("/")
        return [packageName, version, namespacedAsset];
      }
    } else {
      return ['', '', ''];
    }
  }

  static parseChainId(url: URL) {
    // todo: support multiple chain ids
    const chainId = +url.port;
    if (chainId === 1 || chainId === 0) {
      return 1;
    } else {
      throw new Error(
        `Invalid chain ID: ${chainId}. Currently only mainnet is supported.`,
      );
    }
  }

  static parseScheme(url: URL) {
    const scheme = url.protocol.replace(/:+$/, '');
    if (scheme !== 'erc1319' && scheme !== 'ethpm') {
      throw new Error(
        `Invalid scheme: ${scheme} found on uri: ${url}. Expected scheme to match "ethpm" or "erc1319".`,
      );
    } else {
      return scheme;
    }
  }
}
