import { useGetTokens, useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
import { KeyChecker } from "./KeyChecker";
import { Suspense } from "react";

export default async function DashPage() {
  const { user, access_token } = await useLoggedIn();
  const tokens = await useGetTokens(access_token);
  if (!user) return redirect("/login");
  if (!tokens) return redirect("/login");
  return (
    <div>
      <KeyChecker tokens={tokens} />
      <Suspense>
        {/* now we need to load all the items in the vault etc.. */}
      </Suspense>
    </div>
  );

}
