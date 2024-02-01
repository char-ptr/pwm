"use client";
import { requireUnlock } from "@/lib/state/app";
import { useAtom } from "jotai";
import { ReactNode } from "react";

export function Hider({ children }: { children: ReactNode }) {
  const [hide] = useAtom(requireUnlock)
  return <>{!hide && children}</>
}
