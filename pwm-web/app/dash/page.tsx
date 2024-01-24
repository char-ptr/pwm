import { useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function DashPage() {
  const user = await useLoggedIn();
  if (!user) return redirect("/login");
  return <p>hello <Suspense fallback={<p>unjknown</p>}>
    {JSON.stringify(user)}
  </Suspense></p>;
}
