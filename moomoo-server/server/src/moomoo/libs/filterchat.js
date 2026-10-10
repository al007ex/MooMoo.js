import { Filter } from "bad-words";

const chatFilter = new Filter();

export const filter_chat = (chat) => {
    let result = sanitizeMessage(chat);

    for (const term of chatFilter.list) {
        if (!term) continue;
        const regex = new RegExp(escapeRegExp(term), "gi");
        result = result.replace(regex, buildReplacement(term.length));
    }

    return result;
};

function sanitizeMessage(input) {
    const truncated = input.slice(0, 30);
    let sanitized = "";

    for (let i = 0; i < truncated.length; i++) {
        const codePoint = truncated.charCodeAt(i);
        if (codePoint < 0 || codePoint > 126) {
            continue;
        }
        sanitized += truncated.charAt(i);
    }

    return sanitized;
}

function buildReplacement(length) {
    if (!length) return "";
    return "M" + "o".repeat(Math.max(length - 1, 0));
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
