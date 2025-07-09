type KvCommitResult = { ok: true, versionstamp: string }
type KvCommitError = { ok: false, errorCode: string }

const { DATABASE_ID } = Deno.env.toObject();

//const BASE_URL = "https://api.deno.com/databases/";

async function getKv() {
    try {
        const startTime = Date.now();
        // const kv = DATABASE_ID
        // ? await Deno.openKv(`${BASE_URL}${DATABASE_ID}/connect`)
        // : await Deno.openKv();
        const kv = await Deno.openKv();
        const duration = Date.now() - startTime;

        console.debug(
        DATABASE_ID
            ? `Connected to remote KV store: ${DATABASE_ID} (took ${duration}ms)`
            : `Opened local KV store (took ${duration}ms)`
        );

        // Wrap kv methods with timing
        return {
            get: async <T>(key: (number | string)[]) => {
                const start = Date.now();
                const result = await kv.get<T>(key);
                console.debug(`KV get(${JSON.stringify(key)}) took ${Date.now() - start}ms`);
                return result;
            },
            set: async (key: (number | string)[], value: any) => {
                const start = Date.now();
                const result = await kv.set(key, value);
                console.debug(`KV set(${JSON.stringify(key)}) took ${Date.now() - start}ms`);
                return result;
            },
            delete: async (key: (number | string)[]) => {
                const start = Date.now();
                await kv.delete(key);
                console.debug(`KV delete(${JSON.stringify(key)}) took ${Date.now() - start}ms`);
            },
            list: <T>(selector: KvListSelector, options?: KvListOptions) => {
                //const start = Date.now();
                const iterator = kv.list<T>(selector, options);
                //console.debug(`KV list(${JSON.stringify(selector)}) initiated in ${Date.now() - start}ms`);
                return iterator; // Return the original async iterable directly
            },
            getMany: async <T>(keys: (number | string)[][]) => {
                const start = Date.now();
                const result = await kv.getMany<T>(keys);
                console.debug(`KV getMany(${JSON.stringify(keys)}) took ${Date.now() - start}ms`);
                return result;
            },
            atomic: () => {
                const atomicOp = kv.atomic();
                const originalCommit = atomicOp.commit;
        
                atomicOp.commit = async () => {
                    const start = Date.now();
                    const result = await originalCommit.call(atomicOp);
                    console.debug(`KV atomic commit took ${Date.now() - start}ms`);
                    return result;
                };
        
                return atomicOp;
            },
            close: () => {
                const start = Date.now();
                kv.close();
                console.debug(`KV close took ${Date.now() - start}ms`);
            }
        };
    } catch (error) {
        console.error("Failed to open KV store:", error);
        throw error;
    }
}

const kv = await getKv();

export default kv;
export type { KvCommitResult, KvCommitError };
