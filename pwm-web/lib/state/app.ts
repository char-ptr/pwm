import { atom } from "jotai";
import { DerivedPw } from "./key";

export const requireUnlock = atom((get) => !get(DerivedPw).length)
export const showNewItemModal = atom(false)
