/**
 * @module "ethpm/package/resolver"
 */

import { IpfsService } from 'ethpm/storage/ipfs';
import { v3 } from 'ethpm/manifests/v3';
import { Package, Sources, SourceWithContent, SourceWithUrls } from 'ethpm/package';
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
    const originalPackage = await v3.read(rawManifest)
    let sources: Sources = {}
    let buildDependencies: ResolvedBuildDependencies = {}
    
    // resolve any content-addressed sources
    if (originalPackage.sources) {
      for (const sourceId in originalPackage.sources) {
        if (originalPackage.sources[sourceId].hasOwnProperty('urls')) {
          const sourceObject = originalPackage.sources[sourceId] as SourceWithUrls
          const source = await this.ipfsBackend.read(sourceObject['urls'][0] as URL)
          if (source) {
            sources[sourceId] = {
              content: source,
              type: "solidity", // should be optional
              installPath: sourceId // should be optional
            }
          } else {
            throw new Error("No source found at " + originalPackage.sources[sourceId])
          }
        } else {
          const sourceObject = originalPackage.sources[sourceId] as SourceWithContent
          sources[sourceId] = {
            content: sourceObject['content'],
            type: "solidity",  // should be optional
            installPath: sourceId  // should be optional
          }
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
