"use client";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { MutableRefObject } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const itemSchema = z.object({
	password: z.string().min(8).max(100),
	username: z.string().min(3),
	folder_id: z.string().max(1000).optional(),
	name: z.string().min(3),
	icon_url: z.string().url(),
	notes: z.string().max(1000).default(""),
	vault_id: z.string().max(1000).nullish(),
	item_id: z.string().max(1000).nullish(),
	websites: z.object({ uri: z.string() }).array().default([]),
});

interface ItemFormProps {
	submitcb: (values: z.infer<typeof itemSchema>) => void;
	request_reset: MutableRefObject<null | (() => void)>;
}
export default function FormNewItem(props: ItemFormProps) {
	const form = useForm<z.infer<typeof itemSchema>>({
		resolver: zodResolver(itemSchema),
	});
	props.request_reset.current = () => {
		form.reset();
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(props.submitcb)}
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
								<Input type="text" placeholder="Username..." {...field} />
							</FormControl>
							<FormDescription>The username this service uses</FormDescription>
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
							<FormDescription>The password this service uses</FormDescription>
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
								Any notes you&apos;d like to add?
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
	);
}
