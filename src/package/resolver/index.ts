/**
 * @module "ethpm/package/resolver"
 */

import { IpfsService } from 'ethpm/storage/ipfs';
import { v2 } from 'ethpm/manifests/v2';
import { Package, Sources } from 'ethpm/package';
import { URL } from 'url';

interface ResolvedBuildDependencies {
  [key: string]: ResolvedPackage;
}

export class Resolver {
  public ipfsBackend: IpfsService

  constructor(ipfsService: IpfsService) {
    this.ipfsBackend = ipfsService
  }

  async resolve(contentURI: URL) {
    const rawManifest = await this.ipfsBackend.read(contentURI)
    if (!rawManifest) {
      throw new Error("Manifest at " + contentURI + " not found.")
    }
    const originalPackage = await v2.read(rawManifest)
    let sources: Sources = {}
    let buildDependencies: ResolvedBuildDependencies = {}
    
    // resolve any content-addressed sources
    if (originalPackage.sources) {
      for (const key in originalPackage.sources) {
        if (originalPackage.sources[key] instanceof URL) {
          const source = await this.ipfsBackend.read(originalPackage.sources[key] as URL)
          if (source) {
            sources[key] = source
          } else {
            throw new Error("No source found at " + originalPackage.sources[key])
          }
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
}

export class ResolvedPackage {
  public contentURI: URL
  public originalPackage: Package
  public buildDependencies: ResolvedBuildDependencies
  public rawManifest: string
  public sources: Sources

  constructor(
    rawManifest: string,
    contentURI: URL,
    originalPackage: Package,
    buildDependencies: ResolvedBuildDependencies,
    sources: Sources
  ) {
    this.rawManifest = rawManifest
    this.buildDependencies = buildDependencies
    this.contentURI = contentURI
    this.originalPackage = originalPackage
    this.sources = sources
  }
}
