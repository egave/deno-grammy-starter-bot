import kv from '../db/db.ts'
import  { Gender, Profile } from '../types/profile.ts'
import type { IProfile, BaseProfile } from '../types/profile.ts'

const firstNames: string[] = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack"];
const lastNames: string[] = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"];
const NB_PROFILES = 3;

// Function to generate dummy profiles
function generateDummyBaseProfiles(): BaseProfile[] {
    const dummyBaseProfiles: BaseProfile[] = [];
    for (let i = 0; i < NB_PROFILES; i++) {
        const baseProfile: BaseProfile = {
            gender: i % 2 === 0 ? Gender.Woman : Gender.Man, // Alternate between Man and Woman
            age: Math.floor(Math.random() * 80) + 18, // Random age between 18 and 97
            postal_code: Math.floor(Math.random() * 100000), // Random code postal
            bio: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`, // Sample bio
            userId: Number(`100${i}`), // Sample userId
            username: `100${i}`, // Sample username
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)], // Random first name from the list
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)] // Random last name from the list
        };
        dummyBaseProfiles.push(baseProfile);
    }
    return dummyBaseProfiles;
}

// Function to add profiles to the database
async function addProfilesToDatabase(baseProfiles: BaseProfile[]) {
    const currentDate = new Date();
    const fourMonthsAgo = new Date(currentDate);
    fourMonthsAgo.setMonth(currentDate.getMonth() - 4);

    for (let i = 0; i < baseProfiles.length; i++) {
        const userId = `100${i}`; // Generate unique user ID for each profile

        // Generate random registration date between four months ago and today
        const creationDate = new Date(fourMonthsAgo.getTime() + Math.random() * (currentDate.getTime() - fourMonthsAgo.getTime()));

        const _profile: IProfile = new Profile(creationDate, baseProfiles[i], undefined);
        
        await kv.set(["sessions", userId], {profile: _profile});
    }
}

// Function to delete profiles from the database
async function deleteProfilesFromDatabase() {
    for (let i = 0; i < NB_PROFILES; i++) {
        const userId = `100${i}`; // Generate unique user ID for each profile
        await kv.delete(["sessions", userId]);
    }
}

// Exported functions
// To add the dummy profiles into the database after testing
export async function addDummyData() {
    const dummyBaseProfiles = generateDummyBaseProfiles();

    await addProfilesToDatabase(dummyBaseProfiles);
}

// To delete the profiles from the database after testing
export async function deleteDummyData() {
   await deleteProfilesFromDatabase();
}
