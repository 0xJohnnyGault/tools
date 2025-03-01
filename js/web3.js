import { createPublicClient, getContract, decodeFunctionResult, http, parseAbi, formatEther } from "https://esm.sh/viem";
import { avalanche } from "https://esm.sh/viem/chains";
import { base58 } from "https://esm.sh/@scure/base";

const publicClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

async function getOwners(validationIDs) {
  const validatorMgrAddress = "0x1424aef0d5272373beb69b2a860bd1da078df67f";
  const abi = parseAbi(["function getPoSValidators(bytes32[]) returns (address[])"]);
  const contract = getContract({ address: validatorMgrAddress, abi, client: publicClient });

  const validationIDsHex = validationIDs.map((v) => {
    const decoded = base58.decode(v).subarray(0, -4);
    // Convert to hex string with 0x prefix, padded to 32 bytes
    const hex = Array.from(decoded)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return "0x" + hex.padStart(64, "0");
  });

  let owners = [];
  try {
    owners = await publicClient.readContract({
      ...contract,
      functionName: "getPoSValidators",
      args: [validationIDsHex],
    });
    console.log("Validators:", owners);
  } catch (error) {
    console.error("Error reading contract:", error);
  }
  // Create a map of validationID -> owner
  const ownerMap = Object.fromEntries(validationIDs.map((id, index) => [id, owners[index]]));
  return ownerMap;
}

async function getEthBalance(address) {
  const balance = await publicClient.getBalance({ address });
  return Number(formatEther(balance)).toFixed(2);
}

async function getPChainBalance(address) {
  const data = await fetch(`https://glacier-api.avax.network/v1/networks/mainnet/blockchains/p-chain/balances?addresses=${address}`);
  const json = await data.json();
  const amt = json?.balances?.unlockedUnstaked[0]?.amount || 0;
  return Number(Number(amt) / 10 ** 9).toFixed(2);
}

export { publicClient, getOwners, getEthBalance, getPChainBalance };
