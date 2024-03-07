"use client";

import { ServerGetItems } from "@/lib/serverWrapper";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ClientVaultItem } from "./clientVaultItem";
import { searchItemQuery, selectedFolderId } from "@/lib/state/app";
import { Skeleton } from "../ui/skeleton";
interface Props {
  serverItems: VaultItem[];
  token: string;
}
export function ClientVaultItems({ serverItems, token }: Props) {
  const [selected_folder_id] = useAtom(selectedFolderId);
  console.log("vault items selected_folder_id", selected_folder_id);

  const {
    data: clientItems,
    isLoading,
    status,
  } = useQuery({
    queryKey: ["vault_items", selected_folder_id],
    queryFn: async ({ queryKey }) =>
      await ServerGetItems(token, queryKey[1].length ? queryKey[1] : undefined),
    refetchInterval: 60 * 1000,
    enabled: selected_folder_id !== "",
  });

  console.log("vault items", status);
  return (
    <div className="flex flex-col gap-4">
      {isLoading
        ? Array(10)
          .fill(0)
          .map((_, i) => (
            <div
              className={`flex rounded-lg flex-row gap-4 items-center p-4 
            h-16`}
            >
              <Skeleton className="h-[56px] w-[56px] dark:bg-neutral-900 rounded-lg aspect-square object-contain" />
              <Skeleton className="w-36 h-full dark:bg-neutral-900" />
            </div>
          ))
        : (clientItems ?? serverItems)?.map((item) => (
          <ClientVaultItem key={item.item_id} item={item} />
        ))}
    </div>
  );
}
