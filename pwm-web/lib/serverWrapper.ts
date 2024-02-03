import { sc } from "./utils";

const COOKIE_EXPIRE = 60 * 28;
class ServerWrapper {
  readonly url: string;

  constructor(backend_url: string) {
    this.url = backend_url;
  }
  private baseHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      access_token: token,
    };
  }
  async items(token: string, folder_id?: string): Promise<VaultItem[] | null> {
    const url = sc(this.url, "/vault/items");
    url.searchParams.append("access_token", token);
    const output: ServerResponse<VaultItem[]> = await fetch(url, {
      next: {
        // 29 minutes
        // tags: [`user_items:${folder_id}:${token}`],
        // revalidate: COOKIE_EXPIRE,
      },
      headers: this.baseHeaders(token),
    }).then((r) => r.json());
    if (output.status === "Success") {
      return output.data;
    }
    return null;
  }
  async tokens(token: string): Promise<UserTokens | null> {
    const url = sc(this.url, "/account/tokens");
    url.searchParams.append("access_token", token);
    const output: ServerResponse<UserTokens> = await fetch(url, {
      next: {
        // 29 minutes
        tags: [`user_tokens:${token}`],
        revalidate: COOKIE_EXPIRE,
      },
      headers: this.baseHeaders(token),
    }).then((r) => r.json());
    if (output.status === "Success") {
      return output.data;
    }
    return null;
  }
  async validateAccessToken(token: string): Promise<User | null> {
    const url = sc(this.url, "/account/me");
    url.searchParams.append("access_token", token);
    const output: ServerResponse<User> = await fetch(url, {
      next: {
        // 29 minutes
        tags: [`access_token:${token} `],
        revalidate: COOKIE_EXPIRE,
      },
      headers: this.baseHeaders(token),
    }).then((r) => r.json());
    if (output.status === "Success") {
      return output.data;
    }
    return null;
  }
  async register(payload: RegisterPayload): Promise<AccessToken | null> {
    const url = sc(this.url, "/account/register");
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
    return null;
  }
  async addItem(token: string, payload: VaultItem): Promise<VaultItem | null> {
    const url = sc(this.url, "/vault/items");
    const output: ServerResponse<VaultItem> = await fetch(url, {
      method: "POST",
      headers: this.baseHeaders(token),
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    console.log(output);
    if (output.status === "Success") {
      return output.data;
    }
    return null;
  }
  async login(username: string, password: string): Promise<AccessToken | null> {
    const url = sc(this.url, "/account/login");
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
}
const sw = new ServerWrapper(process.env.NEXT_PUBLIC_backend_url as string);
export default sw;
