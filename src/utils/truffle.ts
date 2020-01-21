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
      if storedRef.name === contractName) {
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

async function parseTruffleArtifactToContractType(json) {
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

export { parseTruffleArtifactToContractType };
