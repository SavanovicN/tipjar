import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { byBigIntDesc, sumByKey } from "@/lib/utils";
import { TIP_SENT_EVENT, tipJarAddress, tipJarDeployBlock } from "@/web3/contract";

interface TipEvent {
  tipper: string;
  creator: string;
  amount: bigint;
}

export function useTipEvents() {
  const publicClient = usePublicClient();

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tip-events", tipJarAddress],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client");

      const logs = await publicClient.getLogs({
        address: tipJarAddress,
        event: TIP_SENT_EVENT,
        fromBlock: tipJarDeployBlock,
        toBlock: "latest",
      });

      return logs.map(
        (log): TipEvent => ({
          tipper: log.args.tipper as string,
          creator: log.args.creator as string,
          amount: log.args.amount as bigint,
        }),
      );
    },
    enabled: !!publicClient,
    retry: 3,
    staleTime: 60_000,
  });

  return { events, isLoading, error: error?.message ?? null };
}

export function aggregateByTipper(events: TipEvent[]) {
  const totals = sumByKey(
    events,
    (e) => e.tipper,
    (e) => e.amount,
  );

  return [...totals]
    .map(([address, { total }]) => ({ address, totalAmount: total }))
    .toSorted(byBigIntDesc((item) => item.totalAmount));
}

export function aggregateByCreator(events: TipEvent[]) {
  const totals = sumByKey(
    events,
    (e) => e.creator,
    (e) => e.amount,
  );

  return [...totals]
    .map(([address, { total, count }]) => ({ address, totalReceived: total, tipCount: count }))
    .toSorted(byBigIntDesc((item) => item.totalReceived));
}
