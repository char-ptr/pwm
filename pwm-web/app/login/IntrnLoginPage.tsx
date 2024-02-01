"use client";

import { useHydrateAtoms } from "jotai/utils";
import LoginForm from "./LoginForm";
import { useLoggedIn } from "@/lib/hooks/checkLogin";
import { DerivedPw } from "@/lib/state/key";
import { useAtom } from "jotai";
import { redirect } from "next/navigation";
import { unknown } from "zod";
type Unwrap<T> =
  T extends Promise<infer U> ? U :
  T extends (...args: unknown[]) => Promise<infer U> ? U :
  T extends (...args: unknown[]) => infer U ? U :
  T
export function IntrnLoginPage({ user }: { user: Unwrap<ReturnType<typeof useLoggedIn>> }) {
  useHydrateAtoms([[DerivedPw, Uint8Array.of()]])
  const [derived_key, setDerivedKey] = useAtom(DerivedPw);
  if (user.user) {
    return redirect("/dash");
  }

  return <LoginForm />
}
