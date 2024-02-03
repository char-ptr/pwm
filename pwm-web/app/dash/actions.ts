"use server";
import * as z from "zod";
import { sc } from "@/lib/utils";
import { cookies } from "next/headers";
import sw from "@/lib/serverWrapper";

export async function tryAddItem(access_token: string, data: VaultItem): Promise<VaultItem | null> {
  return await sw.addItem(access_token, data);
}
