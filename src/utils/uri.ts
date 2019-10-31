/**
 * @module "ethpm/utils/uri"
 */

import { URL } from "url";

// scheme://address:chainId/packageName@version
// i.e. 
// erc1319://snakecharmers.eth:1/dai@1.0.0
export class Erc1319URI {
  scheme: string;
  address: string;
  chainId: number;
  packageName: string;
  version: string;

  constructor (uri: string | URL ) {
	const parsedUri = typeof uri === "string" ? new URL(uri) : uri
	this.scheme = Erc1319URI.parseScheme(parsedUri)
	this.chainId = Erc1319URI.parseChainId(parsedUri)
	this.address = parsedUri.hostname  // address or ensName
	const packageId = Erc1319URI.parsePackageId(parsedUri)
	this.packageName = packageId[0]
	this.version = packageId[1]
  }

  static parsePackageId(url: URL) {
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

  static parseChainId(url: URL) {
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
  
  static parseScheme(url: URL) {
	const scheme = url.protocol.replace(/:+$/, "")
	if(scheme != 'erc1319'){
	  throw new Error(
		`Invalid scheme: ${scheme} found on uri: ${url}. Expected scheme to match "erc1319".`
	  )
	} else {
	  return scheme
	}
  }
}
