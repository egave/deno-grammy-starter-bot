interface ICharter {
    hasSignedUp: boolean,
    signatureDate: Date | undefined,
}

class Charter implements ICharter {
    hasSignedUp: boolean
    signatureDate: Date | undefined

  constructor (_hasSignedUp: boolean, _signatureDate: Date | undefined) {
    this.hasSignedUp = _hasSignedUp,
    this.signatureDate = _signatureDate
  };

  getCharter () {
    return this;
  }

  getHasSignedUp () {
    return this.hasSignedUp;
  }

  getSignatureDate () {
    return this.signatureDate;
  }
}


export function createInitialCharter() {
    return new Charter(false, undefined);
  }

export function refuseCharter(): Charter {
  return new Charter(false, new Date());
}

export function acceptCharter(): Charter {
  return new Charter(true, new Date());
}

export { type ICharter, Charter }  