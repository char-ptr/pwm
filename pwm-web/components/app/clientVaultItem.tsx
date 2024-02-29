"use client";

import { UseDecrypt, decryptContentKey, decryptWithConKey } from "@/lib/crypto";
import { ContentKey } from "@/lib/state/key";
import { useAtom } from "jotai";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { selectedItem } from "@/lib/state/app";

interface Props {
	item: VaultItem;
}
export function ClientVaultItem({ item }: Props) {
	const [aselected_item, set_selected_item] = useAtom(selectedItem);
	const decrypted_item = UseDecrypt(item);
	const same = Object.is(item, decrypted_item);
	const select_item = useCallback(() => {
		set_selected_item(decrypted_item);
	}, [decrypted_item, set_selected_item]);
	return (
		<>
			<button
				type="button"
				onClick={select_item}
				className={`flex rounded-lg flex-row gap-4 items-center p-4 hover:bg-pink-300/70 ${
					aselected_item?.item_id === decrypted_item.item_id &&
					"hover:bg-pink-600/50 bg-pink-600/70"
				}`}
			>
				{!same && (
					<>
						<RenderFavicon ico_url={decrypted_item.icon_url} />
					</>
				)}
				<span>{decrypted_item.name}</span>
			</button>
		</>
	);
}
function RenderFavicon({ ico_url }: { ico_url?: string | undefined }) {
	const fall_back = "https://icons.duckduckgo.com/ip3/duckduckgo.com.ico";

	return (
		<Image
			height={56}
			width={56}
			className="rounded-lg aspect-square object-contain"
			src={ico_url ?? fall_back}
			alt="this item's favicon"
		/>
	);
}
