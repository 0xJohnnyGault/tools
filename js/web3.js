import { createPublicClient, getContract, decodeFunctionResult, http, parseAbi } from "https://esm.sh/viem";
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

export { publicClient, getOwners };
