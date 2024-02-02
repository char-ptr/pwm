"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createDerivedKey } from "@/lib/crypto";
import { requireUnlock, showNewItemModal } from "@/lib/state/app";
import { DerivedPw } from "@/lib/state/key";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { sha256 } from "js-sha256";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const itemSchema = z.object({
  password: z.string().min(8).max(100),
  username: z.string().min(3),
  name: z.string().min(3),
  notes: z.string().max(1000).nullable(),
})
export function NewItemModal({ access }: { access: string }) {
  const [waitClient, setWaitClient] = useState(false)
  const [display, setDisplay] = useAtom(showNewItemModal)
  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
  })
  function onSubmit(values: z.infer<typeof itemSchema>) {
  }
  useEffect(() => { setWaitClient(true) }, []);
  return <>
    {waitClient &&
      <Dialog onOpenChange={setDisplay} open={display} >
        <DialogContent>
          <DialogHeader  >
            <DialogTitle>New Item</DialogTitle>
            <DialogDescription>Add a new login into your vault!</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="name..." {...field} />
                    </FormControl>
                    <FormDescription>What would you like to call this login?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Username..." {...field} />
                    </FormControl>
                    <FormDescription>
                      The username this service uses
                    </FormDescription>
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
                      <Input type="password" placeholder="password..." {...field} />
                    </FormControl>
                    <FormDescription>
                      The password this service uses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add!</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    }
  </>
}
