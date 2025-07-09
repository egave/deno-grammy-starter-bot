import kv from '../db/db.ts'
import { getRandomRetryDelay } from '../helpers/dbHelpers.ts'
import { DEFAULTS, KVKeyNames } from '../config.ts'
import { CGU } from '../models/cgu.ts'


export async function getCGU(idUser: number): Promise<CGU | null> {
    const primaryKey = [KVKeyNames.CGU, idUser];
    const cguRes = await kv.get<CGU>(primaryKey);
    if (cguRes.value !== null)
        return cguRes.value;
    else
        return null;
}

export async function insertCGU(uid: number, cgu: CGU): Promise<{ok: boolean}> {
    const primaryKey = [KVKeyNames.CGU, uid]; // Création de la clé primaire du trajet
    const res = await kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, cgu)
    .commit();

    if (!res.ok) {
        console.error("Error when trying to save CGU: ", res);
        throw new TypeError("CGU for user with ID " + uid + " already exists");
    }

    return res;
}

export async function updateCGU(uid: number, cgu: CGU): Promise<{ok: boolean}> {
    console.debug("Updating cgu for user: ", uid);
    
    const primaryKey = [KVKeyNames.CGU, uid]; // Création de la clé primaire du trajet
    console.debug("primaryKey ", primaryKey);
    let res = { ok: false };
    let i: number = 0;

    while (!res.ok && i < DEFAULTS.KV.NB_RETRIES) {
        i++;
        console.debug("Attempt " + i );
        const getRes1 = await kv.get<CGU>(primaryKey);
        console.debug("getRes1 timestamp ", getRes1.versionstamp);
    
        if (getRes1.value !== null) {
            try {
                res = await kv.atomic()
                .check(getRes1)
                .set(primaryKey, cgu)
                .commit();
            } catch (error) {
                console.error("Attempt " + i + " failed due to lock, retrying...", error);
                console.debug(`[${new Date().toISOString()}] Attempting to update profile for userId: ${uid}`);
                // Retry after a brief delay
                await new Promise(resolve => setTimeout(resolve, getRandomRetryDelay())); // Wait before retrying
            }
        } else {
            console.error("Cannot update, user not found: " + uid);
            break;
        }
    }
    if (!res.ok) {
        console.error("Error when trying to update CGU: ", res);
        throw new TypeError("CGU with ID " + uid);
    }
    console.log("Result of updateCGU: ", res);
    return res;
}