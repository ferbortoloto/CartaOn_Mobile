/**
 * Adapter de armazenamento seguro para o Supabase.
 *
 * - iOS / Android : usa expo-secure-store (Keychain / Android Keystore).
 *   O limite por item é 2 048 bytes, então valores maiores são divididos em
 *   chunks de 1 800 bytes e reagrupados automaticamente.
 * - Web           : usa localStorage (comportamento padrão do Supabase na web).
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1800; // abaixo do limite de 2 048 bytes do SecureStore

// ── Helpers de chunking ────────────────────────────────────────────────────

function chunkString(str) {
  const chunks = [];
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    chunks.push(str.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

async function nativeGetItem(key) {
  try {
    const countStr = await SecureStore.getItemAsync(`${key}__n`);
    if (countStr) {
      const n = parseInt(countStr, 10);
      const parts = await Promise.all(
        Array.from({ length: n }, (_, i) => SecureStore.getItemAsync(`${key}__${i}`))
      );
      return parts.join('');
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function nativeSetItem(key, value) {
  if (value.length > CHUNK_SIZE) {
    const chunks = chunkString(value);
    await Promise.all(
      chunks.map((c, i) => SecureStore.setItemAsync(`${key}__${i}`, c))
    );
    await SecureStore.setItemAsync(`${key}__n`, String(chunks.length));
    await SecureStore.deleteItemAsync(key).catch(() => {});
  } else {
    await SecureStore.setItemAsync(key, value);
    await SecureStore.deleteItemAsync(`${key}__n`).catch(() => {});
  }
}

async function nativeRemoveItem(key) {
  await SecureStore.deleteItemAsync(key).catch(() => {});
  const countStr = await SecureStore.getItemAsync(`${key}__n`).catch(() => null);
  if (countStr) {
    const n = parseInt(countStr, 10);
    await Promise.all([
      ...Array.from({ length: n }, (_, i) =>
        SecureStore.deleteItemAsync(`${key}__${i}`).catch(() => {})
      ),
      SecureStore.deleteItemAsync(`${key}__n`).catch(() => {}),
    ]);
  }
}

// ── Web fallback (localStorage) ────────────────────────────────────────────

const webStorage = {
  getItem:    (key) => Promise.resolve(localStorage.getItem(key)),
  setItem:    (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key) => { localStorage.removeItem(key); return Promise.resolve(); },
};

// ── Export ─────────────────────────────────────────────────────────────────

export const secureStorage = Platform.OS === 'web'
  ? webStorage
  : {
      getItem:    nativeGetItem,
      setItem:    nativeSetItem,
      removeItem: nativeRemoveItem,
    };
