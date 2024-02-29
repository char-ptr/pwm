import { VaultItemList } from "@/components/app/vaultItemList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useGetTokens, useLoggedIn } from "@/lib/hooks/checkLogin";
import { redirect } from "next/navigation";
import { KeyChecker } from "./KeyChecker";
import { Hider } from "./hider";
import { NewItemModal } from "./newItemModal";
import { UnlockModal } from "./unlockModal";
import { Suspense } from "react";
import ClientVaultRender from "@/components/app/clientVaultRender";

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
          <Suspense>
            <VaultItemList token={access_token} />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle className="bg-white dark:bg-black" />
        <ResizablePanel
          maxSize={50}
          defaultSize={30}
          minSize={30}
          className="p-5"
        >
          <ClientVaultRender a="test" />
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* </Hider> */}
    </div>
  );
}
