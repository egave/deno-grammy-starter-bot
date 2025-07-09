// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
/**
 * This script prints all entries in the KV database formatted as JSON. This
 * can be used to create a backup file.
 *
 * @example
 * ```bash
 * deno task db:dump > backup.json
 * ```
 */
import kv from "./db.ts";

import { s3_backup_bucket } from "../service/s3Storage.ts";

// https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
function replacer(_key: unknown, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

async function uploadToS3(key: string, value: object): Promise<string> {
  try {
    const jsonString = JSON.stringify(value, replacer, 2);
    const uint8Array = new TextEncoder().encode(jsonString);
    
    await s3_backup_bucket.putObject(
      key,
      uint8Array,
      { contentType: "application/json"}
    );
    return `Uploaded ${key} to s3`;
  } catch (e) {
    return `Failed to upload to S3: ${e.message}`;
  }
}

function writeJson(path: string, data: object): string {
    try {
      Deno.writeTextFileSync(path, JSON.stringify(data, replacer, 2));
  
      return "Written to " + path;
    } catch (e) {
      return e.message;
    }
}

export async function doDump(s3OrFile: boolean = true): Promise<void> {
  const items = await Array.fromAsync(
    kv.list({ prefix: [] }),
    ({ key, value }) => ({ key, value }),
  );

  const environment = Deno.env.get("ENVIRONMENT");
  if (!environment) {
    console.error("ENVIRONMENT is not set");
    Deno.exit(1);
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // ex. 2025-03-25T19-00-00Z
  const fileName = `libauto_kv_backup_${environment}_${timestamp}.json`;
  
  if (s3OrFile) {
    // Write to S3
    console.log(`Writing to S3 ./${fileName}...`);
    console.log(await uploadToS3(fileName, items));
  } else {
    // Write to file in local file system
    console.log(`Writing to file ./${fileName}...`);
    console.log(writeJson(`./${fileName}`,items));
  }
}

//await doDump();