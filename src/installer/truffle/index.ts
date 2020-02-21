/**
 * @module "ethpm/installer/truffle"
 */

const fs = require('fs-extra')
const tmp = require('tmp')
const path = require('path')
import { IpfsService } from "ethpm/storage/ipfs";
import { Resolver } from "ethpm/package/resolver"
import { URL } from "url";
import * as installer from "ethpm/installer"
import * as config from "ethpm/config"
import * as t from 'io-ts'


interface ObjectLiteral {
  [key: string]: string;
}

interface IpfsOptions {
  host: string;
  port: number | string;
  protocol: string;
}

interface InstallerOptions {
  workingDirectory: string;
  ipfs: IpfsOptions;
}

export class TruffleService implements installer.Service {
  public workingDir: string;
  public ethpmDir: string;
  public lockfilePath: string;
  public resolver: Resolver;
  public ipfsOptions: any;

  constructor(options: InstallerOptions) {
    this.workingDir = options.workingDirectory;
    this.ethpmDir = path.join(this.workingDir, "_ethpm_packages")
    this.lockfilePath = path.join(this.ethpmDir, "ethpm.lock")
    this.ipfsOptions = options.ipfs
    this.resolver =  new Resolver(new IpfsService(this.ipfsOptions))

    // assumes if ethpmDir exists - it is correctly formatted
    if (!fs.existsSync(this.ethpmDir)) {
      fs.mkdirSync(this.ethpmDir)
      fs.writeFileSync(this.lockfilePath, "{}")
    }
  }

  async install(contentURI: URL, registryAddress: string): Promise<void> {
    // create temporary _ethpm_packages/
    const tmpEthpmDir = tmp.dirSync({unsafeCleanup: true});
    fs.copySync(this.ethpmDir, tmpEthpmDir.name)
    const tmpLockfilePath = path.join(tmpEthpmDir.name, "ethpm.lock")
    const pkg = await this.resolver.resolve(contentURI)

    //
    // check for conflicts
    // todo: support aliasing
    const newPackageDir = path.join(tmpEthpmDir.name, pkg.originalPackage.packageName)
    if (fs.existsSync(newPackageDir)) {
      throw new Error("Package: " + pkg.originalPackage.packageName + " already installed.")
      //return false
    } else {
      fs.mkdirSync(newPackageDir)
    }
    const manifestPath = path.join(newPackageDir, "manifest.json")
    fs.writeFileSync(manifestPath, pkg.rawManifest)

    //
    // update ethpm.lock
    //
    const lockfileData = {
      [pkg.originalPackage.packageName]: {
        alias: pkg.originalPackage.packageName,
        install_uri: contentURI.href,
        registry_address: registryAddress,
        resolved_content_hash: contentURI.host,
        resolved_package_name: pkg.originalPackage.packageName,
        resolved_uri: contentURI.href,
        resolved_version: pkg.originalPackage.version
      }
    }
    if(!fs.existsSync(tmpLockfilePath)){
      fs.writeFileSync(tmpLockfilePath, JSON.stringify(lockfileData, null, 4) + "\n")
    } else {
      const existingLockfileData = JSON.parse(fs.readFileSync(tmpLockfilePath))
      const updatedLockfileData = Object.assign(existingLockfileData, lockfileData)
      const ordered: ObjectLiteral = {}
      Object.keys(updatedLockfileData).sort().forEach((key) => {
        ordered[key] = updatedLockfileData[key]
      })
      fs.writeFileSync(tmpLockfilePath, JSON.stringify(ordered, null, 4) + "\n")
    }


    //
    // write sources to tmpEthpmDir
    //
    if (Object.entries(pkg.sources).length !== 0) {
      const sourcesDir = path.join(newPackageDir, "_src")
      fs.mkdirSync(sourcesDir)
      Object.entries(pkg.sources).forEach(([pth, src], idx) => {
        const targetPath = path.join(sourcesDir, path.normalize(pth))
        const targetDir = path.parse(targetPath).dir
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, {recursive: true})
        }
        fs.writeFileSync(targetPath, src)
      })
    }

    //
    // write build dependencies to tmpEthpmDir
    //
    if (Object.entries(pkg.buildDependencies).length !== 0) {
      let buildDependenciesInstaller = new TruffleService({workingDirectory: newPackageDir, ipfs: this.ipfsOptions})
      for (const [name, contentURI] of Object.entries(pkg.originalPackage.buildDependencies)) {
        await buildDependenciesInstaller.install(contentURI, registryAddress)
      }
    }

    //
    // copy tmpEthpmDir to disk
    //
    fs.copySync(tmpEthpmDir.name, this.ethpmDir)
    tmpEthpmDir.removeCallback()
  }
}


export default class TruffleConnector extends config.Connector<installer.Service> {
  optionsType = t.interface({
    workingDirectory: t.string,
    ipfs: t.interface({
      host: t.string,
      port: t.union([t.number, t.string]),
      protocol: t.string,
    })
  });
  
  async init(options: InstallerOptions): Promise<installer.Service> {
    const service = new TruffleService(options);
    return service;
  }
}
