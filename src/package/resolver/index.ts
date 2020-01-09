/**
 * @module "ethpm/package/resolver"
 */

import { IpfsService } from 'ethpm/storage/ipfs';
import { v2 } from 'ethpm/manifests/v2';
import { Package } from 'ethpm/package';
import { URL } from 'url';


export class Resolver {
  public ipfsBackend: IpfsService

  constructor(ipfsService: IpfsService) {
    this.ipfsBackend = ipfsService
  }

  async resolve(contentURI: URL) {
    const rawManifest = await this.ipfsBackend.read(contentURI)
    const originalPackage = await v2.read(rawManifest)
    let sources = {}
    let buildDependencies = {}
    
    // resolve any content-addressed sources
    if (originalPackage.sources) {
      for (const key in originalPackage.sources) {
        if (Resolver.isValidUrl(originalPackage.sources[key])) {
          sources[key] = await this.ipfsBackend.read(originalPackage.sources[key])
        } else {
          sources[key] = originalPackage.sources[key]
        }
      }
    }

    // resolve any build dependencies
    if (originalPackage.buildDependencies) {
      for (const key in originalPackage.buildDependencies) {
        const url = originalPackage.buildDependencies[key]
        const pkg = await this.resolve(url)
        buildDependencies[key] = pkg
      }
    }
    return new ResolvedPackage(rawManifest, contentURI, originalPackage, buildDependencies, sources)
  }

  static isValidUrl(value: string) {
    try {
      new URL(value);
      return true;
    } catch (_) {
      return false;  
    }
  }
}

export class ResolvedPackage {
  public contentURI: URL
  public originalPackage: Package
  public buildDependencies: object
  public rawManifest: object
  public sources: object

  constructor(
    rawManifest: object,
    contentURI: URL,
    originalPackage: Package,
    buildDependencies: object,
    sources: object
  ) {
    this.rawManifest = rawManifest
    this.buildDependencies = buildDependencies
    this.contentURI = contentURI
    this.originalPackage = originalPackage
    this.sources = sources
  }
}
