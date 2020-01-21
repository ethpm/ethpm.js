function parseBytecode(bytecode) {
  if (!bytecode.includes("_")) {
    return {
      bytecode: bytecode
    }
  }

  // hard coded length? // name > 20?
  let link_refs = []
  while (bytecode.indexOf("_") > 0) {
    const index = bytecode.indexOf("_")
    const placeholder = bytecode.substring(index, index+40)
    const contractName = placeholder.replace(/_/g, "")
    let alreadyStored = false
    for (const storedRef of link_refs) {
      if (storedRef.name === contractName) {
        storedRef.offsets.push(index)
        alreadyStored = true
      }
    }
    if (!alreadyStored) {
      const link_ref = {
        name: contractName,
        length: 20,
        offsets: [index]
      }
      link_refs.push(link_ref)
    }
    alreadyStored = false
    bytecode = bytecode.substr(0, index) + "0000000000000000000000000000000000000000" + bytecode.substr(index + 40, bytecode.length)
  }
  return {
    bytecode: bytecode,
    linkReferences: link_refs
  }
}

function parseTruffleArtifactToContractType(json) {
  const metadata = JSON.parse(json.metadata)
  const config = {
    abi: json.abi,
    compiler: {
      name: json.compiler.name,
      version: json.compiler.version,
      settings: {
        optimize: metadata.settings.optimizer.enabled
      }
    },
    contract_name: json.contractName,
    runtimeBytecode: parseBytecode(json.bytecode),
    deploymentBytecode: parseBytecode(json.deployedBytecode),
    natspec: Object.assign(json.devdoc, json.userdoc),
  }
  return config
}

function parseTruffleArtifactsToDeployments(artifacts) {
  const allDeployments = {}
  for (let artifact of artifacts) {
    for (let [blockchainUri, deploymentData] of Object.entries(artifact.networks)) {
      let currentUri = blockchainUri
      const ethpmDeploymentData = {
        contractType: artifact.contractName,
        address: deploymentData.address,
        transaction: deploymentData.transactionHash
      }
      for (let storedUri of Object.keys(allDeployments)) {
        if (storedUri.startsWith(blockchainUri.split("/block/")[0])) {
          // validate latest block hash is used - needs w3
          currentUri = storedUri
        }
      }
      if (allDeployments[currentUri] === undefined) {
        // allow aliasing? - probably not - kiss
        allDeployments[currentUri] = {
          [artifact.contractName]: ethpmDeploymentData
        }
      } else {
        allDeployments[currentUri][artifact.contractName] = ethpmDeploymentData
      }
    }
  }
  return allDeployments
}

function parseTruffleArtifacts(artifacts) {
  const contractTypes = {}
  for (let artifact of artifacts) {
    const contractType = parseTruffleArtifactToContractType(artifact)
    contractTypes[artifact.contractName] = contractType
  }
  // if no deployments - pass
  const deployments = parseTruffleArtifactsToDeployments(artifacts)
  return {
    contract_types: contractTypes,
    deployments: deployments,
  }
}

export { parseTruffleArtifacts };
