import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function sc(base: string, ...urlPaths: string[]) {
  const baseURL = new URL(base);
  baseURL.pathname = urlPaths.join("/");
  return baseURL;
}
export function emptyUuid() {
  return "00000000-0000-0000-0000-000000000000";
}
