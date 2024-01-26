import { cookies } from "next/headers";
import sw from "../serverWrapper";

export async function useLoggedIn() {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");
  if (access_token) {
    const resp = await sw.validateAccessToken(access_token?.value ?? "");
    return { user: resp, access_token: access_token?.value ?? "" }
  }
  return {};
}
export async function useGetTokens(access_token: string) {
  if (access_token) {
    const resp = await sw.tokens(access_token);
    return resp;
  }
  return null;
}
