import { useGetTokens, useLoggedIn } from "@/lib/hooks/checkLogin";
import { DerivedPw } from "@/lib/state/key";
import { useAtom } from "jotai";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClientTest } from "./ClientTest";

export default async function DashPage() {
  const { user, access_token } = await useLoggedIn();
  if (!user) return redirect("/login");
  const tokens = await useGetTokens(access_token);
  if (!tokens) return redirect("/login");
  return (
    <div>
      hello{" "}
      <Suspense fallback={<p>unjknown</p>}>
        {JSON.stringify(user)}
        <ClientTest user={user} tokens={tokens} />
      </Suspense>
    </div>
  );
}
