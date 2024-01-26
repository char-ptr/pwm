import { useLoggedIn } from "@/lib/hooks/checkLogin";
import { DerivedPw } from "@/lib/state/key";
import { useAtom } from "jotai";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClientTest } from "./ClientTest";

export default async function DashPage() {
	const user = await useLoggedIn();
	if (!user) return redirect("/login");
	return (
		<div>
			hello{" "}
			<Suspense fallback={<p>unjknown</p>}>
				{JSON.stringify(user)}
				<ClientTest />
			</Suspense>
		</div>
	);
}
