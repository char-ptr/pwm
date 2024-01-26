"use client";

import { DerivedPw } from "@/lib/state/key";
import { useAtom } from "jotai";
import { redirect } from "next/navigation";

export function ClientTest() {
	const [derived_key, setDerivedKey] = useAtom(DerivedPw);
	if (!derived_key?.length) return redirect("/login");
	return <div>{JSON.stringify(derived_key)}</div>;
}
