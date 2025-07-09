interface ISessionData {
    data: {
        route: string
    }
}

class SessionData implements ISessionData {
    data: {
        route: string
    }

  constructor() {
    this.data = {
        route: 'idle'
    };
  }

  getData() {
    return this.data;
  }

  getRoute() {
    return this.data.route;
  }

  setRoute(route: string) {
    this.data.route = route;
  }

  static toJSON (_sessionData: SessionData) {
    return {
        data : {
            route: _sessionData.data.route
        }
    };
  }
}

export function initSessionData() {
    const initialData = new SessionData();
    
    return initialData.getData()
  }

export { type ISessionData, SessionData }
