import { InlineKeyboard } from 'grammyjs'
import type { CustomContext } from './customContext.ts'

enum Gender {
    Man = "Man",
    Woman = "Woman"
}

interface IBaseProfile {
    userId: number,
    gender: Gender,
    birthday: number | undefined, // represented by a timestamp (e.g., Unix epoch time) in milliseconds for the user's date of birth
    // postal_code: string,
    // commune: Commune,
    username: string | undefined,
    firstName: string,
    lastName: string | undefined
}

class BaseProfile implements IBaseProfile {
  userId: number;
  firstName: string;
  gender: Gender;
  birthday: number | undefined;
  // postal_code: string;
  // commune: Commune;
  username: string | undefined;
  lastName: string | undefined;

  constructor(
      _userId: number,
      _firstName: string,
      _gender: Gender,
     _birthday: number | undefined = undefined,
      // postal_code: string,
      // commune: Commune,
      _username: string | undefined = undefined,
      _lastName: string | undefined = undefined
  ) {
      this.userId = _userId;
      this.firstName = _firstName;
      this.gender = _gender;
      this.birthday = _birthday;
      // this.postal_code = postal_code;
      // this.commune = commune;
      this.username = _username;
      this.lastName = _lastName;
  }

  // Method to calculate the age based on birthday
  getAge(): number | undefined {
    if (!this.birthday)
      return;
    
    // Convert birthday from seconds to milliseconds
    const birthdayMilliseconds = this.birthday * 1000;

    // Create Date objects
    const birthDate = new Date(birthdayMilliseconds);
    const today = new Date();

    // Calculate age in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust if birthday hasn't happened yet this year
    if (
        today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    //console.debug("Calculated Age:", age);
    return age;
  }


  // Optional static method to create an instance from a partial object
  static fromObject(obj: Partial<BaseProfile>): BaseProfile {
      if (!obj.userId || !obj.firstName || !obj.gender) {
          throw new Error("Invalid BaseProfile: missing required fields");
      }
      return new BaseProfile(
          obj.userId!,
          obj.firstName!,
          obj.gender!,
          obj.birthday,
          // obj.postal_code,
          // obj.commune,
          obj.username,
          obj.lastName
      );
  }
}


type Photo = {
    file_id: string,
    file_unique_id: string,
    file_size: number | undefined,
    width: number,
    height: number
}

type PhotoProfile = Photo[];

// ["users", "Profile", userId]
interface IProfile {
    creationDate: string,
    baseProfile: IBaseProfile, // Encapsulates IBaseProfile properties
    bio: string | undefined,
    photos: PhotoProfile | undefined
}

class Profile implements IProfile {
    creationDate: string
    baseProfile: BaseProfile // Encapsulates BaseProfile properties
    bio: string | undefined
    photos: PhotoProfile | undefined

    constructor (_creationDate: string, _baseProfile: BaseProfile, 
                _bio?: string | undefined, _photos?: PhotoProfile | undefined) {
      this.creationDate = _creationDate;
      this.baseProfile = new BaseProfile(_baseProfile.userId, _baseProfile.firstName, _baseProfile.gender, _baseProfile.birthday, _baseProfile.username, _baseProfile.lastName);
      if (_bio)
        this.bio = _bio
      if (_photos)
        this.photos = _photos
    };

  getProfile () {
    return this;
  }

  getCreationDate () {
    return this.creationDate;
  }

  getBaseProfile () {
    return this.baseProfile;
  }

  getUserId () {
    return this.baseProfile.userId;
  }

  getBio () {
    return this.bio;
  }

  getPhotos () {
    return this.photos;
  }

  getMembershipDuration(ctx: CustomContext): string {
    const creationDateUTC = new Date(this.creationDate);
    const now = new Date();

    let years = now.getFullYear() - creationDateUTC.getFullYear();
    let months = now.getMonth() - creationDateUTC.getMonth();
    let days = now.getDate() - creationDateUTC.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (years > 1) {
        if (months === 0)
          return ctx.t('profile-year-duration-text', {"years": years});
        else
          return ctx.t('profile-year-month-duration-text', {"years": years, "months": months});
        //return `${years} ans${months > 0 ? ` et ${months} mois` : ''}`;
    } else if (months > 1) {
        return ctx.t('profile-month-duration-text', {"months": months});
        //return `${months} mois`;
    } else {
        return ctx.t('profile-day-duration-text', {"days": days});
        //return `${days} jours`;
    }
  }
  // Utility to display contact
  displayContact(): string {
    const base = this.baseProfile;
    if (base.firstName) 
        return `<a href="tg://user?id=${base.userId}">${base.firstName}</a>`;
    else if (base.username) 
        return `@${base.username}`;
    else 
        return `<a href="tg://user?id=${base.userId}">${base.userId}</a>`;
  }

  // Utility to generate profile text
  getProfileText(ctx: CustomContext): string {
    const ageText: string = this.baseProfile.getAge() ? ctx.t('age-text', {"age":this.baseProfile.getAge()!}) : '';

    return ctx.t('profile-view', {
        "title": "Mon Profil",
        "gender": this.baseProfile.gender,
        "age": ageText,
        "membership": this.getMembershipDuration(ctx),
        // postalCode: this.baseProfile.postal_code,
        // municipality: this.baseProfile.commune.nom_commune_complet,
        "bio": this.bio || '',
        "contact": this.displayContact()
    });
  }

  // Method to display the profile
  async display(ctx: CustomContext, keyboard?: InlineKeyboard): Promise<void> {
    const profileText = this.getProfileText(ctx);

    if (this.photos && this.photos.length > 0) {
        console.debug('Profile photo found, sending...');
        const file_id = this.photos[0].file_id;
        console.debug('file_id: ', file_id);

        try {
          await ctx.api.sendPhoto(ctx.from!.id, file_id, {
              caption: profileText,
              reply_markup: keyboard,
              parse_mode: "HTML",
          });

          return;
        } catch (error) {
            console.error(`Failed to send photo with file_id ${file_id}:`, error);
        }
    }
    // If no photo is found, or a problem occured when sending the profile
    // with the photo, then send the profile text without photo
    await ctx.reply(profileText, {
        reply_markup: keyboard,
        parse_mode: "HTML",
    });
  }

  static fromObject(obj: Partial<Profile>): Profile {
    if (!obj.creationDate || !obj.baseProfile) {
      throw new Error("Invalid Profile: missing required fields");
    }
    return new Profile(
        obj.creationDate,
        BaseProfile.fromObject(obj.baseProfile), // Delegate to BaseProfile.fromObject
        obj.bio,
        obj.photos
    );
  }
}

export function createInitialProfile() {
    return undefined;
  }

export { Profile, BaseProfile, Gender }
export type { IProfile, IBaseProfile, Photo, PhotoProfile }