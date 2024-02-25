const alg = {
  name: 'RSA-OAEP',
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
};

const bufToText = (buf) => {
  return String.fromCharCode(...new Uint8Array(buf));
};

const textToBuf = (text) => {
  const buf = new ArrayBuffer(text.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < text.length; i++) {
    bufView[i] = text.charCodeAt(i);
  }
  return buf;
};

const keyToBase64 = async (key) => {
  const buf = await window.crypto.subtle.exportKey('spki', key);
  const bin = bufToText(buf);
  const base64 = window.btoa(bin);
  return base64;
};

const base64ToKey = async (base64) => {
  const bin = window.atob(base64);
  const buf = textToBuf(bin);
  const key = await window.crypto.subtle.importKey('spki', buf, alg, true, ['encrypt']);
  return key;
};

export const genKeys = async () => {
  const keypair = await window.crypto.subtle.generateKey(alg, true, ['encrypt', 'decrypt']);
  const publicKey = await keyToBase64(keypair.publicKey);
  const privateKey = keypair.privateKey;
  return { publicKey, privateKey };
};

export const encrypt = async (publicKey, data) => {
  const key = await base64ToKey(publicKey);
  const buf = await window.crypto.subtle.encrypt(alg, key, textToBuf(data));
  return bufToText(buf);
};

export const decrypt = async (privateKey, data) => {
  const buf = await window.crypto.subtle.decrypt(alg, privateKey, textToBuf(data));
  return bufToText(buf);
};