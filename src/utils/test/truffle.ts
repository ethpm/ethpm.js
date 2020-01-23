import { v2 } from 'ethpm/manifests/v2';
import { parseTruffleArtifacts } from 'ethpm/utils/truffle';
import { Package } from 'ethpm/package';
const fs = require("fs");

// MetaCoin deployed bytecode in artifact is not accurate, but adjusted for testing multiple linkrefs
describe('handles truffle artifacts', () => {
  it(`for an iterator of artifact files: ctypes & deployments`, async() => {
    const pkgConfig = {'package_name': 'pkg', 'version': '1', 'manifest_version': '2'}
    const iterator = ['ConvertLib', 'MetaCoin', 'Migrations']
    const artifacts = []
    for (let file of iterator) {
      const artifact = JSON.parse(fs.readFileSync(`./src/utils/test/assets/${file}.json`, 'utf8'))
      artifacts.push(artifact)
    }

    const artifactConfig = await parseTruffleArtifacts(artifacts)
    const actualJson = Object.assign(pkgConfig, artifactConfig)

    const pkg: Package = await v2.read(JSON.stringify(actualJson))
    const actualManifest = await v2.write(pkg)
    expect(JSON.parse(actualManifest)).toEqual(actualJson)
    const secondPkg = await v2.read(actualManifest)
    expect(pkg).toEqual(secondPkg)
  })
  
  it(`for an iterator of artifact files: ctypes only`, async() => {
    const pkgConfig = {'package_name': 'pkg', 'version': '1', 'manifest_version': '2'}
    const iterator = ['ConvertLib', 'MetaCoin', 'Migrations']
    const artifacts = []
    for (let file of iterator) {
      const artifact = JSON.parse(fs.readFileSync(`./src/utils/test/assets/${file}.json`, 'utf8'))
      artifact.networks = {}
      artifacts.push(artifact)
    }
    const artifactConfig = await parseTruffleArtifacts(artifacts)
    const actualJson = Object.assign(pkgConfig, artifactConfig)

    const pkg: Package = await v2.read(JSON.stringify(actualJson))
    const actualManifest = await v2.write(pkg)
    expect(JSON.parse(actualManifest)).toEqual(actualJson)
    const secondPkg = await v2.read(actualManifest)
    expect(pkg).toEqual(secondPkg)
  })
});
