"use client";

import { decryptContentKey } from "@/lib/crypto";
import { DerivedPw } from "@/lib/state/key";
import { useAtom } from "jotai";
import { redirect } from "next/navigation";
import aesjs from "aes-js";

export function ClientTest({ user, tokens }: { user: User, tokens: UserTokens }) {
  const [derived_key, setDerivedKey] = useAtom(DerivedPw);
  if (!derived_key?.length) return redirect("/login");
  const { content_key, content_iv, password_salt } = tokens;
  if (!content_key || !content_iv) return <div>no content key</div>;
  const content_key_arr = aesjs.utils.hex.toBytes(content_key);
  const test = decryptContentKey(content_key_arr, content_iv, derived_key)

  return <div>{JSON.stringify(derived_key)}

    {JSON.stringify(test)}
  </div>;
}
