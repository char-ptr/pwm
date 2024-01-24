import { useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await useLoggedIn();
  redirect(user ? "/dash" : "/login")
}
