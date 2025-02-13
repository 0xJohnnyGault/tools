import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  parseAbi,
} from "https://esm.sh/viem";

// import {
//   createPublicClient,
//   http,
//   createWalletClient,
//   defineChain,
//   parseAbi,
//   encodeFunctionData,
// } from "npm:viem";
// import { privateKeyToAccount } from "npm:viem/accounts";
// import { bech32, base58 } from "npm:@scure/base";

// const yourChain = defineChain({
//   id: 389, // Your chain's ID
//   name: "ETX",
//   network: "etx-mainnet",
//   nativeCurrency: {
//     decimals: 18,
//     name: "ETX",
//     symbol: "ETX",
//   },
//   rpcUrls: {
//     default: {
//       http: ["https://subnets.avax.network/etx/mainnet/rpc"],
//     },
//     public: {
//       http: ["https://subnets.avax.network/etx/mainnet/rpc"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Your Explorer",
//       url: "https://explorer.your-chain.com",
//     },
//   },
//   contracts: {},
// });

// const publicClient = createPublicClient({
//   chain: yourChain,
//   transport: http(),
// });

// const account = privateKeyToAccount(
//   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
// );
// const walletClient = createWalletClient({
//   account,
//   chain: yourChain,
//   transport: http(),
// });

// const abi = parseAbi([
//   "function initializeValidatorRegistration((bytes,bytes,uint64,(uint32,address[]),(uint32,address[])),uint64) returns (bytes)",
// ]);

// function nodeIDToHexStr(nodeID) {
//   const cb58String = nodeID.replace("NodeID-", "");
//   const decoded = base58.decode(cb58String).subarray(0, -4); // remove checksum
//   // Use Array.from and map to convert to hex string
//   return (
//     "0x" +
//     Array.from(decoded)
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join("")
//   );
// }

// function PchainAddressToHexStr(pchainAddress) {
//   const b32str = pchainAddress.replace("P-", "");
//   const { prefix, words } = bech32.decode(b32str);
//   const decoded = bech32.fromWords(words);
//   // Use Array.from and map to convert to hex string
//   return (
//     "0x" +
//     Array.from(decoded)
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join("")
//   );
// }

// async function initializeValidatorRegistration(
//   contract,
//   {
//     nodeID, // NodeID-blah format
//     blsPublicKey, // hex bytes
//     expiry, // uint64
//     balanceOwner, // P-chain address
//     disableOwner, // P-chain address
//     weight, // uint64
//   }
// ) {
//   // Structure the parameters according to the ABI
//   const params = [
//     // First parameter - the struct
//     [
//       nodeIDToHexStr(nodeID), // bytes
//       blsPublicKey, // bytes
//       expiry, // uint64
//       [1, [PchainAddressToHexStr(balanceOwner)]], // (uint32,[address]) for RemainingBalanceOwner
//       [1, [PchainAddressToHexStr(disableOwner)]], // (uint32,[address]) for DisableOwner
//     ],
//     // Second parameter
//     weight, // uint64
//   ];

//   console.log(params);

//   // Create the contract write
//   const data = encodeFunctionData({
//     abi,
//     functionName: "initializeValidatorRegistration",
//     args: params,
//   });

//   console.log(data);

//   // // Send the transaction
//   // const hash = await walletClient.writeContract({
//   //   address: contract,
//   //   abi,
//   //   functionName: 'initializeValidatorRegistration',
//   //   args: params,
//   // })

//   // return hash
// }
// const expires = BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60); // 24 hours from now in seconds
// const result = await initializeValidatorRegistration("0xYourContractAddress", {
//   nodeID: "NodeID-8kBdfKFbQAeYQqb5VMJ7HFwoR8C5Z9LCE", // Your nodeID as bytes
//   blsPublicKey:
//     "0xaf12158c7b4a00f527203d869fe52c31653bd337d6b47eb6c65021aa64ea529eba8664e14c307ecc704f38e09d3d3052", // Your BLS public key as bytes
//   expiry: expires, // Expiry timestamp as BigInt
//   balanceOwner: "P-avax12pdvdwgvx8tzlxc0syvxuph9mp2yuxu9a0uc8d", // Balance owner address
//   disableOwner: "P-avax12pdvdwgvx8tzlxc0syvxuph9mp2yuxu9a0uc8d", // Disable owner address
//   weight: 100n, // Weight as BigInt
// });
