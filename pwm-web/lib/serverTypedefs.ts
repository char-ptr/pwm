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
interface User {
  user_id: string;
  username: string;
  alias: string;
  content_key: string;
  user_created_at: string;
}
