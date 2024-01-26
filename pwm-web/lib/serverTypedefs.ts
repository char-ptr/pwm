type ServerResponse<T> = ServerResponseOk<T> | ServerResponseFail;

interface ServerResponseOk<T> {
  status: "Success";
  data: T;
}
interface ServerResponseFail {
  status: { Failure: ServerError };
  data: null;
}
interface ServerError {
  why: string;
  fix?: string;
}
interface AccessToken {
  token: string;
  user_id: string;
  ip: string;
  user_agent: string;
  expires_at: string;
}
interface UserTokens {
  password_salt: Uint8Array;
  content_key: string;
  content_iv: Uint8Array;
}
interface User {
  user_id: string;
  username: string;
  alias: string;
  user_created_at: string;
}
interface RegisterPayload {
  username: string;
  /// aka alias
  first_name?: string;
  password: string;
  password_salt: Uint8Array;
  content_key: string;
  content_iv: Uint8Array
}
