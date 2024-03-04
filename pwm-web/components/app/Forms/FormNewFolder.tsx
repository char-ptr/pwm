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
// pub folder_id: Uuid,
// pub vault_id: Uuid,
// pub parent_folder_id: Option<Uuid>,
// pub name: String,
// pub icon_url: Option<String>,

export const folderSchema = z.object({
	parent_folder_id: z.string().optional(),
	vault_id: z.string().optional(),
	folder_id: z.string().optional(),
	name: z.string().min(3),
	icon_url: z.string().optional(),
});

interface FolderFormProps {
	submitcb: (values: z.infer<typeof folderSchema>) => void;
	request_reset: MutableRefObject<null | (() => void)>;
}
export default function FormNewFolder(props: FolderFormProps) {
	const form = useForm<z.infer<typeof folderSchema>>({
		resolver: zodResolver(folderSchema),
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
				<DialogFooter className="col-span-2">
					<Button type="submit">Add!</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
