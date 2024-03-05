"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { ServerGetFolders } from "@/lib/serverWrapper";
import { decryptWithConKey } from "@/lib/crypto";
import { useAtom } from "jotai";
import { ContentKey } from "@/lib/state/key";
import { selectedFolderId } from "@/lib/state/app";
import { useMemo, useState } from "react";
type FolderWithChildren = VaultFolder & {
	children: FolderWithChildren[];
};
type FolderTree = FolderWithChildren[];

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
	const joinedFolders = useMemo(() => {
		const levels: FolderTree = [];
		if (!data) return levels;
		const map: { [x: string]: number } = {};
		let node: FolderWithChildren;
		const roots: FolderTree = [];
		let i: number;

		const list = data as unknown as FolderTree;
		for (i = 0; i < list.length; i += 1) {
			map[list[i].folder_id] = i; // initialize the map
			list[i].children = []; // initialize the children
		}

		for (i = 0; i < list.length; i += 1) {
			node = list[i];
			if (node.parent_folder_id) {
				// if you have dangling branches check that map[node.parentId] exists
				list[map[node.parent_folder_id]].children.push(node);
			} else {
				roots.push(node);
			}
		}
		return roots;
	}, [data]);
	console.log("joinedFolders", joinedFolders);
	return (
		<div className="flex flex-col">
			<p className="uppercase select-none text-sm font-extrabold pb-1">
				Folders
			</p>
			<div className="flex flex-col">
				<ClientSidebarFolder
					conkey={conkey}
					ignore={true}
					folder={{ name: "Root", folder_id: "", children: joinedFolders }}
				/>
				{/* {joinedFolders?.map((folder) => ( */}
				{/* 	<ClientSidebarFolder conkey={conkey} folder={folder} /> */}
				{/* ))} */}
			</div>
		</div>
	);
}
export function ClientSidebarFolder({
	folder,
	conkey,
	ignore = false,
}: { ignore?: boolean; conkey: Uint8Array; folder: FolderWithChildren }) {
	const queryClient = useQueryClient();
	const [selected_folder_id, set_folder_id] = useAtom(selectedFolderId);
	const [open, setOpen] = useState(false);
	const decrypted_name = useMemo(() => {
		if (conkey.length) {
			return decryptWithConKey(conkey, folder.name);
		}
		return folder.name;
	}, [folder, conkey]);
	return (
		<div className="flex flex-col">
			<div className="flex items-center flex-row">
				{folder.children.length > 0 && (
					<Button
						onClick={() => {
							setOpen(!open);
						}}
						variant={"ghost"}
					>
						{open ? "▼" : "▶"}
					</Button>
				)}
				<Button
					onClick={() => {
						queryClient.invalidateQueries({ queryKey: ["vault_items"] });
						set_folder_id(folder.folder_id);
					}}
					variant={"ghost"}
					className={`gap-5 h-12 text-xl text-left hover:!bg-neutral-100/10 items-center justify-start hover:text-white ${
						selected_folder_id === folder.folder_id ? "!bg-neutral-400/10" : ""
					}`}
				>
					{ignore ? folder.name : decrypted_name}
				</Button>
			</div>
			<div className="pl-5 flex flex-col">
				{open &&
					folder.children.map((child) => (
						<ClientSidebarFolder
							key={child.folder_id}
							conkey={conkey}
							folder={child}
						/>
					))}
			</div>
		</div>
	);
}
