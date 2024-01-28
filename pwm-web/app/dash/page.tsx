import { useGetTokens, useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
import { KeyChecker } from "./KeyChecker";

export default async function DashPage() {
  const { user, access_token } = await useLoggedIn();
  const tokens = await useGetTokens(access_token);
  if (!user) return redirect("/login");
  if (!tokens) return redirect("/login");
  return (
    <div>
      <KeyChecker tokens={tokens} />
    </div>
  );

}
