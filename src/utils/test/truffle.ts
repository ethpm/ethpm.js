import { v3 } from 'ethpm/manifests/v3';
import { parseTruffleArtifacts } from 'ethpm/utils/truffle';
import { Package } from 'ethpm/package';
const fs = require("fs");


// MetaCoin deployed bytecode in artifact is not accurate, but adjusted for testing multiple linkrefs
describe('handles truffle artifacts', () => {
  it(`for an iterator of artifact files: ctypes & deployments`, async() => {
    const pkgConfig = {'name': 'pkg', 'version': '1', 'manifest': 'ethpm/3'}
    const iterator = ['ConvertLib', 'MetaCoin', 'Migrations']
    const artifacts = []
    for (const file of iterator) {
      const artifact = JSON.parse(fs.readFileSync(`./src/utils/test/assets/${file}.json`, 'utf8'))
      artifacts.push(artifact)
    }

    const artifactConfig = await parseTruffleArtifacts(artifacts)
    const actualJson = Object.assign(pkgConfig, artifactConfig)

    const pkg: Package = await v3.read(JSON.stringify(actualJson))
    const actualManifest = await v3.write(pkg)
    expect(JSON.parse(actualManifest)).toEqual(actualJson)
    const secondPkg = await v3.read(actualManifest)
    expect(pkg).toEqual(secondPkg)
    const expectedPackageWithCompilers = JSON.parse(fs.readFileSync("./src/utils/test/assets/pkgWithCompilers.json", "utf8"))
    expect(JSON.parse(actualManifest)).toEqual(expectedPackageWithCompilers)
  })
  
  it(`for an iterator of artifact files: ctypes only`, async() => {
    const pkgConfig = {'name': 'pkg', 'version': '1', 'manifest': 'ethpm/3'}
    const iterator = ['ConvertLib', 'MetaCoin', 'Migrations']
    const artifacts = []
    for (const file of iterator) {
      const artifact = JSON.parse(fs.readFileSync(`./src/utils/test/assets/${file}.json`, 'utf8'))
      artifact.networks = {}
      artifacts.push(artifact)
    }
    const artifactConfig = await parseTruffleArtifacts(artifacts)
    const actualJson = Object.assign(pkgConfig, artifactConfig)

    const pkg: Package = await v3.read(JSON.stringify(actualJson))
    const actualManifest = await v3.write(pkg)
    expect(JSON.parse(actualManifest)).toEqual(actualJson)
    const secondPkg = await v3.read(actualManifest)
    expect(pkg).toEqual(secondPkg)
  })


  it('for artifacts that are installed via ethpm, w/o all default fields', async() => {
    const artifact = JSON.parse(fs.readFileSync(`./src/utils/test/assets/Minimal.json`, 'utf8'))
    const artifactConfig = await parseTruffleArtifacts([artifact])
    expect(artifactConfig).toEqual({"contractTypes": {"ConvertLib": { "abi": artifact.abi}}})
  });
});
