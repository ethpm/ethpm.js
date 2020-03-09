import { Address, ChainURI, TransactionHash, ABI, Compiler } from 'ethpm/package';


interface DeploymentData {
  contract_type: string,
  address: Address,
  transaction: TransactionHash,
}

interface Network {
  address: Address,
  transactionHash: TransactionHash,
}

interface Artifact {
  abi: ABI,
  bytecode: any,
  deployedBytecode: any,
  contractName: string,
  compiler: Compiler,
  devdoc: any,
  userdoc: any,
  metadata: string,
  networks: Record<string, Network>,
}


function parseBytecode(bytecode: string) {
  // detect link references in bytecode
  if (!bytecode.includes("_")) {
    return {
      bytecode: bytecode,
    }
  }

  // todo: hard coded length...
  // todo: support link dependencies
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
    link_references: link_refs,
  }
}

function parseTruffleArtifactsToContractTypes(artifacts: Array<Artifact>) {
  const contractTypes: Record<string, any> = {}
  for (let artifact of artifacts) {
    let metadata;
    if (artifact.metadata !== undefined) {
      metadata = JSON.parse(artifact.metadata);
    }
    const config = {
      ...(artifact.abi) && {abi: artifact.abi},
      ...(artifact.compiler) && {
        compiler: {
          ...(artifact.compiler.name) && {name: artifact.compiler.name},
          ...(artifact.compiler.version) && {version: artifact.compiler.version},
          ...(metadata && metadata.settings && metadata.settings.optimizer) && {
            settings: {
              optimize: metadata.settings.optimizer.enabled
            }
          }
        }
      },
      // todo: no contract_name since truffle doesn't support aliasing
      ...(artifact.bytecode) && {runtime_bytecode: parseBytecode(artifact.bytecode)},
      ...(artifact.deployedBytecode) && {deployment_bytecode: parseBytecode(artifact.deployedBytecode)},
      ...(artifact.devdoc || artifact.userdoc) && {natspec: Object.assign(artifact.devdoc, artifact.userdoc)},
    }
    contractTypes[artifact.contractName] = config
  }
  return contractTypes
}

function parseTruffleArtifactsToDeployments(artifacts: Array<Artifact>) {
  const allDeployments: Record<string, Record<string, DeploymentData>> = {}
  for (let artifact of artifacts) {
    for (let [blockchainUri, deploymentData] of Object.entries(artifact.networks)) {
      let currentUri = blockchainUri
      const ethpmDeploymentData = {
        contract_type: artifact.contractName,
        address: deploymentData.address,
        transaction: deploymentData.transactionHash
      }
      for (let storedUri of Object.keys(allDeployments)) {
        // todo: validate latest block hash is used - needs w3
        if (storedUri.startsWith(currentUri.split("/block/")[0])) {
          currentUri = storedUri
        }
      }
      if (allDeployments[currentUri] !== undefined) {
        allDeployments[currentUri][artifact.contractName] = ethpmDeploymentData
      } else {
        allDeployments[currentUri] = {[artifact.contractName]: ethpmDeploymentData}
      }
    }
  }
  return allDeployments
}

function parseTruffleArtifacts(artifacts: Array<Artifact>) {
  const composedArtifacts: any = {}
  composedArtifacts.contract_types = parseTruffleArtifactsToContractTypes(artifacts)
  const deployments = parseTruffleArtifactsToDeployments(artifacts)
  if (Object.entries(deployments).length !== 0) {
    composedArtifacts.deployments = deployments
  }
  return composedArtifacts
}

export { parseTruffleArtifacts };
