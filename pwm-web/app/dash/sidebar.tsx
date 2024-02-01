import asukaPfp from "@/assets/askpfp.png"
import { Button } from "@/components/ui/button";
import { useLoggedIn } from "@/lib/hooks/checkLogin";
import Image from "next/image";

export async function SideBar() {
  const { user, access_token } = await useLoggedIn();
  return <div className="w-full flex-col h-full flex p-5 text-white gap-24" >
    <div className="grid h-20 grid-flow-col items-center justify-center grid-cols-4">
      <Image className="outline-neutral-800/60 shadow-xl outline outline-1 outline-offset-1 object-fill select-none aspect-square rounded-full flex-[.30]" src={asukaPfp} alt="profile picture" />
      <p className="flex-1 col-span-3 px-6 text-lg">
        {user?.username}
      </p>
    </div>
    <div>
      <p className="uppercase select-none text-sm font-extrabold pb-1" >Vaults</p>
      <div className="flex flex-col">
        <Button variant={"ghost"} className="gap-5 h-12 text-xl text-left hover:bg-neutral-100/10 items-center justify-start hover:text-white" >
          <Image className="w-auto h-full object-contain shadow-md select-none aspect-square rounded-full" src={asukaPfp} alt="profile picture" />
          Me
        </Button>
      </div>
    </div>

  </div>
}
