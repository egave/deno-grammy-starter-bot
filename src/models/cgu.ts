interface ICGU {
    hasSignedUp: boolean,
    signatureDate: Date | undefined,
}

class CGU implements ICGU {
    hasSignedUp: boolean
    signatureDate: Date | undefined

  constructor (_hasSignedUp: boolean, _signatureDate: Date | undefined) {
    this.hasSignedUp = _hasSignedUp,
    this.signatureDate = _signatureDate
  };

  getCGU () {
    return this;
  }

  getHasSignedUp () {
    return this.hasSignedUp;
  }

  getSignatureDate () {
    return this.signatureDate;
  }
}


export function createInitialCGU() {
    return new CGU(false, undefined);
  }

export function refuseCGU(): CGU {
  return new CGU(false, new Date());
}

export function acceptCGU(): CGU {
  return new CGU(true, new Date());
}

export { type ICGU, CGU }  