"use client";

import { decryptContentKey, decryptWithConKey } from "@/lib/crypto";
import { ContentKey } from "@/lib/state/key";
import { useAtom } from "jotai";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
  item: VaultItem;
}
export function ClientVaultItem({ item }: Props) {
  const [contentKey, _1] = useAtom(ContentKey);
  const decrypted_item = useMemo(() => {
    const old = { ...item };
    if (contentKey.length === 0) {
      return old;
    }
    for (const [k, v] of Object.entries(item)) {
      const corrected_key = k as keyof VaultItem;
      if (typeof v === "string") {
        old[corrected_key] = decryptWithConKey(contentKey, v);
      }
    }
    return old;
  }, [item, contentKey]);
  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        {contentKey.length && (
          <RenderFavicon ico_url={decrypted_item.icon_url} />
        )}
        <p>{decrypted_item.name}</p>
      </div>
    </>
  );
}
function RenderFavicon({ ico_url }: { ico_url?: string | undefined }) {
  const fall_back = "https://icons.duckduckgo.com/ip3/duckduckgo.com.ico";

  return (
    <Image
      height={64}
      width={64}
      src={ico_url ?? fall_back}
      alt="this item's favicon"
    />
  );
}
