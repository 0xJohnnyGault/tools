import {
  createPublicClient,
  createWalletClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  parseAbi,
  defineChain,
} from "https://esm.sh/viem";
import { bech32, base58 } from "https://esm.sh/@scure/base";

const yourChain = defineChain({
  id: 389, // Your chain's ID
  name: "Ethix ETX",
  network: "etx-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETX",
    symbol: "ETX",
  },
  rpcUrls: {
    default: {
      http: ["https://subnets.avax.network/etx/mainnet/rpc"],
    },
    public: {
      http: ["https://subnets.avax.network/etx/mainnet/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ethix ETX Explorer",
      url: "https://subnets.avax.network/etx",
    },
  },
  contracts: {},
});

const publicClient = createPublicClient({
  chain: yourChain,
  transport: http(),
});

async function addChainToWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${yourChain.id.toString(16)}`, // Convert to hex
          chainName: yourChain.name,
          nativeCurrency: yourChain.nativeCurrency,
          rpcUrls: yourChain.rpcUrls.public.http,
          blockExplorerUrls: [yourChain.blockExplorers.default.url],
        },
      ],
    });
    console.log("Chain added successfully");
  } catch (error) {
    console.error("Failed to add chain:", error);
    throw error;
  }
}

// const account = privateKeyToAccount(
//   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
// );
// const walletClient = createWalletClient({
//   account,
//   chain: yourChain,
//   transport: http(),
// });

const abi = parseAbi([
  "function initializeValidatorRegistration((bytes,bytes,uint64,(uint32,address[]),(uint32,address[])),uint64) returns (bytes)",
]);

function nodeIDToHexStr(nodeID) {
  const cb58String = nodeID.replace("NodeID-", "");
  const decoded = base58.decode(cb58String).subarray(0, -4); // remove checksum
  // Use Array.from and map to convert to hex string
  return (
    "0x" +
    Array.from(decoded)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

function PchainAddressToHexStr(pchainAddress) {
  const b32str = pchainAddress.replace("P-", "");
  const { prefix, words } = bech32.decode(b32str);
  const decoded = bech32.fromWords(words);
  // Use Array.from and map to convert to hex string
  return (
    "0x" +
    Array.from(decoded)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

async function initializeValidatorRegistration(
  contract,
  {
    nodeID, // NodeID-blah format
    blsPublicKey, // hex bytes
    expiry, // uint64
    balanceOwner, // P-chain address
    disableOwner, // P-chain address
    weight, // uint64
  }
) {
  // Check if browser wallet is available
  if (!window.ethereum) {
    alert("Please install a browser wallet like MetaMask");
    throw new Error("Please install a browser wallet like MetaMask");
  }
  // Validate required parameters
  if (!nodeID) {
    throw new Error("NodeID is required");
  }
  if (!blsPublicKey) {
    throw new Error("BLS Public Key is required");
  }
  if (!expiry) {
    throw new Error("Expiry time is required");
  }
  if (!balanceOwner) {
    throw new Error("Balance owner P-chain address is required");
  }
  if (!disableOwner) {
    throw new Error("Disable owner P-chain address is required");
  }
  if (!weight) {
    throw new Error("Weight is required");
  }

  // Validate formats
  if (!nodeID.startsWith("NodeID-")) {
    throw new Error("NodeID must be in NodeID-* format");
  }
  if (!blsPublicKey.startsWith("0x")) {
    throw new Error("BLS Public Key must be in hex format starting with 0x");
  }
  if (!balanceOwner.startsWith("P-")) {
    throw new Error("Balance owner must be a P-chain address starting with P-");
  }
  if (!disableOwner.startsWith("P-")) {
    throw new Error("Disable owner must be a P-chain address starting with P-");
  }

  // Structure the parameters according to the ABI
  const params = [
    // First parameter - the struct
    [
      nodeIDToHexStr(nodeID), // bytes
      blsPublicKey, // bytes
      expiry, // uint64
      [1, [PchainAddressToHexStr(balanceOwner)]], // (uint32,[address]) for RemainingBalanceOwner
      [1, [PchainAddressToHexStr(disableOwner)]], // (uint32,[address]) for DisableOwner
    ],
    // Second parameter
    weight, // uint64
  ];

  console.log("initializeValidatorRegistration params", params);

  // Create the contract write
  const data = encodeFunctionData({
    abi,
    functionName: "initializeValidatorRegistration",
    args: params,
  });

  console.log("initializeValidatorRegistration data", data);

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Create transaction object
    const transaction = {
      from: accounts[0],
      to: contract,
      data: data,
    };

    // Send transaction using the browser wallet
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transaction],
    });

    return txHash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

async function notifyLancer({
  network,
  blockchain_id,
  tx_id,
  node_id,
  bls_pub_key,
  bls_pop,
}) {
  const response = await fetch(
    "https://hosting.multisiglabs.org/lancer-server/initiate_add_validator",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        network,
        blockchain_id,
        tx_id,
        node_id,
        bls_pub_key,
        bls_pop,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to notify Lancer: ${response.statusText}`);
  }

  return await response.json();
}

export { initializeValidatorRegistration, addChainToWallet, notifyLancer };
