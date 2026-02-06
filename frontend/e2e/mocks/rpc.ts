import type { Page, Route } from "@playwright/test";

const CHAIN_ID_HEX = "0x13882"; // 80002
const BLOCK_NUMBER_HEX = "0x1fce795"; // 33343413
const CONTRACT_ADDRESS = "0x98B0c23eB065C7FaEd53EDA90feD6734ea14Cd9B";

// keccak256("TipSent(address,address,uint256)")
const TIP_SENT_TOPIC = "0x944676cc66b56faa2e31ce8f94f620789dda8488308d59491fabc492867d4cec";

function pad32(hex: string): string {
  return `0x${hex.replace("0x", "").toLowerCase().padStart(64, "0")}`;
}

function encodeAmount(ethAmount: number): string {
  const wei = BigInt(Math.floor(ethAmount * 1e18));
  return `0x${wei.toString(16).padStart(64, "0")}`;
}

function createTipLog(tipper: string, creator: string, amountInEth: number, blockNum: string) {
  return {
    address: CONTRACT_ADDRESS.toLowerCase(),
    topics: [TIP_SENT_TOPIC, pad32(tipper), pad32(creator)],
    data: encodeAmount(amountInEth),
    blockNumber: blockNum,
    transactionHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
    transactionIndex: "0x0",
    blockHash: `0x${"0".repeat(64)}`,
    logIndex: "0x0",
    removed: false,
  };
}

const MOCK_ADDRESSES = {
  alice: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  bob: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  charlie: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  dave: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  eve: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
};

const MOCK_CREATORS = {
  creator1: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  creator2: "0x14dC79964da2C08dA15Fb5315796B02155Bf0000",
  creator3: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
};

export const mockTipLogs = [
  createTipLog(MOCK_ADDRESSES.alice, MOCK_CREATORS.creator1, 5.0, "0x1fce780"),
  createTipLog(MOCK_ADDRESSES.bob, MOCK_CREATORS.creator1, 2.5, "0x1fce781"),
  createTipLog(MOCK_ADDRESSES.charlie, MOCK_CREATORS.creator2, 1.75, "0x1fce782"),
  createTipLog(MOCK_ADDRESSES.alice, MOCK_CREATORS.creator2, 3.0, "0x1fce783"),
  createTipLog(MOCK_ADDRESSES.dave, MOCK_CREATORS.creator3, 0.5, "0x1fce784"),
  createTipLog(MOCK_ADDRESSES.eve, MOCK_CREATORS.creator1, 1.0, "0x1fce785"),
  createTipLog(MOCK_ADDRESSES.bob, MOCK_CREATORS.creator3, 0.25, "0x1fce786"),
];

interface JsonRpcRequest {
  method: string;
  params?: unknown[];
  id: number;
  jsonrpc: string;
}

function jsonRpcResponse(id: number, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

const defaultHandlers: Record<string, (params?: unknown[]) => unknown> = {
  eth_chainId: () => CHAIN_ID_HEX,
  eth_blockNumber: () => BLOCK_NUMBER_HEX,
  eth_getLogs: () => [],
  eth_getBalance: () => "0x2386F26FC10000", // 0.01 POL
  eth_call: () => "0x0000000000000000000000000000000000000000000000000000000000000000",
  eth_estimateGas: () => "0x5208",
  eth_gasPrice: () => "0x3B9ACA00",
  eth_maxPriorityFeePerGas: () => "0x3B9ACA00",
  eth_getTransactionCount: () => "0x0",
  eth_getCode: () => "0x",
  eth_getBlockByNumber: () => ({
    number: BLOCK_NUMBER_HEX,
    hash: `0x${"0".repeat(64)}`,
    timestamp: `0x${Math.floor(Date.now() / 1000).toString(16)}`,
    baseFeePerGas: "0x3B9ACA00",
  }),
  net_version: () => "80002",
};

async function handleRpcRoute(
  route: Route,
  handlers: Record<string, (params?: unknown[]) => unknown>,
) {
  const request = route.request();
  if (request.method() !== "POST") {
    await route.fallback();
    return;
  }

  try {
    const body = request.postDataJSON() as JsonRpcRequest | JsonRpcRequest[];
    const requests = Array.isArray(body) ? body : [body];

    const responses = requests.map((req) => {
      const handler = handlers[req.method];
      return jsonRpcResponse(req.id, handler ? handler(req.params) : null);
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(Array.isArray(body) ? responses : responses[0]),
    });
  } catch {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(jsonRpcResponse(1, null)),
    });
  }
}

export async function mockRpc(
  page: Page,
  overrides?: Record<string, (params?: unknown[]) => unknown>,
) {
  const handlers = { ...defaultHandlers, ...overrides };

  await page.route("https://polygon-amoy-bor-rpc.publicnode.com/**", (route) =>
    handleRpcRoute(route, handlers),
  );
  await page.route("https://polygon-amoy-bor-rpc.publicnode.com", (route) =>
    handleRpcRoute(route, handlers),
  );
  await page.route("https://rpc-amoy.polygon.technology/**", (route) =>
    handleRpcRoute(route, handlers),
  );
  await page.route("https://rpc-amoy.polygon.technology", (route) =>
    handleRpcRoute(route, handlers),
  );
}
