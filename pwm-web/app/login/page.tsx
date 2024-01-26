import BackgroundImage from "@/assets/lbk2.png";
import { useLoggedIn } from "@/lib/hooks/checkLogin";
import Link from "next/link";
import { IntrnLoginPage } from "./IntrnLoginPage";
export default async function LoginPage() {
  const user = await useLoggedIn();

  return (
    <div
      style={{
        backgroundImage: `url(${BackgroundImage.src})`,
        backgroundSize: "cover",
        backgroundPositionX: "right",
      }}
      className="w-full h-full min-h-screen"
    >
      <div className="absolute left-4 max-w-sm w-screen top-0 h-screen py-4">
        <div className="h-full grid text-white grid-rows-3 rounded-xl p-5 border border-pink-900/40 bg-pink-400/20 backdrop-blur-md">
          <div className="flex-1 gap-2 justify-center items-center flex flex-col">
            <h1 className="text-4xl">{user?.user ? "Welcome back" : "Welcome to PWM."}</h1>
            <h3 className="text-xl text-center">{user?.user ? "To unlock your vault please enter your password." : "Please enter your login details:"}</h3>
          </div>
          <div className="row-span-2 w-full items-stretch flex flex-col gap-5">
            <IntrnLoginPage user={user} />
            <p>
              Don't have an account? Register{" "}
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
