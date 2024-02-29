"use server";
import * as z from "zod";
import { sc } from "@/lib/utils";
import { cookies } from "next/headers";
import { ServerAddItem } from "@/lib/serverWrapper";

export async function tryAddItem(
  access_token: string,
  data: VaultItem,
): Promise<VaultItem | null> {
  return await ServerAddItem(access_token, data);
}
