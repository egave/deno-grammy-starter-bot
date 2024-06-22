import { type ICharter } from '../types/charter.ts'
import { type IProfile } from '../types/profile.ts'
import { Charter, createInitialCharter } from '../types/charter.ts'
import { Profile, createInitialProfile } from '../types/profile.ts'

interface ISessionData {
    data: {
        hasBeenBlocked: boolean
        charter: ICharter,
        profile: IProfile | undefined
    }
}

class SessionData implements ISessionData {
    data: {
        hasBeenBlocked: boolean
        charter: Charter,
        profile: Profile | undefined
    }

  constructor (_charter: Charter, _profile: Profile | undefined) {
    this.data = {
        hasBeenBlocked: false,
        charter: _charter,
        profile: _profile
    };
  }

  getData () {
    return this.data;
  }

  getHasBeenBlocked (){
    return this.data.hasBeenBlocked;
  }

  getCharter (){
    return this.data.charter;
  }

  getProfile (){
    return this.data.profile;
  }

  setHasBeenBlocked (_hasBeenBlocked: boolean){
    this.data.hasBeenBlocked = _hasBeenBlocked;
  }

  setCharter (_charter: Charter){
    this.data.charter = _charter;
  }

  setProfile (_profile: Profile){
    this.data.profile = _profile;
  }

  static toJSON (_sessionData: SessionData) {
    return {
        data : {
            hasBeenBlocked: _sessionData.data.hasBeenBlocked,
            charter: _sessionData.data.charter,
            profile: _sessionData.data.profile
            }
        };
  }
  
//   static fromJSON (json: ISessionData) {
//     return new SessionData(json.data.charter, json.data.profile);
//   }
}

export function initSessionData() {

    const initialCharter = createInitialCharter();
    const initialProfile = createInitialProfile();
  
    const initialData = new SessionData(initialCharter, initialProfile);
    
    return initialData.getData()
  }

export { type ISessionData, SessionData }
