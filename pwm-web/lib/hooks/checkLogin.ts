import { cookies } from "next/headers";
import sw from "../serverWrapper";

export async function useLoggedIn() {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");
  if (access_token) {
    const resp = await sw.validateAccessToken(access_token?.value ?? "");
    return resp;
  }
  return null;
}
