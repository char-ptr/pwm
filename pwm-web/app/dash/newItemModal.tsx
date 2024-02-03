"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { encryptWithConKey } from "@/lib/crypto";
import { showNewItemModal } from "@/lib/state/app";
import { ContentKey } from "@/lib/state/key";
import { emptyUuid } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tryAddItem } from "./actions";
import { useQueryClient } from "@tanstack/react-query";
const itemSchema = z.object({
  password: z.string().min(8).max(100),
  username: z.string().min(3),
  name: z.string().min(3),
  notes: z.string().max(1000).nullish(),
  vault_id: z.string().max(1000).nullish(),
  item_id: z.string().max(1000).nullish(),
});
export function NewItemModal({ access }: { access: string }) {
  const queryClient = useQueryClient();
  const [waitClient, setWaitClient] = useState(false);
  const [resetState, setResetState] = useState(false);
  const [display, setDisplay] = useAtom(showNewItemModal);
  const [contentKey, _1] = useAtom(ContentKey);
  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
  });
  async function onSubmit(values: z.infer<typeof itemSchema>) {
    values.password = encryptWithConKey(contentKey, values.password);
    values.name = encryptWithConKey(contentKey, values.name);
    values.username = encryptWithConKey(contentKey, values.username);
    values.vault_id = emptyUuid();
    values.item_id = emptyUuid();

    console.log("submitting", values);
    const ret = await tryAddItem(access, values as VaultItem);
    console.log("server response:", ret);
    if (ret) {
      setDisplay(false);
      setResetState(true);
      queryClient.invalidateQueries({ queryKey: ["vault_items"] });
    } else {
      console.log("failurwe");
    }
  }
  useEffect(() => {
    setWaitClient(true);
  }, []);
  useEffect(() => {
    if (resetState) {
      form.reset();
      setResetState(false);
    }
  }, [resetState, form]);
  return (
    <>
      {waitClient && (
        <Dialog onOpenChange={setDisplay} open={display}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Item</DialogTitle>
              <DialogDescription>
                Add a new login into your vault!
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="name..." {...field} />
                      </FormControl>
                      <FormDescription>
                        What would you like to call this login?
                      </FormDescription>
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
                        <Input
                          type="text"
                          placeholder="Username..."
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="password..."
                          {...field}
                        />
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
      )}
    </>
  );
}
