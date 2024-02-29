import { useRouter } from "next/navigation";

export async function GET(request: Request) {
  // const { query } = useRouter();
  return new Response("hi!");
}
