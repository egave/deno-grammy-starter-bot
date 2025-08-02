const MAX_HISTORY = 10; // Maximum number of bot status records to keep

interface IUserBotStatus {
  kicked: boolean;
  when: Date;
}

interface IUserBotStatusHistory {
  userBotStatusHistory: IUserBotStatus[]; // Correctly describes the history as an array of IUserBotStatus
}

class UserBotStatus implements IUserBotStatus {
  kicked: boolean;
  when: Date;

  constructor(kicked: boolean, when: Date) {
    this.kicked = kicked;
    this.when = when;
  }

  static fromObject(obj: Partial<UserBotStatus>): UserBotStatus {
    if (obj.kicked === undefined || obj.when === undefined) {
      throw new Error("Invalid UserBotStatus: missing required fields");
    }
    return new UserBotStatus(obj.kicked, obj.when);
  }
}

class UserBotStatusHistory implements IUserBotStatusHistory {
  userBotStatusHistory: IUserBotStatus[] = [];

  // Adds a new bot status to the history
  addBotStatus(kicked: boolean): void {
    const newStatus = new UserBotStatus(kicked, new Date());
    this.userBotStatusHistory.push(newStatus);

    // Keep only the last 10 records
    if (this.userBotStatusHistory.length > MAX_HISTORY) {
      this.userBotStatusHistory.shift(); // Remove the oldest record
    }
  }

  // Retrieves the last bot status
  getLastBotStatus(): IUserBotStatus | null {
    if (this.userBotStatusHistory.length === 0) {
      return null; // No status available
    }
    return this.userBotStatusHistory[this.userBotStatusHistory.length - 1];
  }

  // Determines if the bot is kicked
  isKicked(): boolean {
    const lastStatus = this.getLastBotStatus();
    return lastStatus ? lastStatus.kicked : false;
  }

  // Static method to create instance from plain object
  static fromObject(obj: Partial<{ userBotStatusHistory: Array<Partial<UserBotStatus>> }>): UserBotStatusHistory {
    const history = new UserBotStatusHistory();
    if (obj.userBotStatusHistory) {
      history.userBotStatusHistory = obj.userBotStatusHistory.map(statusObj => UserBotStatus.fromObject(statusObj));
    }
    return history;
  }
}

export type { IUserBotStatus, IUserBotStatusHistory };
export { UserBotStatus, UserBotStatusHistory };