import kv from '../db/db.ts'
import type { KvCommitResult, KvCommitError } from '../db/db.ts'
import { formatDateKeys } from '../helpers/dateHelpers.ts'
import { getRandomRetryDelay } from '../helpers/dbHelpers.ts'
import { DEFAULTS, KVKeyNames } from '../config.ts'
import { Profile } from '../models/profile.ts'


/*
export async function getProfile(idUser: number): Promise<Profile | null> {
    const primaryKey = [KVKeyNames.PROFILES, idUser];
    const profileRes = await kv.get<Profile>(primaryKey);
    if (profileRes.value !== null) {
        const rawProfile = profileRes.value as Partial<Profile>;
        // Rehydrate rawProfile into a Profile instance
        const profile: Profile = Profile.fromObject(rawProfile);
        return profile;
    }
    else
        return null;
}
*/
export async function getProfile(idUser: number): Promise<Profile | null> {
  // Lire le profile depuis la base de données
  const profileRes = await kv.get<Profile>([KVKeyNames.PROFILES, idUser] as const);

  // Si le profil est absent, on retourne null
  if (profileRes.value === null) return null;

  const rawProfile = profileRes.value as Partial<Profile>;

  // Rehydrater le profil
  const profile = new Profile(
    rawProfile.creationDate!,
    rawProfile.baseProfile!,
    rawProfile.bio,
    rawProfile.photos
  );

  return profile;
}
/*
export async function getProfiles(userIds: number[]): Promise<Profile[]> {
    // Fetch profiles from the database using getMany
    const profiles = await kv.getMany<Profile>(
        userIds.map(id => [KVKeyNames.PROFILES, id]) // Map each driverId to the profiles key
    );

    // Filter out any profiles that are null and return only valid profiles
    const validProfiles: Profile[] = [];
    
    for (const profile of profiles) {
        if (profile.value !== null) {
            validProfiles.push(profile.value); // Add the valid profile to the array
        }
    }

    return validProfiles; // Return the array of valid profiles
}*/
/**
 * Récupère la liste de profils associés aux `userIds`, avec leurs compteurs
 * `nbTripsAsDriver` et `nbTripsAsPassenger` alimentés.
 */
export async function getProfiles(userIds: number[]): Promise<Profile[]> {
  /* 1) — Lecture KV en parallèle --------------------------------------------- */
  const [profileEntries, driverEntries, passengerEntries] = await Promise.all([
    kv.getMany<Profile>(
        userIds.map(id => [KVKeyNames.PROFILES, id] as const)
    ),
    kv.getMany<number>(
        userIds.map(id => [KVKeyNames.PROFILES, KVKeyNames.L2_DRIVER_COUNT, id] as const)
    ),
    kv.getMany<number>(
        userIds.map(id => [KVKeyNames.PROFILES, KVKeyNames.L2_PASSENGER_COUNT, id] as const)
    ),
  ]);

  /* 2) — Reconstruction des objets ------------------------------------------- */
  const results: Profile[] = [];

  userIds.forEach((id, i) => {
    const rawProfile = profileEntries[i]?.value;
    if (!rawProfile) return;                       // Profil absent → on ignore

    // Les compteurs peuvent être `null` si jamais la clef n’existe pas encore
    //const nbTripsAsDriver    = Number(driverEntries[i]?.value.valueOf() ?? 0);
    const nbTripsAsDriver = Number(driverEntries[i]?.value ?? 0);
    //const nbTripsAsPassenger = Number(passengerEntries[i]?.value.valueOf() ?? 0);
    const nbTripsAsPassenger = Number(passengerEntries[i]?.value ?? 0);
    
    // Si le profil vient du KV sous forme d’objet “plat”, on le re-mappe sur la classe
    const profile = new Profile(
      rawProfile.creationDate,
      rawProfile.baseProfile,
      rawProfile.bio,
      rawProfile.photos,
      nbTripsAsDriver,
      nbTripsAsPassenger,
    );

    results.push(profile);
  });

  /* 3) — Retour --------------------------------------------------------------- */
  return results;
}

export async function insertProfile(p: Profile): Promise<KvCommitResult | KvCommitError> {
    const primaryKey = [KVKeyNames.PROFILES, p.getUserId()]; // Création de la clé primaire du trajet
    const totalProfilesKey = [KVKeyNames.STATS, KVKeyNames.L2_TOTAL_PROFILES];
    const totalProfilesByGenderKey = [KVKeyNames.STATS, KVKeyNames.L2_TOTAL_PROFILES, KVKeyNames.L3_BY_GENDER, p.getBaseProfile().gender];
    const age = p.getBaseProfile().getAge();
    const keyAge = age ? age.toString() : 'notset';
    const totalProfilesByAgeKey = [KVKeyNames.STATS, KVKeyNames.L2_TOTAL_PROFILES, KVKeyNames.L3_BY_AGE, keyAge];
    // Generate date string (yyyymmdd format)
    const creationDateKeys = formatDateKeys(new Date(p.creationDate));
    console.log(creationDateKeys);

    const totalProfilesPerDatePartialKey = [KVKeyNames.STATS, KVKeyNames.L2_TOTAL_PROFILES];
    
    let res: KvCommitResult | KvCommitError = { ok: false, errorCode: "ERR_UNKWOWN" };

    let i: number = 0;
    while (!res.ok && i < DEFAULTS.KV.NB_RETRIES) {
        i++;
        // Perform atomic database operations
        try {
            res = await kv.atomic()
                .check({ key: primaryKey, versionstamp: null })
                .set(primaryKey, p)
                .sum(totalProfilesKey, 1n)
                .sum(totalProfilesByGenderKey, 1n)
                .sum(totalProfilesByAgeKey, 1n)
                .sum([...totalProfilesPerDatePartialKey, creationDateKeys.yyyymmdd], 1n)
                .sum([...totalProfilesPerDatePartialKey, creationDateKeys.yyyymm], 1n)
                .sum([...totalProfilesPerDatePartialKey, creationDateKeys.yyyy], 1n)
                .commit();

            if (!res.ok) {
                res.errorCode = "ERR_PROFILE_EXISTS";
                return res;
            }
        } catch (error) {
            console.error("Error when trying to save Profile: ", error);
            // Retry after a brief delay
            await new Promise(resolve => setTimeout(resolve, getRandomRetryDelay())); // Wait before retrying
        }
    }
    if (!res.ok) {
        res.errorCode = "ERR_MAX_RETRIES_EXCEEDED";
    }
    return res;
}

export async function updateProfile(p: Profile): Promise<KvCommitResult | KvCommitError> {
    console.debug("Updating profile: ", p.baseProfile.userId);

    let res: KvCommitResult | KvCommitError = { ok: false, errorCode: "ERR_UNKWOWN" };
    
    const primaryKey = [KVKeyNames.PROFILES, p.baseProfile.userId]; // Clé primaire du trajet
    console.debug("primaryKey ", primaryKey);
    let i: number = 0;
    
    while (!res.ok && i < DEFAULTS.KV.NB_RETRIES) {
        i++;
        try {
            const getRes1 = await kv.get<Profile>(primaryKey);
                
            if (getRes1.value !== null) {
                if (getRes1.value.baseProfile.userId === p.baseProfile.userId) {
                    
                    res = await kv.atomic()
                        .check(getRes1)
                        .set(primaryKey, p)
                        .commit();
                } else {
                    console.error("Cannot update, User ID mismatch: (p.baseProfile.userId: " + p.baseProfile.userId + "), (getRes1.value.baseProfile.userId: " + getRes1.value.baseProfile.userId + ")"); 
                    res.errorCode = "ERR_PROFILE_MISMATCH";
                    return res;
                }
            } else {
                console.error("Cannot update, Profile not found: ", p.baseProfile.userId);
                res.errorCode = "ERR_PROFILE_NOT_FOUND";
                return res;
            }                
        } catch (error) {
            console.error(`Attempt ${i} failed during profile update due to lock for user ${p.baseProfile.userId}, retrying...:`, error);
            await new Promise(resolve => setTimeout(resolve, getRandomRetryDelay())); // Pause avant de réessayer
        }
    }
    if (!res.ok) {
        res.errorCode = "ERR_MAX_RETRIES_EXCEEDED";
    }
    return res;
}

export async function deleteProfile(idProfile: number): Promise<KvCommitResult | KvCommitError> {
    console.debug("Deleting profile: ", idProfile);
    
    const primaryKey = [KVKeyNames.PROFILES, idProfile]; // Clé primaire du trajet
    
    let res: KvCommitResult | KvCommitError = { ok: false, errorCode: "ERR_UNKWOWN" };
    let i: number = 0;
    while (!res.ok && i < DEFAULTS.KV.NB_RETRIES) {
        i++;
        try {
            const getRes1 = await kv.get<Profile>(primaryKey);

            if (getRes1.value !== null) {
                res = await kv.atomic()
                .check(getRes1)
                .delete(primaryKey)
                .commit();

            } else {
                console.debug("Cannot delete, Profile not found: ", idProfile);
                res.errorCode = "ERR_PROFILE_NOT_FOUND";
                return res;
            }
        } catch (error) {
            // Handle error and log it
            console.error(`Attempt ${i} failed during profile deletion for user ${idProfile}:`, error);
            // Retry after a brief delay
            await new Promise(resolve => setTimeout(resolve, getRandomRetryDelay())); // Wait before retrying
        }
    }
    if (!res.ok) {
        res.errorCode = "ERR_MAX_RETRIES_EXCEEDED";
    }
    return res;
}

export async function deletePhotoProfile(p: Profile): Promise<KvCommitResult | KvCommitError> {
    console.debug("Deleting photo profile: ", p.baseProfile.userId);
    p.photos = [];
    return await updateProfile(p);
}