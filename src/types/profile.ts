enum Gender {
    Man = "Man",
    Woman = "Woman"
}

type BaseProfile = {
    gender: Gender,
    age: number,
    postal_code: number,
    bio: string,
    userId: number,
    username: string | undefined
    firstName: string | undefined,
    lastName: string | undefined
}

type Photo = {
    file_id: string,
    file_unique_id: string,
    file_size: number | undefined,
    width: number,
    height: number
}

type PhotoProfile = Photo[];

// ["users", "profile", userId]
interface IProfile {
    creationDate: Date,
    baseProfile: BaseProfile,
    photos: PhotoProfile | undefined
}

class Profile implements IProfile {
    creationDate: Date
    baseProfile: BaseProfile
    photos: PhotoProfile | undefined

    constructor (_creationDate: Date, _baseProfile: BaseProfile, _photos?: PhotoProfile | undefined) {
      this.creationDate = _creationDate;
      this.baseProfile = _baseProfile;
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

  getPhotos () {
    return this.photos;
  }
}

export function createInitialProfile() {
    return undefined;
  }

export { Gender }
export type { BaseProfile, Photo, PhotoProfile }
export { type IProfile, Profile }