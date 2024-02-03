import sw from "@/lib/serverWrapper";
import { ClientVaultItems } from "./clientVaultItems";
import { Suspense } from "react";

// this component will need to be server rendered to get the inital list of items, and then a inner component will regularly poll the server for updates
export async function VaultItemList({ token }: { token: string }) {
  const all_items = await sw.items(token);
  console.log("items", all_items);
  return (
    <Suspense>
      <ClientVaultItems token={token} serverItems={all_items ?? []} />
    </Suspense>
  );
}
