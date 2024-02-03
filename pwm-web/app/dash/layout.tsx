import { Suspense } from "react";
import { SideBar } from "./sidebar";
import BackgroundImage from "@/assets/asuka.jpg";
import Image from "next/image";
import { SearchBar } from "./searchbar";
import { NewItem } from "./newitem";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-screen ">
      <Image
        className="w-full h-full absolute  inset-0 object-cover object-right "
        alt={"background image"}
        src={BackgroundImage}
      />
      <div
        className="absolute inset-4 rounded-lg "
        style={{ boxShadow: "rgb(0 0 0 / 34%) 0px 8px 11px 3px" }}
      >
        <div className="flex h-full divide-white dark:divide-black divide-x-2 divide-y-0 border-pink-400/50 dark:border-neutral-500/50 border rounded-lg">
          <div className="h-full w-full max-w-32 md:max-w-screen-sm md:flex-[.20] rounded-l-lg backdrop-blur-lg bg-pink-300/30 dark:bg-neutral-800/70">
            <Suspense fallback={<p>load...</p>}>
              <SideBar />
            </Suspense>
          </div>
          <div className="flex-1 h-full">
            <div className="h-full flex flex-col bg-neutral-200/90 backdrop-blur-xl dark:bg-neutral-800/90 rounded-r-lg ">
              <div className="gap-20 border-b border-white dark:border-black py-4 px-10 flex items-center justify-around w-full">
                <SearchBar />
                <NewItem />
              </div>
              <div className="h-full">
                {/* <Suspense> */}
                {children}
                {/* </Suspense> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
