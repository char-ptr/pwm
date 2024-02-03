"use client";

import { decryptContentKey, decryptWithConKey } from "@/lib/crypto";
import { ContentKey } from "@/lib/state/key";
import { useAtom } from "jotai";

interface Props {
  item: VaultItem;
}
export function ClientVaultItem({ item }: Props) {
  const [contentKey, _1] = useAtom(ContentKey);
  return (
    <>
      {contentKey.length ? (
        <div>{decryptWithConKey(contentKey, item.name)}</div>
      ) : (
        <div>loading..</div>
      )}
    </>
  );
}
