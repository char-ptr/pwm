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
  async validateAccessToken(token: string): Promise<User | null> {
    const url = sc(this.url, "/account/me");
    url.searchParams.append("access_token", token);
    const output: ServerResponse<User> = await fetch(url, {
      next: {
        // 29 minutes
        tags: [`access_token:${token}`],
        revalidate: 1740,
      },
      headers: this.baseHeaders(token),
    }).then((r) => r.json());
    if (output.status === "Success") {
      return output.data;
    }
    return null;
  }
  async register(username: string, alias: string | undefined, password: string, content_key: string, content_iv: Uint8Array): Promise<AccessToken | null> {
    const url = sc(this.url, "/account/register");
    console.log("jsn payload", JSON.stringify({ username, password, first_name: alias, content_key }))
    const output: ServerResponse<AccessToken> = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, first_name: alias, content_key, content_iv }),
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
