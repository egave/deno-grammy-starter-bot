export const VERSION = "V2.0"
export const VERSION_DATE = "07-07-2025" 
export const BOT_USERNAME = "@DenoGrammyStarter_bot";
export const DEV_USERNAME = "@Enguerrand94"

export const MAX_MESSAGE_LENGTH = 4096;

export enum KVKeyNames {
    BOT_STATUS = "botstatus",
    BUGFIXES = "bugfixes", // Technical Key to store if bugfixes already been executed
    CGU = "cgu",
    ERROR_LOGS = "errorlogs",
    ERROR_LOGS_BY_USER = "errorlogsbyuser",
    LOGS = "logs",
    LOGS_BY_USER = "logsbyuser",
    PROFILES = "profiles",
    SESSIONS = "sessions",
    STATS = "stats",
    L2_ACTION = "action",
    L2_ERROR = "error",
    L2_TOTAL_PROFILES = "totalprofiles",
    L3_BY_GENDER = "gender",
    L3_BY_AGE = "age"
}

// Define the KV KEYS that have numeric values as part 2
export const KEY_AS_NUMBER = [KVKeyNames.BOT_STATUS, KVKeyNames.CGU, KVKeyNames.ERROR_LOGS_BY_USER, KVKeyNames.PROFILES, /*KVKeyNames.SESSIONS,*/]; 

export const DEFAULTS = {
    KV: {
        NB_RETRIES: 10, // Number of retries for failed requests
        MIN_WAIT_RETRY_DELAY: 10, // Min delay in milliseconds between retries
        MAX_WAIT_RETRY_DELAY: 50, // Max delay in milliseconds between retries
        EXPIRE_IN: 180 * 24 * 60 * 60 * 1000, // Global kv Key expiration time in milliseconds (180 days)
        GET_MANY_BATCH_SIZE: 10, // Maximum number of keys to fetch in a single batch
    },  
    CONFIG: {
        LANGUAGE: {
            LANGUAGE_TAG: "fr-FR",
            TIMEZONE: "Europe/Paris"
        },
        CONVERSATION: {
            COMMON_OPTIONS: { 
                maxMillisecondsToWait: 60 * 60 * 1000,
                parallel: true
            },
            COMMENT: {
                MIN_LENGTH: 100, // Minimum number of characters for a comment
                MAX_LENGTH: 1000, // Maximum number of characters for a comment
            }
        }
    },
    CGU: {
        NUMBER_TEXTS: 1
    },
    PROFILE: {
        BIRTHDAY_MANDATORY: true, // Require a birthday for creating a profile
    },
    S3: {
        REGION: "eu-west-2"
    }
}

export const BLOQUED = 'kicked';
export const MEMBER = 'member';

export const commandTranslations = {
    version : [
        'version'
    ],
    start : [
        'start', 'demarrer', 'empezar'
    ],
    help : [
        'help', 'aide', 'ayuda'
    ],
    terms : [
        'terms', 'cgu', 'cgu'
    ],
    profile : [
        'profile', 'profil', 'perfil'
    ],
    stats : [
      'stat', 'stats', 'statistics'
    ],
    cancel : [
        'cancel', 'annuler', 'anular'
      ],
    back : [
        'back', 'retour', 'vuelta'
      ],
    quit : [
      'quit', 'quitter', 'salir'
    ],
    skip : [
        'skip', 'passer', 'saltar'
      ]
  };

export const adminCommands = ['info', 'cmds', 'flyer', 'map', 'logctx', 'delctx', 'mig', 'ls', 'lk', 'lv', 'lvs', 'sd', 'ds', 'delkeys', 'add', 'ddd'];