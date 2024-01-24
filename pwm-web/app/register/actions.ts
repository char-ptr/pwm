"use server";
import * as z from "zod";
import { registerFormSchema } from "./RegisterForm";
import { sc } from "@/lib/utils";
import { cookies } from "next/headers";
import sw from "@/lib/serverWrapper";

export async function tryLogin(data: z.infer<typeof registerFormSchema> & { content_key: string }) {
  const access_maybe = await sw.register(data.username, data.alias, data.password, data.content_key)
  if (access_maybe) {
    const expire_at = new Date(access_maybe.expires_at);
    cookies().set({
      expires: expire_at,
      httpOnly: true,
      name: "access_token",
      value: access_maybe.token,
    });
  }
  return access_maybe;
}
