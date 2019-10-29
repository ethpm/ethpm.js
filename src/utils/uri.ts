/**
 * @module "ethpm/utils/uri"
 */

import { URL } from "url";

function parseScheme(url: URL) {
  const scheme = url.protocol.replace(/:+$/, "")
  if(scheme != 'erc1319'){
	throw new Error(
	  `Invalid scheme: ${scheme} found on uri: ${url}. Expected scheme to match "erc1319".`
	)
  } else {
	return scheme
  }
}

function parseChainId(url: URL) {
  // todo: support multiple chain ids
  const chainId = +url.port;
  if(chainId != 1){
	throw new Error(
	  `Invalid chain ID: ${chainId}. Currently only mainnet is supported.`
	)
  } else {
	return chainId
  }
}

function parsePackageId(url: URL) {
  if(url.pathname.replace('/','') != ''){
	const pathElements = url.pathname.split('/').filter(function (el) {return el != ''})
	const packageId = pathElements[0].split('@').filter(function (el) {return el != ''})

	if(packageId.length != 2){
	  throw new Error(
		`Invalid package ID: ${packageId}. URI must include both a package name and version.`
	  )
	} else {
	  return packageId
	}
  } else {
	return ['', '']
  }
}

// scheme://address:chainId/packageName@version
// i.e. 
// erc1319://snakecharmers.eth:1/dai@1.0.0
export class Erc1319URI {
  scheme: string;
  address: string;
  chainId: number;
  packageName: string;
  version: string;

  constructor (uri: any) {
	const parsedUri = new URL(uri);
	this.scheme = parseScheme(parsedUri)
	this.chainId = parseChainId(parsedUri)
	this.address = parsedUri.hostname  // address or ensName
	const packageId = parsePackageId(parsedUri)
	this.packageName = packageId[0]
	this.version = packageId[1]
  }
}
