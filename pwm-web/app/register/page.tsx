import BackgroundImage from "@/assets/lbk2.png";
import RegisterForm, { registerFormSchema } from "./RegisterForm";
import * as z from "zod";
import { cookies } from "next/headers";
import sw from "@/lib/serverWrapper";
import { useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
export default async function LoginPage() {
  const user = await useLoggedIn();
  if (user) {
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
          <div className="row-span-2 w-full items-stretch flex">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
