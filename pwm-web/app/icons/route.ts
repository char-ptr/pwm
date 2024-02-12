import { useRouter } from "next/router";

export async function GET(request: Request) {
	const { query } = useRouter();
}
