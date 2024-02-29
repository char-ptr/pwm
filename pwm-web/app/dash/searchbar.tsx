"use client";
import HeroiconsMagnifyingGlass16Solid from "@/components/icons/HeroiconsMagnifyingGlass16Solid";
import { Input } from "@/components/ui/input";
import { searchItemQuery } from "@/lib/state/app";
import { useAtom } from "jotai";

export function SearchBar() {
  const [search, set_search] = useAtom(searchItemQuery);

  return (
    <div className="flex-1 h-full">
      <div className="relative ">
        <Input
          onInput={(x) => set_search(x.currentTarget.value)}
          value={search}
          className="pl-12 dark:bg-neutral-900 text-xl border-0 focus-visible:ring-offset-0"
          placeholder="Search passwords"
        />
        <HeroiconsMagnifyingGlass16Solid className="text-neutral-500 h-full py-1 w-auto aspect-square absolute inset-y-0 my-auto left-1" />
      </div>
    </div>
  );
}
