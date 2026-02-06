import tipJarAbi from "./abi/TipJar.json";

export { tipJarAbi };

const LOCALHOST_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3" as const;
const AMOY_ADDRESS = "0x98B0c23eB065C7FaEd53EDA90feD6734ea14Cd9B" as const;

const LOCALHOST_DEPLOY_BLOCK = BigInt(0);
const AMOY_DEPLOY_BLOCK = BigInt(33344021);

const USE_LOCAL = process.env.NEXT_PUBLIC_USE_LOCAL_NETWORK === "true";

export const tipJarAddress = USE_LOCAL ? LOCALHOST_ADDRESS : AMOY_ADDRESS;
export const tipJarDeployBlock = USE_LOCAL ? LOCALHOST_DEPLOY_BLOCK : AMOY_DEPLOY_BLOCK;

// Event definitions for use with getLogs
export const TIP_SENT_EVENT = {
  type: "event",
  name: "TipSent",
  inputs: [
    { type: "address", name: "tipper", indexed: true },
    { type: "address", name: "creator", indexed: true },
    { type: "uint256", name: "amount", indexed: false },
  ],
} as const;
