import aesjs from "aes-js";
import { pbkdf2Sync, pseudoRandomBytes } from "crypto";
export function decryptContentKey(
	enc_key: Uint8Array,
	iv: Uint8Array,
	derivedPw: Uint8Array,
) {
	const cbc = new aesjs.ModeOfOperation.cbc(derivedPw, iv);
	return cbc.decrypt(enc_key);
}
export function createDerivedKey(pw: string) {
	const salt = pseudoRandomBytes(64);
	const out_key = pbkdf2Sync(pw, salt, 4, 32, "sha512");
	return { out_key, salt };
}
