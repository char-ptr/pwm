import HeroiconsMagnifyingGlass16Solid from "@/components/icons/HeroiconsMagnifyingGlass16Solid";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  return <div className="flex-1 h-full" >
    <div className="relative " >
      <Input className="pl-12 dark:bg-neutral-900 text-xl border-0 focus-visible:ring-offset-0" placeholder="Search passwords" />
      <HeroiconsMagnifyingGlass16Solid className="text-neutral-500 h-full py-1 w-auto aspect-square absolute inset-y-0 my-auto left-1" />
    </div>
  </div>

}
