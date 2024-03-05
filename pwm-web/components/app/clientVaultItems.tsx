"use client";

import { ServerGetItems } from "@/lib/serverWrapper";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ClientVaultItem } from "./clientVaultItem";
import { searchItemQuery, selectedFolderId } from "@/lib/state/app";
interface Props {
	serverItems: VaultItem[];
	token: string;
}
export function ClientVaultItems({ serverItems, token }: Props) {
	const [selected_folder_id] = useAtom(selectedFolderId);
	console.log("vault items selected_folder_id", selected_folder_id);

	const clientItems = useQuery({
		queryKey: ["vault_items", selected_folder_id],
		queryFn: ({ queryKey }) =>
			ServerGetItems(token, queryKey[1].length ? queryKey[1] : undefined),
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
