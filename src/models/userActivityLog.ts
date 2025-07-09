
type UserAction = "accept_terms" | "refuse_terms" |
                "create_profile" | "update_profile" | "delete_profile";

interface ActionError {
    code: string; // A short error code (e.g., "ERR_CAPACITY")
    message: string; // A detailed error description
    stackTrace?: any; // Optional stack trace for debugging
}

interface UserActivityLog {
    action: UserAction; // e.g., "accept_terms" | "refuse_terms" | "create_profile" |...
    userId: number; // ID of the user performing the action
    versionstamp?: string; // versionstamp when the action occurred without error
    error?: ActionError; // Additional details on an eventual error
    details?: Record<string, any>; // Additional details specific to the action
}

export type { UserActivityLog, UserAction };