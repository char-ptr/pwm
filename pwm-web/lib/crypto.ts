import aesjs from "aes-js";
import { pbkdf2Sync, pseudoRandomBytes } from "crypto";
import { TextDecoder, TextEncoder } from "util";
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
export function encryptWithConKey(con_key: Uint8Array, to_encrypt: string): string {
  const txDecode = new window.TextEncoder();
  const encrypt_payload = txDecode.encode(to_encrypt)
  const counter = new aesjs.Counter(15);
  const cbc = new aesjs.ModeOfOperation.ctr(con_key, counter);
  const encrypted_content = cbc.encrypt(encrypt_payload);
  const encrypted_content_hex = aesjs.utils.hex.fromBytes(encrypted_content);
  return encrypted_content_hex;
}
