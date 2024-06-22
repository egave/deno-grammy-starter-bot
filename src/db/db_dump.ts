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

// https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
function replacer(_key: unknown, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

function writeJson(path: string, data: object): string {
    try {
      Deno.writeTextFileSync(path, JSON.stringify(data, replacer, 2));
  
      return "Written to " + path;
    } catch (e) {
      return e.message;
    }
  }

const items = await Array.fromAsync(
  kv.list({ prefix: [] }),
  ({ key, value }) => ({ key, value }),
);
console.log(writeJson("./backup_db.json",items));

kv.close();