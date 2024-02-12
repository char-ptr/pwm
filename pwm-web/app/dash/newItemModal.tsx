"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
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
import { Textarea } from "@/components/ui/textarea";
const itemSchema = z.object({
	password: z.string().min(8).max(100),
	username: z.string().min(3),
	name: z.string().min(3),
	icon_url: z.string().url(),
	notes: z.string().max(1000).default(""),
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
		let icon_final = values.icon_url;
		const icon_url = new URL(values.icon_url);
		if (icon_url.pathname.length === 0) {
			const ddg_ico_p1 = new URL(values.icon_url).hostname;
			icon_final = `https://icons.duckduckgo.com/ip3/${ddg_ico_p1}.ico`;
		}
		values.icon_url = encryptWithConKey(contentKey, icon_final);
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
	// you kinda have to do this according to the react-hook-form documentation
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
					<DialogContent className="max-w-xl">
						<DialogHeader>
							<DialogTitle>New Item</DialogTitle>
							<DialogDescription>
								Add a new login into your vault!
							</DialogDescription>
						</DialogHeader>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="grid grid-cols-2 gap-8"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="col-span-2">
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
											<FormLabel>Username</FormLabel>
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
								<FormField
									control={form.control}
									name="icon_url"
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>Website</FormLabel>
											<FormControl>
												<Input type="url" placeholder="icon url.." {...field} />
											</FormControl>
											<FormDescription>
												enter only a hostname to use ddg favicon service
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>Notes</FormLabel>
											<FormControl>
												<Textarea placeholder="Notes..." {...field} />
											</FormControl>
											<FormDescription>
												Any notes you'd like to add?
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter className="col-span-2">
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
