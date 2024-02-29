import BackgroundImage from "@/assets/lbk2.png";
import RegisterForm, { registerFormSchema } from "./RegisterForm";
import * as z from "zod";
import { cookies } from "next/headers";
import { useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function LoginPage() {
  const user = await useLoggedIn();
  if (user.user) {
    console.log("already logged in ", user.user);
    redirect("/dash");
  }
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
            <h1 className="text-4xl">Welcome to PWM.</h1>
            <h3 className="text-xl">Please enter the registration details</h3>
          </div>
          <div className="row-span-2 w-full items-stretch flex flex-col gap-5">
            <RegisterForm />
            <p>
              Already have an account? Login{" "}
              <Link
                className="underline text-pink-300 hover:text-pink-500 transition-colors"
                href="/login"
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
