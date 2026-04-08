import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { AES_SECRET } from "../constants/general";

const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKek() {
  return Buffer.concat([
    Buffer.from(AES_SECRET, "base64"),
    Buffer.alloc(KEY_LENGTH)
  ]).subarray(0, KEY_LENGTH);
}

function packEncryptionData(
  dataiv: Buffer<ArrayBufferLike>,
  dataAuthTag: Buffer<ArrayBufferLike>,
  dataCiphertext: Buffer<ArrayBufferLike>
) {
  return Buffer.concat([dataiv, dataAuthTag, dataCiphertext]);
}

function unpackEncryptionData(encryptionData: Buffer<ArrayBufferLike>) {
  const dataiv = encryptionData.subarray(0, IV_LENGTH);
  const dataAuthTag = encryptionData.subarray(
    IV_LENGTH,
    IV_LENGTH + TAG_LENGTH
  );
  const dataCiphertext = encryptionData.subarray(IV_LENGTH + TAG_LENGTH);
  return [dataiv, dataAuthTag, dataCiphertext];
}

export function encryptData(data: string) {
  const kek = getKek();

  const dek = randomBytes(KEY_LENGTH);
  const dekiv = randomBytes(IV_LENGTH);
  const dekCipher = createCipheriv("aes-256-gcm", kek, dekiv);
  const dekCiphertext = Buffer.concat([
    dekCipher.update(dek),
    dekCipher.final()
  ]);
  const dekAuthTag = dekCipher.getAuthTag();
  const dekEncrypted = packEncryptionData(dekiv, dekAuthTag, dekCiphertext);

  const dataiv = randomBytes(IV_LENGTH);
  const dataCipher = createCipheriv("aes-256-gcm", dek, dataiv);
  const dataCiphertext = Buffer.concat([
    dataCipher.update(data),
    dataCipher.final()
  ]);
  const dataAuthTag = dataCipher.getAuthTag();
  const dataEncrypted = packEncryptionData(dataiv, dataAuthTag, dataCiphertext);

  return { dataEncrypted, dekEncrypted };
}

export function decryptData(
  dataEncrypted: Buffer<ArrayBuffer>,
  dekEncrypted: Buffer<ArrayBuffer>
) {
  const kek = getKek();

  const [dekiv, dekAuthTag, dekCiphertext] = unpackEncryptionData(dekEncrypted);
  const dekDecipher = createDecipheriv("aes-256-gcm", kek, dekiv);
  dekDecipher.setAuthTag(dekAuthTag);
  const dek = Buffer.concat([
    dekDecipher.update(dekCiphertext),
    dekDecipher.final()
  ]);

  const [dataiv, dataAuthTag, dataCiphertext] =
    unpackEncryptionData(dataEncrypted);
  const dataDecipher = createDecipheriv("aes-256-gcm", dek, dataiv);
  dataDecipher.setAuthTag(dataAuthTag);
  return Buffer.concat([
    dataDecipher.update(dataCiphertext),
    dataDecipher.final()
  ]).toString("utf8");
}
