import { sc } from "./utils";

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
  async tokens(token: string): Promise<UserTokens | null> {
    const url = sc(this.url, "/account/tokens");
    url.searchParams.append("access_token", token);
    const output: ServerResponse<UserTokens> = await fetch(url, {
      next: {
        // 29 minutes
        tags: [`user_tokens:${token}`],
        revalidate: 1740,
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
        revalidate: 1740,
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
const sw = new ServerWrapper(process.env.backend_url as string);
export default sw;
