import * as Crypto from "expo-crypto";

// On-device sign-in only. There is no server account: this just stops someone who
// picks up the phone from opening the app. Real accounts need backend support.

export async function newSalt(): Promise<string> {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
