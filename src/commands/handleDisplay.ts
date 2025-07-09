import handleProfile from './handleProfile.ts'
import type { Profile } from '../models/profile.ts'

export default async function handleDisplay(ctx: CustomContext) {
    console.log('** command /voir');
    
    if (!ctx.session.data.profile || !ctx.session.data.profile.baseProfile) {
        console.debug('Le profil n\'existe pas, on renvoie vers la commande /profil');
        await handleProfile(ctx);
    }
    else {
        await displayProfile(ctx);
    }
}

export const displayContact = (profile: Profile): string => {
    if (profile.baseProfile!.firstName) 
        return `<a href="tg://user?id=${profile.baseProfile!.userId}">${profile.baseProfile!.firstName}</a>`;
    else if (profile.baseProfile!.username) 
        return `@${profile.baseProfile!.username}`;
    else
        return `<a href="tg://user?id=${profile.baseProfile!.userId}">${profile.baseProfile!.userId}</a>`;
}

export async function displayProfile(_ctx: CustomContext) {
    const profile = _ctx.session.data.profile as Profile;
    if (profile.photos !== undefined && profile.photos.length > 0) {
        console.debug('Photo de profil trouvée, on l\'envoie');
        console.debug('file_id: ', profile.photos[0].file_id);
        const file_id = profile.photos[0].file_id;
        // Send via file_id.
        await _ctx.api.sendPhoto(_ctx.from!.id, file_id,
            { caption: _ctx.t('profile-view', { 
                gender: profile.baseProfile!.gender,
                age: profile.baseProfile!.age,
                postal_code: profile.baseProfile!.postal_code,
                bio: profile.baseProfile!.bio,
                contact: displayContact(profile),
            }),
            parse_mode: "HTML" });
    }
    else
        await _ctx.reply(_ctx.t('profile-view', {
                gender: profile.baseProfile!.gender,
                age: profile.baseProfile!.age,
                postal_code: profile.baseProfile!.postal_code,
                bio: profile.baseProfile!.bio,
                contact: displayContact(profile),
            }),
            { parse_mode: "HTML" });
}
