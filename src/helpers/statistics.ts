import kv from '../db/db.ts'
import { i18n } from '../bot.ts'
import { Profile, Gender } from '../types/profile.ts'

export async function computeProfileStatistics(): Promise<string> {
    console.debug('Récupère tous les profils en BDD');
    // Retourne tous les profils
    const iter = kv.list<string>({ prefix: ["sessions"] });

    // Initialisation des compteurs
    let totalMen = 0;
    let totalWomen = 0;
    const ageRanges = {
        "18-25": 0,
        "26-30": 0,
        "31-35": 0,
        "36-40": 0,
        "41-45": 0,
        "46-50": 0,
        "51-55": 0,
        "56-60": 0,
        "61-65": 0,
        "66-70": 0,
        "71-99": 0
    };

    let newProfilesOneWeek = 0;
    let newProfilesOneMonth = 0;
    const profilesPerMonth = new Map<string, number>();
    const profilesPerYear = new Map<number, number>();

    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    for await (const res of iter) {
        console.debug(res.key);
        console.debug(res.value);

        const profile: Profile = res.value.profile as Profile;
        //const registrationDate = profile.registrationDate;

        //const _baseProfile: BaseProfile = res.value.baseProfile as { gender: Gender, age: number, postal_code: number, bio: string, username: string | undefined };
    
        // Incrémentation des compteurs en fonction du sexe
        if (profile.baseProfile?.gender === Gender.Man) {
            totalMen++;
        } else if (profile.baseProfile?.gender === Gender.Woman) {
            totalWomen++;
        }

        // Incrémentation des compteurs en fonction de la tranche d'âge
        const age = profile.baseProfile?.age;
        if (age) {
            if (age >= 18 && age <= 25) {
                ageRanges["18-25"]++;
            } else if (age >= 26 && age <= 30) {
                ageRanges["26-30"]++;
            } else if (age >= 31 && age <= 35) {
                ageRanges["31-35"]++;
            } else if (age >= 36 && age <= 40) {
                ageRanges["36-40"]++;
            } else if (age >= 41 && age <= 45) {
                ageRanges["41-45"]++;
            } else if (age >= 46 && age <= 50) {
                ageRanges["46-50"]++;
            } else if (age >= 51 && age <= 55) {
                ageRanges["51-55"]++;
            } else if (age >= 56 && age <= 60) {
                ageRanges["56-60"]++;
            } else if (age >= 61 && age <= 65) {
                ageRanges["61-65"]++;
            } else if (age >= 66 && age <= 70) {
                ageRanges["66-70"]++;
            } else if (age >= 71) {
                ageRanges["71-99"]++;
            }
        }

        // Count new profiles registered within one week
        if (profile.creationDate && profile.creationDate >= oneWeekAgo) {
            newProfilesOneWeek++;
        }

        // Count new profiles registered within one month
        if (profile.creationDate && profile.creationDate >= oneMonthAgo) {
            newProfilesOneMonth++;
        }

        // Count profiles registered per calendar month
        if (profile.creationDate ) {
            const monthYearKey = `${profile.creationDate .getFullYear()}-${profile.creationDate .getMonth() + 1}`;
            profilesPerMonth.set(monthYearKey, (profilesPerMonth.get(monthYearKey) || 0) + 1);

            // Count profiles registered per year
            const year = profile.creationDate .getFullYear();
            profilesPerYear.set(year, (profilesPerYear.get(year) || 0) + 1);
        }
    }

    // Sort profilesPerMonth by monthYearKey
    const sortedProfilesPerMonth = new Map([...profilesPerMonth.entries()].sort(([key1], [key2]) => {
        return new Date(key2).getTime() - new Date(key1).getTime();
    }));

    // Sort profilesPerYear by year
    const sortedProfilesPerYear = new Map([...profilesPerYear.entries()].sort(([year1], [year2]) => year2 - year1));

    // Affichage des valeurs non nulles
    let message = i18n.translate('fr', 'stat-message', { 
                                    bot_name: Deno.env.get("BOT_NAME")! }) +  "\n\n";
    if (totalMen > 0) {
        console.debug("Nombre de profils Homme:", totalMen);
        message += i18n.translate('fr', 'stat-number-men', { number: totalMen }) + "\n";      
    }
    if (totalWomen > 0) {
        console.debug("Nombre de profils Femme:", totalWomen);
        message += i18n.translate('fr', 'stat-number-women', { number: totalWomen }) + "\n\n";       
    }

    for (const [range, number] of Object.entries(ageRanges)) {
        if (number !== 0) {
            console.debug(`Nombre de profils dans la tranche d'âge ${range}:`, number);
            message += i18n.translate('fr', 'stat-by-age-range', { 
                range: range,
                number: number
            }) + "\n";
        }
    }

    // Add statistics for new profiles within one week
    console.debug(`Nombre de nouveaux profils enregistrés depuis une semaine: ${newProfilesOneWeek}\n`);
    message += "\n" + i18n.translate('fr', 'stat-new-profiles-week', { 
        number: newProfilesOneWeek
    }) + "\n";

    // Add statistics for new profiles within one month
    console.debug(`Nombre de nouveaux profils enregistrés depuis une semaine: ${newProfilesOneMonth}\n`);
    message += i18n.translate('fr', 'stat-new-profiles-month', { 
        number: newProfilesOneMonth
    }) + "\n";

    // Add statistics for profiles registered per calendar month
    // message += "Nombre de profils enregistrés par mois (du plus récent au plus ancien):\n";
    // for (const [monthYearKey, count] of sortedProfilesPerMonth) {
    //     message += `${monthYearKey}: ${count}\n`;
    // }

    // Add statistics for profiles registered per year
    // message += "Nombre de profils enregistrés par année (du plus récent au plus ancien):\n";
    // for (const [year, count] of sortedProfilesPerYear) {
    //     message += `${year}: ${count}\n`;
    // }

    return message;
}