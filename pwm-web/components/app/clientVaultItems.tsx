"use client";

import sw from "@/lib/serverWrapper";
import { useQuery } from "@tanstack/react-query";
import { ClientVaultItem } from "./clientVaultItem";
interface Props {
  serverItems: VaultItem[];
  token: string;
}
export function ClientVaultItems({ serverItems, token }: Props) {
  const clientItems = useQuery({
    queryKey: ["vault_items"],
    queryFn: () => sw.items(token),
    initialData: serverItems,
  });

  return (
    <>
      {clientItems.isLoading ? (
        <p>loading..</p>
      ) : (
        clientItems.data?.map((item) => (
          <ClientVaultItem key={item.item_id} item={item} />
        ))
      )}
    </>
  );
}
