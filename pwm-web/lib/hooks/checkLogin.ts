import { cookies } from "next/headers";
import { ServerGetTokens, ValidateAccessToken } from "../serverWrapper";

export async function useLoggedIn() {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");
  if (access_token) {
    const resp = await ValidateAccessToken(access_token?.value ?? "");
    return { user: resp, access_token: access_token?.value ?? "" };
  }
  return {};
}
export async function useGetTokens(access_token?: string) {
  if (access_token) {
    const resp = await ServerGetTokens(access_token);
    return resp;
  }
  return null;
}
