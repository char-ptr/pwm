import { pbkdf2Sync, pseudoRandomBytes } from "crypto";
import { TextDecoder, TextEncoder } from "util";
import aesjs from "aes-js";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { ContentKey } from "./state/key";
export function decryptContentKey(
  enc_key: Uint8Array,
  iv: Uint8Array,
  derivedPw: Uint8Array,
) {
  const cbc = new aesjs.ModeOfOperation.cbc(derivedPw, iv);
  return cbc.decrypt(enc_key);
}
export function createDerivedKey(pw: string, salt: Uint8Array) {
  const _salt = new Uint8Array(salt);
  const out_key = pbkdf2Sync(pw, _salt, 4, 32, "sha512");
  return { out_key, salt: _salt };
}
export function encryptWithConKey(
  con_key: Uint8Array,
  to_encrypt: string,
): string {
  const txDecode = new window.TextEncoder();
  const encrypt_payload = txDecode.encode(to_encrypt);
  const counter = new aesjs.Counter(15);
  const cbc = new aesjs.ModeOfOperation.ctr(con_key, counter);
  const encrypted_content = cbc.encrypt(encrypt_payload);
  const encrypted_content_hex = aesjs.utils.hex.fromBytes(encrypted_content);
  return encrypted_content_hex;
}

function hexToBytes(hex: string) {
  const key = "0123456789abcdef";
  const newBytes = [];
  let currentChar = 0;
  let currentByte = 0;
  for (let i = 0; i < hex.length; i++) {
    // Go over two 4-bit hex chars to convert into one 8-bit byte
    currentChar = key.indexOf(hex[i]);
    if (i % 2 === 0) {
      // First hex char
      currentByte = currentChar << 4; // Get 4-bits from first hex char
    }
    if (i % 2 === 1) {
      // Second hex char
      currentByte += currentChar; // Concat 4-bits from second hex char
      newBytes.push(currentByte); // Add byte
    }
  }
  return new Uint8Array(newBytes);
}
export function decryptWithConKey(
  con_key: Uint8Array,
  to_encrypt: string,
): string {
  const decrypt_payload = hexToBytes(to_encrypt);
  const counter = new aesjs.Counter(15);
  const cbc = new aesjs.ModeOfOperation.ctr(con_key, counter);
  const decrypted_content = cbc.decrypt(decrypt_payload);
  const decrypted_content_hex = aesjs.utils.utf8.fromBytes(decrypted_content);
  return decrypted_content_hex;
}
export function UseDecrypt<T extends object>(object: T, conkey?: Uint8Array) {
  const conkey2 = useAtom(ContentKey);
  return useMemo(() => {
    const contentKey = conkey || conkey2[0];
    if (contentKey.length === 0) {
      return object;
    }
    const old = { ...object };
    if (contentKey.length === 0) {
      return old;
    }
    for (const [k, v] of Object.entries(object)) {
      if (typeof v === "string") {
        /// this is incredibly stupid
        old[k as unknown as keyof typeof old] = decryptWithConKey(
          contentKey,
          v,
        ) as unknown as (typeof old)[keyof typeof old];
      }
    }
    return old;
  }, [object, conkey2[0]]);
}
