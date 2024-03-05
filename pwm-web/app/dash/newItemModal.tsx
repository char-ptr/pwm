"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { encryptWithConKey } from "@/lib/crypto";
import { selectedFolderId, showNewItemModal } from "@/lib/state/app";
import { ContentKey } from "@/lib/state/key";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { tryAddItem } from "./actions";
import { useQueryClient } from "@tanstack/react-query";
import FormNewItem, { itemSchema } from "@/components/app/Forms/FormNewItem";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectTrigger,
	SelectValue,
	SelectItem,
} from "@/components/ui/select";
import FormNewFolder, {
	folderSchema,
} from "@/components/app/Forms/FormNewFolder";
import { ServerAddFolder } from "@/lib/serverWrapper";
export function NewItemModal({ access }: { access: string }) {
	const ResetForm = useRef<null | (() => void)>(null);
	const [selected_folder_id] = useAtom(selectedFolderId);
	const queryClient = useQueryClient();
	const [waitClient, setWaitClient] = useState(false);
	const [resetState, setResetState] = useState(false);
	const [display, setDisplay] = useAtom(showNewItemModal);
	const [contentKey, _1] = useAtom(ContentKey);
	const [itemType, setItemType] = useState("item");
	async function submitNewFolder(values: z.infer<typeof folderSchema>) {
		values.name = encryptWithConKey(contentKey, values.name);
		if (values.icon_url) {
			values.icon_url = encryptWithConKey(contentKey, values.icon_url);
		}
		console.log("submitting", values);
		const ret = await ServerAddFolder(access, values as unknown as VaultFolder);
		console.log("server response:", ret);
		if (ret) {
			setDisplay(false);
			setResetState(true);
			queryClient.invalidateQueries({ queryKey: ["folders", access] });
		} else {
			console.log("failurwe");
		}
	}
	async function submitNewItem(values: z.infer<typeof itemSchema>) {
		values.password = encryptWithConKey(contentKey, values.password);
		values.name = encryptWithConKey(contentKey, values.name);
		values.username = encryptWithConKey(contentKey, values.username);
		if (selected_folder_id.length) {
			values.folder_id = selected_folder_id;
		}
		let icon_final = values.icon_url;
		const icon_url = new URL(values.icon_url);
		if (icon_url.pathname.length === 0) {
			const ddg_ico_p1 = new URL(values.icon_url).hostname;
			icon_final = `https://icons.duckduckgo.com/ip3/${ddg_ico_p1}.ico`;
		}
		values.icon_url = encryptWithConKey(contentKey, icon_final);
		console.log("submitting", values);
		const ret = await tryAddItem(access, values as VaultItem);
		console.log("server response:", ret);
		if (ret) {
			setDisplay(false);
			setResetState(true);
			queryClient.invalidateQueries({ queryKey: ["vault_items"] });
		} else {
			console.log("failurwe");
		}
	}
	useEffect(() => {
		setWaitClient(true);
	}, []);
	// you kinda have to do this according to the react-hook-form documentation
	useEffect(() => {
		if (resetState) {
			if (ResetForm.current) ResetForm.current();
			setResetState(false);
		}
	}, [resetState]);

	return (
		<>
			{waitClient && (
				<Dialog onOpenChange={setDisplay} open={display}>
					<DialogContent className="max-w-xl">
						<DialogHeader>
							<DialogTitle>New Item</DialogTitle>
							<DialogDescription>
								Add a new login into your vault!
							</DialogDescription>
						</DialogHeader>
						<div>
							<Select
								value={itemType}
								onValueChange={(x) => setItemType(x)}
								defaultValue="item"
							>
								<SelectTrigger className="mb-5 w-[180px]">
									<SelectValue placeholder="Select Item Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Item Type</SelectLabel>
										<SelectItem value="item">New Entry</SelectItem>
										<SelectItem value="folder">New Folder</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							{itemType === "item" && (
								<FormNewItem
									submitcb={submitNewItem}
									request_reset={ResetForm}
								/>
							)}
							{itemType === "folder" && (
								<FormNewFolder
									submitcb={submitNewFolder}
									request_reset={ResetForm}
								/>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
