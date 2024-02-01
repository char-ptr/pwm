'use client';

import HeroiconsPlusSolid from "@/components/icons/HeroiconsPlusSolid";
import { Button } from "@/components/ui/button";

export function NewItem() {

  return <Button className="dark:bg-pink-500 dark:text-white dark:hover:bg-pink-600 bg-pink-500 hover:bg-pink-600 gap-3" >
    <HeroiconsPlusSolid className="h-full w-auto" />
    New Item
  </Button>
}
