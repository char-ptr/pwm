'use client';

import HeroiconsPlusSolid from "@/components/icons/HeroiconsPlusSolid";
import { Button } from "@/components/ui/button";
import { showNewItemModal } from "@/lib/state/app";
import { useAtom } from "jotai";

export function NewItem() {
  const [_1, setShowItemModal] = useAtom(showNewItemModal)

  return <Button onClick={() => setShowItemModal(true)} className="dark:bg-pink-500 dark:text-white dark:hover:bg-pink-600 bg-pink-500 hover:bg-pink-600 gap-3" >
    <HeroiconsPlusSolid className="h-full w-auto" />
    New Item
  </Button>
}
