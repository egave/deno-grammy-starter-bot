#!/bin/bash
set -a
source .env.local
set +a
deno run --allow-read --allow-write --allow-net --allow-env --unstable-kv --allow-import --watch src/poll.ts
