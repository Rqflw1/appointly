import { S3Client } from "@aws-sdk/client-s3";

declare global {
  var s3Global: undefined | S3Client;
}

export const s3 =
  globalThis.s3Global ??
  new S3Client({
    endpoint: process.env.SCW_ENDPOINT,
    region: process.env.SCW_REGION,
    credentials: {
      accessKeyId: process.env.SCW_ACCESS_KEY || "",
      secretAccessKey: process.env.SCW_SECRET_KEY || ""
    }
  });

if (process.env.NODE_ENV !== "production") globalThis.s3Global = s3;
