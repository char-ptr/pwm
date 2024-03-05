"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { ServerGetFolders } from "@/lib/serverWrapper";
import { decryptWithConKey } from "@/lib/crypto";
import { useAtom } from "jotai";
import { ContentKey } from "@/lib/state/key";
import { selectedFolderId } from "@/lib/state/app";

export default function ClientSidebarFolders({
	access_token,
}: { access_token: string }) {
	const { data } = useQuery({
		queryFn: () => ServerGetFolders(access_token),
		queryKey: ["folders", access_token],
	});
	const queryClient = useQueryClient();
	const [selected_folder_id, set_folder_id] = useAtom(selectedFolderId);
	const [conkey] = useAtom(ContentKey);
	const setSelectedAsRoot = () => {
		queryClient.invalidateQueries({ queryKey: ["vault_items"] });
		set_folder_id("");
	};
	return (
		<div className="flex flex-col">
			<p className="uppercase select-none text-sm font-extrabold pb-1">
				Folders
			</p>
			<div className="flex flex-col">
				<Button
					onClick={setSelectedAsRoot}
					variant={"ghost"}
					className="gap-5 h-12 text-xl text-left hover:bg-neutral-100/10 items-center justify-start hover:text-white"
				>
					Root
				</Button>
				{data?.map((folder: VaultFolder) => (
					<ClientSidebarFolder conkey={conkey} folder={folder} />
				))}
			</div>
		</div>
	);
}
export function ClientSidebarFolder({
	folder,
	conkey,
}: { conkey: Uint8Array; folder: VaultFolder }) {
	const queryClient = useQueryClient();
	const [selected_folder_id, set_folder_id] = useAtom(selectedFolderId);
	return (
		<Button
			onClick={() => {
				queryClient.invalidateQueries({ queryKey: ["vault_items"] });
				set_folder_id(folder.folder_id);
			}}
			variant={"ghost"}
			className="gap-5 h-12 text-xl text-left hover:bg-neutral-100/10 items-center justify-start hover:text-white"
		>
			{conkey.length ? decryptWithConKey(conkey, folder.name) : folder.name}
		</Button>
	);
}
