"use client";

import { selectedItem } from "@/lib/state/app";
import { useAtom } from "jotai";
import { LucideEye, LucideEyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
  a: string;
}
export default function ClientVaultRender(a: Props) {
  const [selected_item, _] = useAtom(selectedItem);
  const [hide_password, set_hide_password] = useState(true);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl">{selected_item?.name}</h1>
      <div className="flex gap-4">
        <div className="p-4 rounded-lg bg-neutral-700 px-8 text-xl flex">
          {selected_item?.username}
        </div>
        <div className="p-4 flex-auto  rounded-lg bg-neutral-700 text-xl flex max-w-sm">
          <input
            readOnly
            className="appearance-none bg-transparent border-none"
            value={
              hide_password
                ? selected_item?.password
                  ?.split("")
                  .map((_) => "*")
                  .join("")
                : selected_item?.password
            }
          />

          <button
            type="button"
            className="ml-auto cursor-pointer"
            onClick={set_hide_password.bind(null, !hide_password)}
          >
            {hide_password ? (
              <LucideEyeOff />
            ) : (
              <LucideEye className="ml-auto cursor-pointer" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
