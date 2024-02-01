"use client";
import { requireUnlock } from "@/lib/state/app";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@uidotdev/usehooks"
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { sha256 } from "js-sha256";
import { createDerivedKey } from "@/lib/crypto";
import { DerivedPw } from "@/lib/state/key";
const unlockSchema = z.object({
  password: z.string().min(8).max(100)
})
export function UnlockModal({ tokens }: { tokens: UserTokens }) {
  const [derived_key, setDerivedKey] = useAtom(DerivedPw);
  const [waitClient, setWaitClient] = useState(false)
  const [display, setDisplay] = useAtom(requireUnlock)
  const form = useForm<z.infer<typeof unlockSchema>>({
    resolver: zodResolver(unlockSchema),
  })
  function onSubmit(values: z.infer<typeof unlockSchema>) {
    const hsh = sha256(values.password);
    const localhsh = window.localStorage.getItem("keyh")

    console.log(hsh, localhsh)
    if (hsh === localhsh) {
      const derived_key = createDerivedKey(values.password, tokens.password_salt);
      setDerivedKey(Uint8Array.from(derived_key.out_key));
    }
  }
  useEffect(() => { setWaitClient(true) }, []);
  return <>
    {waitClient &&
      <Dialog open={display} >
        <DialogContent>
          <DialogHeader  >
            <DialogTitle>Unlock required</DialogTitle>
            <DialogDescription>Verify your password to continue.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="password..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Your password to login
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Unlock</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    }
  </>
}
