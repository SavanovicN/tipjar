interface ClassifiedError {
  title: string;
  description: string;
}

/** Patterns that indicate a connection/network error */
const CONNECTION_PATTERNS = [
  "err_connection_refused",
  "connection refused",
  "econnrefused",
  "failed to fetch",
];

export function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return CONNECTION_PATTERNS.some((pattern) => message.includes(pattern));
  }
  return false;
}

const errorPatterns: Array<{ patterns: string[]; error: ClassifiedError }> = [
  {
    patterns: ["user rejected", "user denied"],
    error: {
      title: "Transaction rejected",
      description: "You rejected the transaction in your wallet. No funds were sent.",
    },
  },
  {
    patterns: ["insufficient funds", "insufficient balance"],
    error: {
      title: "Insufficient funds",
      description: "You don't have enough funds to complete this transaction including gas fees.",
    },
  },
  {
    patterns: ["too many errors", "rate limit", "too many requests", "429"],
    error: {
      title: "RPC rate limited",
      description:
        "The network is temporarily throttling requests. Please wait a moment and try again.",
    },
  },
  {
    patterns: CONNECTION_PATTERNS,
    error: {
      title: "RPC connection failed",
      description:
        "Unable to connect to the blockchain node. Please ensure the correct network is configured.",
    },
  },
  {
    patterns: ["network", "disconnected", "timeout"],
    error: {
      title: "Network error",
      description: "Unable to connect to the network. Please check your connection and try again.",
    },
  },
  {
    patterns: ["invalidaddress", "invalid address"],
    error: {
      title: "Invalid address",
      description: "The address is invalid. Please check and try again.",
    },
  },
  {
    patterns: ["invalidamount", "invalid amount"],
    error: {
      title: "Invalid amount",
      description: "The amount must be greater than 0.",
    },
  },
  {
    patterns: ["notiptowithdraw", "no tip"],
    error: {
      title: "Nothing to withdraw",
      description: "You don't have any tips to withdraw.",
    },
  },
  {
    patterns: ["contractcallersnotsupported", "contract callers"],
    error: {
      title: "Contract wallets not supported",
      description:
        "Only regular wallets (EOAs) can withdraw. Smart contract wallets like Gnosis Safe are not supported.",
    },
  },
];

export function classifyTransactionError(error: Error): ClassifiedError {
  const message = error.message.toLowerCase();

  const match = errorPatterns.find(({ patterns }) =>
    patterns.some((pattern) => message.includes(pattern)),
  );

  return match?.error ?? { title: "Error", description: error.message };
}
