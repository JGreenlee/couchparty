import type { QpaData } from "../../../../back/src/Games/Quail/QuailGameData";

export function calculateScale(minWidth, maxWidth, minHeight, maxHeight) {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    if (vw < minWidth || vh < minHeight) {
        const wScale = vw / minWidth, hScale = vh / minHeight
        document.documentElement.style.fontSize = 118 * Math.min(wScale, hScale) + '%';
    } else if (vw > maxWidth || vh > maxHeight) {
        const wScale = vw / maxWidth, hScale = vh / maxHeight;
        document.documentElement.style.fontSize = 118 * Math.max(wScale, hScale) + '%';
    }
}

export function promptIsVoted(qpa: { promptId?: QpaData[] } | undefined, promptId: string) {
    if (qpa && qpa[promptId].find(o => o.finished)) {
        return true;
    } else {
        return false;
    }
}

export function promptIsTallied(qpa: { promptId?: QpaData[] }, promptId: string) {
    if (qpa[promptId].find((o: QpaData) => o.finished == 'tallied')) {
        return true;
    } else {
        return false;
    }
}

// sift through qPromptAnswers to find the first entry that isn't marked 'finished'
export function getCurrentPromptIndex(qpa: { promptId?: QpaData[] }, keys) {
    for (let i = 0; i < keys.length; i++) {
        if (!promptIsTallied(qpa, keys[i])) {
            return i;
        }
    }
    return undefined;
}

export function findBallotIndex(qpa: { promptId?: QpaData[] }, param: string) {
    let bi: number | undefined = param ? Number(param) : undefined;

    // if bi not given, we get bi ourselves
    bi ||= getCurrentPromptIndex(qpa, Object.keys(qpa));

    if (bi != undefined) {
        let read = readPromptIdAtIndex(qpa, bi);
        return read;
    } else {
        return undefined;
    }
}

export function readPromptIdAtIndex(qpa: { promptId?: QpaData[] }, bi: number): string | undefined {
    if (qpa) {
        const keys = Object.keys(qpa);
        if (!promptIsTallied(qpa, keys[bi])) {
            return keys[bi];
        }
    }
    return undefined;
}