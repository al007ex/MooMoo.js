// PROTOCOL CONSTANTS
// Mirrors the constants block of the official client bundle (index-*.js).
// Client names are given in brackets so the two can be compared side by side.

// [Is] handshake mode: keyed transport (HMAC tag + sequence numbers).
export const MODE_KEYED = 1;

// [Mo] bytes of HMAC-SHA256 tag prepended to every client -> server frame.
export const MAC_LENGTH = 6;

// [gf] salt used for the packet tables when the connection is NOT build-pinned.
export const LEGACY_SALT = 1;

// [yf] / [kf] how many names an un-pinned connection gets in each table.
export const LEGACY_C2S_COUNT = 17;
export const LEGACY_S2C_COUNT = 36;

// [Fl] client -> server packet names (table order matters: it is what gets shuffled).
export const C2S_PACKETS = ["M", "D", "9", "e", "F", "z", "H", "K", "L", "N", "b", "P", "Q", "c", "6", "S", "0", "T", "R", "A", "V"];

// [ql] server -> client packet names.
export const S2C_PACKETS = ["A", "B", "C", "D", "E", "a", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z", "g", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "W", "F"];

// Mixing constants used by the client ([Ql], [Sf], [Ef], [Kl]).
export const TABLE_SALT_MULT = 2654435761;
export const TABLE_S2C_XOR = 2246822507;
export const MASK_C2S_XOR = 3266489909;
export const MASK_S2C_XOR = 668265263;
export const MASK_COUNTER_MULT = 2654435761;
export const MASK_ZERO_SEED = 1831565813;

// WebSocket close codes understood by the client's onclose handler.
export const CLOSE = {
    INVALID_CONNECTION: 4001, // "Invalid Connection"
    GAME_UPDATED: 4002,       // "Game updated - please reload"
    SIGN_IN_REQUIRED: 4003,   // "Sign in to play on this server"
    WRONG_ORIGIN: 4004        // "Please play at moomoo.io"
};

// Human readable names for every packet (used by logs / README / anticheat config).
export const PACKET_NAMES = {
    c2s: {
        M: "spawn", D: "aim", 9: "move", e: "resetMove", F: "mouse", z: "selectItem", H: "upgrade",
        K: "toggle (0 = lock rotation, 1 = auto gather)", L: "createTribe", N: "leaveTribe", b: "requestJoin",
        P: "answerJoinRequest", Q: "kickMember", c: "store", 6: "chat", S: "mapPing", 0: "ping",
        T: "telemetry (anti-tamper flags, untrusted events)", R: "report / staff action", A: "admin command", V: "statsPeriod"
    },
    s2c: {
        A: "initData", B: "disconnect", C: "setupGame", D: "addPlayer", E: "removePlayer", a: "updatePlayers",
        G: "leaderboard", H: "loadObjects", I: "updateAnimals", J: "animalAttack", K: "gatherAnimation", L: "wiggle",
        M: "turretShoot", N: "playerValue", O: "health", P: "killPlayer", Q: "killObject", R: "killObjects",
        S: "itemCount", T: "age", U: "upgrades", V: "items", X: "addProjectile", Y: "removeProjectile",
        Z: "shutdownNotice", g: "addTribe", 1: "deleteTribe", 2: "joinRequest", 3: "setTribe", 4: "tribeMembers",
        5: "storeUpdate", 6: "chat", 7: "minimap", 8: "showText", 9: "mapPing", 0: "pong", W: "effect", F: "stats"
    }
};
