const ACTIVE_DECK_COOKIE_KEY = "vocapp-active-deck-id";
const ACTIVE_DECK_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function readCookieValue(cookieKey: string) {
    if (typeof document === "undefined") {
        return null;
    }

    const match = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${cookieKey}=`));

    if (!match) {
        return null;
    }

    return decodeURIComponent(match.slice(cookieKey.length + 1));
}

export function getActiveDeckIdCookie() {
    return readCookieValue(ACTIVE_DECK_COOKIE_KEY);
}

export function setActiveDeckIdCookie(deckId: string) {
    if (typeof document === "undefined" || !deckId.trim()) {
        return;
    }

    document.cookie = [
        `${ACTIVE_DECK_COOKIE_KEY}=${encodeURIComponent(deckId)}`,
        "path=/",
        `max-age=${ACTIVE_DECK_COOKIE_MAX_AGE}`,
        "SameSite=Lax",
    ].join("; ");
}

export function clearActiveDeckIdCookie() {
    if (typeof document === "undefined") {
        return;
    }

    document.cookie = [
        `${ACTIVE_DECK_COOKIE_KEY}=`,
        "path=/",
        "max-age=0",
        "SameSite=Lax",
    ].join("; ");
}