import { sc } from "./utils";

class ServerWrapper {
  readonly url: string;
  private m_accessToken?: string;
  private m_user?: User;
  get accessToken() {
    return this.m_accessToken;
  }
  get user() {
    return this.m_user;
  }

  constructor(backend_url: string) {
    this.url = backend_url;
  }
  private baseHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      access_token: token,
    };
  }
  async validateAccessToken(token: string): Promise<boolean> {
    const url = sc(this.url, "/account/me");
    const output: ServerResponse<User> = await fetch(url, {
      headers: this.baseHeaders(token),
    }).then((r) => r.json());
    if (output.status === "Success") {
      this.m_user = output.data;
      this.m_accessToken = token;
      return true;
    }
    return false;
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
      this.m_accessToken = output.data.token;
      return output.data;
    }
    return null;
  }
}
const sw = new ServerWrapper(process.env.backend_url as string);
export default sw;
