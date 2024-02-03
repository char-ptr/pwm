"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { tryLogin } from "./actions";
import { sha256 } from "js-sha256";
import { useAtom } from "jotai";
import { DerivedPw } from "@/lib/state/key";
import { createDerivedKey } from "@/lib/crypto";

export const loginFormSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(100),
});
export default function LoginForm({ user }: { user?: User }) {
  const [derived_key, setDerivedKey] = useAtom(DerivedPw);
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
  });
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    // ...
    console.log(values);
    const old_pw = values.password;
    values.password = sha256.update(values.password).hex();

    window.localStorage.setItem("keyh", values.password);
    const data = await tryLogin(values);
    console.log("server response:", data);
    if (data?.tokens?.password_salt) {
      const derived_key = createDerivedKey(old_pw, data.tokens.password_salt);
      setDerivedKey(Uint8Array.from(derived_key.out_key));
    }
  }

  return (
    <Form {...form}>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          defaultValue={user?.username}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input className={""} placeholder="admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className=""
                  placeholder="xyz"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mr-auto">
          <Button
            className="dark:bg-pink-600 dark:hover:bg-pink-400"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
