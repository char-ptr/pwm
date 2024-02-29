"use client";

import { ServerGetItems } from "@/lib/serverWrapper";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ClientVaultItem } from "./clientVaultItem";
import { searchItemQuery } from "@/lib/state/app";
interface Props {
  serverItems: VaultItem[];
  token: string;
}
export function ClientVaultItems({ serverItems, token }: Props) {
  const clientItems = useQuery({
    queryKey: ["vault_items"],
    queryFn: () => ServerGetItems(token),
    refetchInterval: 60 * 1000,
    initialData: serverItems,
  });

  return (
    <div className="flex flex-col gap-4">
      {clientItems.isLoading ? (
        <p>loading..</p>
      ) : (
        clientItems.data?.map((item) => (
          <ClientVaultItem key={item.item_id} item={item} />
        ))
      )}
    </div>
  );
}
