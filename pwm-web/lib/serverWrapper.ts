"use server";
import { sc } from "./utils";

const backend_url = new URL(process.env.NEXT_PUBLIC_backend_url as string);
const COOKIE_EXPIRE = 60 * 28;
export async function GetCookieExpire() {
  return COOKIE_EXPIRE;
}
function baseHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    access_token: token,
  };
}
export async function ServerGetItems(
  token: string,
  folder_id?: string,
): Promise<VaultItem[] | null> {
  const url = sc(backend_url, "/vault/items");
  url.searchParams.append("access_token", token);
  const output: ServerResponse<VaultItem[]> = await fetch(url, {
    next: {
      // 29 minutes
      // tags: [`user_items:${folder_id}:${token}`],
      // revalidate: COOKIE_EXPIRE,
    },
    headers: baseHeaders(token),
  }).then((r) => r.json());
  if (output.status === "Success") {
    return output.data;
  }
  return null;
}
export async function ServerGetTokens(
  token: string,
): Promise<UserTokens | null> {
  const url = sc(backend_url, "/account/tokens");
  url.searchParams.append("access_token", token);
  const output: ServerResponse<UserTokens> = await fetch(url, {
    next: {
      // 29 minutes
      tags: [`user_tokens:${token}`],
      revalidate: COOKIE_EXPIRE,
    },
    headers: baseHeaders(token),
  }).then((r) => r.json());
  if (output.status === "Success") {
    return output.data;
  }
  return null;
}
export async function ValidateAccessToken(token: string): Promise<User | null> {
  const url = sc(backend_url, "/account/me");
  url.searchParams.append("access_token", token);
  const output: ServerResponse<User> = await fetch(url, {
    next: {
      // 29 minutes
      tags: [`access_token:${token} `],
      revalidate: COOKIE_EXPIRE,
    },
    headers: baseHeaders(token),
  }).then((r) => r.json());
  if (output.status === "Success") {
    return output.data;
  }
  return null;
}
export async function ServerRegisterAccount(
  payload: RegisterPayload,
): Promise<AccessToken | null> {
  const url = sc(backend_url, "/account/register");
  const output: ServerResponse<AccessToken> = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
  if (output.status === "Success") {
    return output.data;
  }
  console.log("out", output);
  return null;
}
export async function ServerAddItem(
  token: string,
  payload: VaultItem,
): Promise<VaultItem | null> {
  const url = sc(backend_url, "/vault/items");
  const output: ServerResponse<VaultItem> = await fetch(url, {
    method: "POST",
    headers: baseHeaders(token),
    body: JSON.stringify(payload),
  }).then((r) => r.json());
  console.log(output);
  if (output.status === "Success") {
    return output.data;
  }
  return null;
}
export async function ServerLoginUser(
  username: string,
  password: string,
): Promise<AccessToken | null> {
  const url = sc(backend_url, "/account/login");
  const output: ServerResponse<AccessToken> = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then((r) => r.json());
  if (output.status === "Success") {
    return output.data;
  }
  return null;
}
console.log(process.env.NEXT_PUBLIC_backend_url);
// const sw = new ServerWrapper(process.env.NEXT_PUBLIC_backend_url as string);
// export default sw;
