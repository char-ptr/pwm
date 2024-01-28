import BackgroundImage from "@/assets/lbk2.png";
import { useLoggedIn } from "@/lib/hooks/checkLogin";
import Link from "next/link";
import { IntrnLoginPage } from "./IntrnLoginPage";
import Image from "next/image";
export default async function LoginPage() {
  const user = await useLoggedIn();

  return (
    <div
      className="w-full h-full min-h-screen"
    >
      <Image className="w-full h-full absolute inset-0 object-cover object-right" alt={"background image"} src={BackgroundImage} />
      <div className="absolute left-4 max-w-sm w-screen top-0 h-screen py-4">
        <div className="h-full grid text-white grid-rows-3 rounded-xl p-5 border border-pink-900/40 bg-pink-400/20 backdrop-blur-md">
          <div className="flex-1 gap-2 justify-center items-center flex flex-col">
            <h1 className="text-4xl">{user?.user ? "Welcome back" : "Welcome to PWM."}</h1>
            <h3 className="text-xl text-center">{user?.user ? "To unlock your vault please enter your password." : "Please enter your login details:"}</h3>
          </div>
          <div className="row-span-2 w-full items-stretch flex flex-col gap-5">
            <IntrnLoginPage user={user} />
            <p>
              Don&apos;t have an account? Register{" "}
              <Link
                className="underline text-pink-300 hover:text-pink-500 transition-colors"
                href="/register"
              >
                here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
