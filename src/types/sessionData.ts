import { type ICharter } from '../types/charter.ts'
import { type IProfile } from '../types/profile.ts'
import { Charter, createInitialCharter } from '../types/charter.ts'
import { Profile, createInitialProfile } from '../types/profile.ts'

interface ISessionData {
    data: {
        charter: ICharter,
        profile: IProfile | undefined
    }
}

class SessionData implements ISessionData {
    data: {
        charter: Charter,
        profile: Profile | undefined
    }

  constructor (_charter: Charter, _profile: Profile | undefined) {
    this.data = {
        charter: _charter,
        profile: _profile
    };
  }

  getData () {
    return this.data;
  }

  getCharter (){
    return this.data.charter;
  }

  getProfile (){
    return this.data.profile;
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
