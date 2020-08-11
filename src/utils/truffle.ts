import { Address, ChainURI, ContractInstance, TransactionHash, ABI, Compiler } from 'ethpm/package';
import isEqual from 'lodash.isequal';


interface Network {
  address: Address;
  transactionHash: TransactionHash;
}

interface Artifact {
  abi: ABI;
  bytecode: any;
  deployedBytecode: any;
  contractName: string;
  compiler: Compiler;
  devdoc: any;
  userdoc: any;
  metadata: string;
  networks: Record<string, Network>;
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
  const linkRefs = []
  while (bytecode.indexOf("_") > 0) {
    const index = bytecode.indexOf("_")
    const placeholder = bytecode.substring(index, index+40)
    const contractName = placeholder.replace(/_/g, "")
    let alreadyStored = false
    for (const storedRef of linkRefs) {
      if (storedRef.name === contractName) {
        storedRef.offsets.push(index)
        alreadyStored = true
      }
    }
    if (!alreadyStored) {
      const linkRef = {
        name: contractName,
        length: 20,
        offsets: [index]
      }
      linkRefs.push(linkRef)
    }
    alreadyStored = false
    bytecode = bytecode.substr(0, index) + "0000000000000000000000000000000000000000" + bytecode.substr(index + 40, bytecode.length)
  }
  return {
    bytecode: bytecode,
    linkReferences: linkRefs,
  }
}

function parseTruffleArtifactsToContractTypes(artifacts: Array<Artifact>) {
  const contractTypes: Record<string, any> = {}
  for (const artifact of artifacts) {
    const config = {
      ...(artifact.abi) && {abi: artifact.abi},
      // todo: no contractName since truffle doesn't support aliasing
      ...(artifact.bytecode) && {runtimeBytecode: parseBytecode(artifact.bytecode)},
      ...(artifact.deployedBytecode) && {deploymentBytecode: parseBytecode(artifact.deployedBytecode)},
      ...(artifact.devdoc) && {devdoc: artifact.devdoc},
      ...(artifact.userdoc) && {userdoc: artifact.userdoc},
    }
    contractTypes[artifact.contractName] = config
  }
  return contractTypes
}


function parseTruffleArtifactsToCompilers(artifacts: Array<Artifact>) {
  const compilers: Array<any> = [];
  for (const artifact of artifacts) {
    let metadata;
    if (typeof artifact.metadata !== "undefined") {
      metadata = JSON.parse(artifact.metadata);
    }
    if (typeof artifact.compiler !== "undefined") {
      const newCompiler: Compiler = {
        name: artifact.compiler.name,
        version: artifact.compiler.version,
        settings: {
          optimize: metadata.settings.optimizer.enabled
        }
      }
      // insert compiler information object if not already in compilers array
      let compilerAssigned = false;
      for (const existingCompiler of compilers) {
        const clone = Object.assign({}, existingCompiler);
        delete clone.contractTypes;
        if (isEqual(newCompiler, clone) && !compilerAssigned) {
          existingCompiler.contractTypes.push(artifact.contractName);
          compilerAssigned = true;
        }
      }
      if (!compilerAssigned) {
        newCompiler.contractTypes = [artifact.contractName];
        compilers.push(newCompiler);
      }
    }
  }
  return compilers
}

function parseTruffleArtifactsToDeployments(artifacts: Array<Artifact>) {
  const allDeployments: Record<string, Record<string, ContractInstance>> = {}
  for (const artifact of artifacts) {
    for (const [blockchainUri, deploymentData] of Object.entries(artifact.networks)) {
      let currentUri = blockchainUri
      const ethpmDeploymentData = {
        contractType: artifact.contractName,
        address: deploymentData.address,
        transaction: deploymentData.transactionHash,
        runtimeBytecode: undefined,
        block: undefined
      }
      for (const storedUri of Object.keys(allDeployments)) {
        // todo: validate latest block hash is used - needs w3
        if (storedUri.startsWith(currentUri.split("/block/")[0])) {
          currentUri = storedUri
        }
      }
      if (typeof allDeployments[currentUri] !== "undefined") {
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
  composedArtifacts.contractTypes = parseTruffleArtifactsToContractTypes(artifacts)
  const compilers = parseTruffleArtifactsToCompilers(artifacts)
  if (compilers.length > 0) {
    composedArtifacts.compilers = compilers
  }
  const deployments = parseTruffleArtifactsToDeployments(artifacts)
  if (Object.entries(deployments).length !== 0) {
    composedArtifacts.deployments = deployments
  }
  return composedArtifacts
}

export { parseTruffleArtifacts };
