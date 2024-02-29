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
    selected_item && (
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl">{selected_item?.name}</h1>
        <div className="flex flex-col divide-y-2 divide-neutral-500 border-neutral-500 border-2 rounded-lg">
          <div className="p-4 rounded-lg px-8 text-xl flex flex-col">
            <label className="text-base text-pink-500">username</label>
            <input
              readOnly
              className="appearance-none bg-transparent border-none"
              value={selected_item?.username}
            />
          </div>
          <div>
            <div className="p-4 rounded-lg px-8 text-xl flex flex-col">
              <label className="text-base text-pink-500">password</label>
              <div className="flex items-center">
                <input
                  readOnly
                  className="w-full appearance-none bg-transparent border-none"
                  type={hide_password ? "password" : "text"}
                  value={selected_item?.password}
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
        </div>
      </div>
    )
  );
}
