import Web3 from 'web3'
import { URL } from 'url'
import { compareSync, Options, fileCompareHandlers } from "dir-compare"
const { EthPM } = require("ethpm")
var tmp = require('tmp')
const fs = require('fs')
const path = require('path')

describe('the installer', () => {
  let workingDirectory: any
  let ethpm: any
  let provider: any

  beforeEach(async () => {
    jest.setTimeout(30000);
    workingDirectory = tmp.dirSync();
    provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/7707850c2fb7465ebe6f150d67182e22');
    ethpm = await EthPM.configure({
      registries: "ethpm/registries/web3",
      installer: "ethpm/installer/truffle",
      storage: "ethpm/storage/ipfs"
    }).connect({
      provider,
      registryAddress: '0x808B53bF4D70A24bA5cb720D37A4835621A9df00',
      workingDirectory: workingDirectory.name,
      ipfs: {
        host: "ipfs.infura.io",
        port: "5001",
        protocol: "https"
      }
    })
  })

  afterEach(async () => {
    workingDirectory.removeCallback()
  })

  it('initializes an ethpmDir', async() => {
    const pkgsDir = workingDirectory.name + "/_ethpm_packages"
    expect(ethpm.installer.workingDir).toEqual(workingDirectory.name)
    expect(fs.existsSync(pkgsDir))
  })

  it('installs a uri', async() => {
    const contentUri = await ethpm.registries.package('ens').release('1.0.0')
    await ethpm.installer.install(contentUri, ethpm.registries.address)
    const options: Partial<Options> = {compareSize: true, compareContent: true, noDiffSet: true};
    const result = compareSync(ethpm.installer.ethpmDir, './src/installer/test/assets/single', options)
    expect(result.same).toEqual(true)
  })

  it('raises an exception if installing an existing package', async() => {
    const contentUri = await ethpm.registries.package('ens').release('1.0.0')
    await ethpm.installer.install(contentUri, ethpm.registries.address)
    try{
      await ethpm.installer.install(contentUri, ethpm.registries.address)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe("Package: ens already installed.")
    }
  })

  it('installs multiple uris to same ethpmDir', async() => {
    const ensURI = await ethpm.registries.package('ens').release('1.0.0')
    const ethRegistrarURI = await ethpm.registries.package('ethregistrar').release('1.0.0')
    const resolversURI = await ethpm.registries.package('resolvers').release('1.0.0')
    await ethpm.installer.install(ensURI, ethpm.registries.address)
    await ethpm.installer.install(resolversURI, ethpm.registries.address)
    await ethpm.installer.install(ethRegistrarURI, ethpm.registries.address)
    const options: Partial<Options> = {compareSize: true, compareContent: true, noDiffSet: true};
    const result = compareSync(ethpm.installer.ethpmDir, './src/installer/test/assets/multiple', options)
    expect(result.same).toEqual(true)
  })

  it('installs a uri with build dependencies and with content addressed sources', async() => {
    await ethpm.installer.install(new URL('ipfs://Qmd4xvKG8cKFDMCYdzgbGN5rf98VfP4bYwqArPQ7mdyEwf'), ethpm.registries.address)
    const options: Partial<Options> = {compareSize: true, compareContent: true, noDiffSet: true};
    const result = compareSync(ethpm.installer.ethpmDir, './src/installer/test/assets/dependencies', options)
    expect(result.same).toEqual(true)
  })
})
