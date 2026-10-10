// NAME FILTER
// The word list the official client checks names against: bad-words' list as bundled in
// vendor-*.js (which also has "qweir") plus the extra words the game adds to it
// (qc.addWords(...) in index-*.js). A name containing any of them shows as "unknown".

import { Filter } from "bad-words";

const CLIENT_EXTRA_WORDS = ["jew", "black", "baby", "child", "white", "porn", "pedo", "trump", "clinton", "hitler", "nazi", "gay", "pride", "sex", "pleasure", "touch", "poo", "kids", "rape", "white power", "nigga", "nig nog", "doggy", "rapist", "boner", "nigger", "nigg", "finger", "nogger", "nagger", "nig", "fag", "gai", "pole", "stripper", "penis", "vagina", "pussy", "nazi", "hitler", "stalin", "burn", "chamber", "cock", "peen", "dick", "spick", "nieger", "die", "satan", "n|ig", "nlg", "cunt", "c0ck", "fag", "lick", "condom", "anal", "shit", "phile", "little", "kids", "free KR", "tiny", "sidney", "ass", "kill", ".io", "(dot)", "[dot]", "mini", "whiore", "whore", "faggot", "github", "1337", "666", "satan", "senpa", "discord", "d1scord", "mistik", ".io", "senpa.io", "sidney", "sid", "senpaio", "vries", "asa"];

const filter = new Filter();
filter.addWords("qweir", ...CLIENT_EXTRA_WORDS);

export const NAME_WORDS = filter.list;

// What Player.setUserData turns a requested name into, and whether it trips the filter.
export function gameName(raw, maxLength = 15) {
    let name = String(raw ?? "").slice(0, maxLength);
    name = name.replace(/[^\w:\(\)\/? -]+/gmi, " ");
    name = name.replace(/[^\x00-\x7F]/g, " ");
    name = name.trim();
    const converted = name.toLowerCase().replace(/\s/g, "").replace(/1/g, "i").replace(/0/g, "o").replace(/5/g, "s");
    const profane = NAME_WORDS.some(word => converted.indexOf(word) != -1);
    return { name, profane };
}

// Whole-word check for short things like clan tags and social handles.
export function isRude(text) {
    const value = String(text ?? "");
    return filter.isProfane(value) || NAME_WORDS.includes(value.toLowerCase());
}
