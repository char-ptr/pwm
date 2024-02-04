import { useGetTokens, useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
import { KeyChecker } from "./KeyChecker";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { UnlockModal } from "./unlockModal";
import { Hider } from "./hider";
import { NewItemModal } from "./newItemModal";
import { VaultItemList } from "@/components/app/vaultItemList";

export default async function DashPage() {
  const { user, access_token } = await useLoggedIn();
  const tokens = await useGetTokens(access_token);
  if (!user) return redirect("/login");
  if (!tokens) return redirect("/login");
  return (
    <div className="h-full">
      <KeyChecker tokens={tokens} />
      <UnlockModal tokens={tokens} />
      <NewItemModal access={access_token} />
      {/* <Hider> */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="p-5">
          <VaultItemList token={access_token} />
        </ResizablePanel>
        <ResizableHandle className="bg-white dark:bg-black" />
        <ResizablePanel className="p-5">item info</ResizablePanel>
      </ResizablePanelGroup>
      {/* </Hider> */}
    </div>
  );
}
