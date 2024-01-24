"use server";
import * as z from "zod";
import { loginFormSchema } from "./LoginForm";
import { sc } from "@/lib/utils";
import { cookies } from "next/headers";
import sw from "@/lib/serverWrapper";

export async function tryLogin(data: z.infer<typeof loginFormSchema>) {
  const access_maybe = await sw.login(data.username, data.password);
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
