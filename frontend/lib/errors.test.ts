import { describe, expect, it } from "vitest";
import { classifyTransactionError, isConnectionError } from "./errors";

describe("isConnectionError", () => {
  it("detects connection refused error", () => {
    expect(isConnectionError(new Error("ERR_CONNECTION_REFUSED"))).toBe(true);
  });

  it("detects ECONNREFUSED error", () => {
    expect(isConnectionError(new Error("connect ECONNREFUSED 127.0.0.1:8545"))).toBe(true);
  });

  it("detects failed to fetch error", () => {
    expect(isConnectionError(new Error("Failed to fetch"))).toBe(true);
  });

  it("returns false for unrelated error", () => {
    expect(isConnectionError(new Error("Something went wrong"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isConnectionError("string error")).toBe(false);
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError(undefined)).toBe(false);
    expect(isConnectionError(42)).toBe(false);
  });
});

describe("classifyTransactionError", () => {
  it("classifies user rejection", () => {
    const result = classifyTransactionError(new Error("User rejected the request"));
    expect(result.title).toBe("Transaction rejected");
  });

  it("classifies user denied", () => {
    const result = classifyTransactionError(new Error("User denied transaction signature"));
    expect(result.title).toBe("Transaction rejected");
  });

  it("classifies insufficient funds", () => {
    const result = classifyTransactionError(new Error("insufficient funds for gas"));
    expect(result.title).toBe("Insufficient funds");
  });

  it("classifies insufficient balance", () => {
    const result = classifyTransactionError(new Error("insufficient balance"));
    expect(result.title).toBe("Insufficient funds");
  });

  it("classifies rate limiting", () => {
    const result = classifyTransactionError(new Error("429 Too Many Requests"));
    expect(result.title).toBe("RPC rate limited");
  });

  it("classifies too many errors", () => {
    const result = classifyTransactionError(new Error("too many errors, permanent failure"));
    expect(result.title).toBe("RPC rate limited");
  });

  it("classifies connection refused as RPC connection failed", () => {
    const result = classifyTransactionError(new Error("ERR_CONNECTION_REFUSED"));
    expect(result.title).toBe("RPC connection failed");
  });

  it("classifies network errors", () => {
    const result = classifyTransactionError(new Error("Network disconnected"));
    expect(result.title).toBe("Network error");
  });

  it("classifies timeout errors", () => {
    const result = classifyTransactionError(new Error("Request timeout"));
    expect(result.title).toBe("Network error");
  });

  it("classifies invalid address errors", () => {
    const result = classifyTransactionError(new Error("InvalidAddress: bad address"));
    expect(result.title).toBe("Invalid address");
  });

  it("classifies invalid amount errors", () => {
    const result = classifyTransactionError(new Error("InvalidAmount"));
    expect(result.title).toBe("Invalid amount");
  });

  it("classifies no tip to withdraw", () => {
    const result = classifyTransactionError(new Error("NoTipToWithdraw"));
    expect(result.title).toBe("Nothing to withdraw");
  });

  it("classifies contract caller errors", () => {
    const result = classifyTransactionError(new Error("ContractCallersNotSupported"));
    expect(result.title).toBe("Contract wallets not supported");
  });

  it("falls back to generic error for unknown messages", () => {
    const msg = "Something entirely unexpected happened";
    const result = classifyTransactionError(new Error(msg));
    expect(result.title).toBe("Error");
    expect(result.description).toBe(msg);
  });
});
